const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const axios = require('axios');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Validation middleware
const validateProduct = [
  body('name').trim().isLength({ min: 2 }).withMessage('Product name must be at least 2 characters long'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('manufacturer').trim().notEmpty().withMessage('Manufacturer is required'),
  body('description').optional().trim(),
  body('ingredients').optional().trim(),
  body('barcode').optional().trim()
];

// Get all products for current user
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      submittedBy: req.user.id,
      ...(status && { status }),
      ...(category && { category })
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          questions: {
            include: {
              answers: true
            }
          },
          _count: {
            select: {
              questions: true,
              answers: true,
              reports: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        submittedBy: req.user.id
      },
      include: {
        questions: {
          include: {
            answers: true,
            followUps: {
              include: {
                answers: true
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        answers: true,
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// Create new product
router.post('/', validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      name,
      category,
      manufacturer,
      description,
      ingredients,
      barcode
    } = req.body;

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        category,
        manufacturer,
        description,
        ingredients,
        barcode,
        submittedBy: req.user.id
      }
    });

    // Generate initial questions using AI service
    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/generate-questions`, {
        product: {
          name,
          category,
          manufacturer,
          description,
          ingredients
        }
      });

      if (aiResponse.data.questions && aiResponse.data.questions.length > 0) {
        const questions = aiResponse.data.questions.map((q, index) => ({
          text: q.text,
          type: q.type || 'TEXT',
          category: q.category || 'general',
          isRequired: q.isRequired || false,
          order: index + 1,
          productId: product.id
        }));

        await prisma.question.createMany({
          data: questions
        });
      }
    } catch (aiError) {
      console.error('AI service error:', aiError);
      // Continue without AI questions if service is unavailable
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// Update product
router.put('/:id', validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
      name,
      category,
      manufacturer,
      description,
      ingredients,
      barcode
    } = req.body;

    // Check if product exists and belongs to user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        submittedBy: req.user.id
      }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        category,
        manufacturer,
        description,
        ingredients,
        barcode
      }
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// Upload product image
router.post('/:id/image', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Check if product exists and belongs to user
    const product = await prisma.product.findFirst({
      where: {
        id,
        submittedBy: req.user.id
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product with image URL
    const imageUrl = `/uploads/${req.file.filename}`;
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { imageUrl }
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: { 
        product: updatedProduct,
        imageUrl 
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists and belongs to user
    const product = await prisma.product.findFirst({
      where: {
        id,
        submittedBy: req.user.id
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete product (cascade will handle related data)
    await prisma.product.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// Submit product for review
router.post('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists and belongs to user
    const product = await prisma.product.findFirst({
      where: {
        id,
        submittedBy: req.user.id
      },
      include: {
        questions: {
          include: {
            answers: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if all required questions are answered
    const requiredQuestions = product.questions.filter(q => q.isRequired);
    const answeredQuestions = product.questions.filter(q => 
      q.answers && q.answers.length > 0
    );

    if (requiredQuestions.length > answeredQuestions.length) {
      return res.status(400).json({
        success: false,
        message: 'Please answer all required questions before submitting'
      });
    }

    // Update product status
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { status: 'SUBMITTED' }
    });

    res.json({
      success: true,
      message: 'Product submitted for review',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Submit product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit product'
    });
  }
});

module.exports = router; 