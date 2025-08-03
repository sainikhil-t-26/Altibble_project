const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const axios = require('axios');

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware
const validateAnswer = [
  body('value').trim().notEmpty().withMessage('Answer value is required')
];

// Get questions for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product belongs to user
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        submittedBy: req.user.id
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const questions = await prisma.question.findMany({
      where: { productId },
      include: {
        answers: true,
        followUps: {
          include: {
            answers: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      data: { questions }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch questions'
    });
  }
});

// Submit answer for a question
router.post('/:questionId/answer', validateAnswer, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { questionId } = req.params;
    const { value } = req.body;

    // Check if question exists and belongs to user's product
    const question = await prisma.question.findFirst({
      where: {
        id: questionId
      },
      include: {
        product: {
          where: {
            submittedBy: req.user.id
          }
        }
      }
    });

    if (!question || !question.product) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Create or update answer
    const answer = await prisma.answer.upsert({
      where: {
        questionId_productId: {
          questionId,
          productId: question.product.id
        }
      },
      update: {
        value
      },
      create: {
        value,
        questionId,
        productId: question.product.id
      }
    });

    // Generate follow-up questions using AI service
    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/generate-questions`, {
        context: {
          product: question.product,
          question: question.text,
          answer: value,
          category: question.category
        },
        type: 'followup'
      });

      if (aiResponse.data.questions && aiResponse.data.questions.length > 0) {
        const followUpQuestions = aiResponse.data.questions.map((q, index) => ({
          text: q.text,
          type: q.type || 'TEXT',
          category: q.category || 'followup',
          isRequired: q.isRequired || false,
          order: index + 1,
          parentId: questionId,
          productId: question.product.id
        }));

        await prisma.question.createMany({
          data: followUpQuestions
        });
      }
    } catch (aiError) {
      console.error('AI service error:', aiError);
      // Continue without AI follow-up questions if service is unavailable
    }

    res.json({
      success: true,
      message: 'Answer submitted successfully',
      data: { answer }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer'
    });
  }
});

// Update answer
router.put('/:questionId/answer', validateAnswer, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { questionId } = req.params;
    const { value } = req.body;

    // Check if question exists and belongs to user's product
    const question = await prisma.question.findFirst({
      where: {
        id: questionId
      },
      include: {
        product: {
          where: {
            submittedBy: req.user.id
          }
        }
      }
    });

    if (!question || !question.product) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Update answer
    const answer = await prisma.answer.update({
      where: {
        questionId_productId: {
          questionId,
          productId: question.product.id
        }
      },
      data: { value }
    });

    res.json({
      success: true,
      message: 'Answer updated successfully',
      data: { answer }
    });
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update answer'
    });
  }
});

// Delete answer
router.delete('/:questionId/answer', async (req, res) => {
  try {
    const { questionId } = req.params;

    // Check if question exists and belongs to user's product
    const question = await prisma.question.findFirst({
      where: {
        id: questionId
      },
      include: {
        product: {
          where: {
            submittedBy: req.user.id
          }
        }
      }
    });

    if (!question || !question.product) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Delete answer
    await prisma.answer.delete({
      where: {
        questionId_productId: {
          questionId,
          productId: question.product.id
        }
      }
    });

    res.json({
      success: true,
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete answer'
    });
  }
});

// Get all answers for a product
router.get('/product/:productId/answers', async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product belongs to user
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        submittedBy: req.user.id
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const answers = await prisma.answer.findMany({
      where: { productId },
      include: {
        question: true
      },
      orderBy: {
        question: {
          order: 'asc'
        }
      }
    });

    res.json({
      success: true,
      data: { answers }
    });
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch answers'
    });
  }
});

// Generate additional questions for a product
router.post('/product/:productId/generate', async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product belongs to user
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        submittedBy: req.user.id
      },
      include: {
        questions: {
          include: {
            answers: true
          }
        },
        answers: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Generate additional questions using AI service
    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/generate-questions`, {
        product: {
          name: product.name,
          category: product.category,
          manufacturer: product.manufacturer,
          description: product.description,
          ingredients: product.ingredients
        },
        existingQuestions: product.questions.map(q => ({
          text: q.text,
          category: q.category,
          answers: q.answers
        })),
        type: 'additional'
      });

      if (aiResponse.data.questions && aiResponse.data.questions.length > 0) {
        const currentMaxOrder = Math.max(...product.questions.map(q => q.order), 0);
        
        const newQuestions = aiResponse.data.questions.map((q, index) => ({
          text: q.text,
          type: q.type || 'TEXT',
          category: q.category || 'general',
          isRequired: q.isRequired || false,
          order: currentMaxOrder + index + 1,
          productId
        }));

        const createdQuestions = await prisma.question.createMany({
          data: newQuestions
        });

        res.json({
          success: true,
          message: 'Additional questions generated successfully',
          data: {
            questionsGenerated: createdQuestions.count
          }
        });
      } else {
        res.json({
          success: true,
          message: 'No additional questions generated',
          data: {
            questionsGenerated: 0
          }
        });
      }
    } catch (aiError) {
      console.error('AI service error:', aiError);
      res.status(500).json({
        success: false,
        message: 'Failed to generate additional questions'
      });
    }
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate questions'
    });
  }
});

module.exports = router; 