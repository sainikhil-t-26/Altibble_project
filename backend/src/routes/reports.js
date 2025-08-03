const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const router = express.Router();
const prisma = new PrismaClient();

// Generate PDF report for a product
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
        user: {
          select: {
            name: true,
            company: true
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

    // Calculate transparency scores using AI service
    let transparencyScore = null;
    let healthScore = null;
    let environmentalScore = null;
    let socialScore = null;

    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/transparency-score`, {
        product: {
          name: product.name,
          category: product.category,
          manufacturer: product.manufacturer,
          description: product.description,
          ingredients: product.ingredients
        },
        questions: product.questions.map(q => ({
          text: q.text,
          category: q.category,
          answers: q.answers
        }))
      });

      if (aiResponse.data.scores) {
        transparencyScore = aiResponse.data.scores.transparency || null;
        healthScore = aiResponse.data.scores.health || null;
        environmentalScore = aiResponse.data.scores.environmental || null;
        socialScore = aiResponse.data.scores.social || null;
      }
    } catch (aiError) {
      console.error('AI service error:', aiError);
      // Continue without AI scoring if service is unavailable
    }

    // Update product with scores
    await prisma.product.update({
      where: { id: productId },
      data: {
        transparencyScore,
        healthScore,
        environmentalScore,
        socialScore
      }
    });

    // Generate PDF report
    const reportFileName = `transparency-report-${productId}-${Date.now()}.pdf`;
    const reportPath = path.join(__dirname, '../../uploads', reportFileName);

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    const stream = fs.createWriteStream(reportPath);
    doc.pipe(stream);

    // Add header
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('Product Transparency Report', { align: 'center' })
       .moveDown();

    doc.fontSize(12)
       .font('Helvetica')
       .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' })
       .moveDown(2);

    // Product Information
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('Product Information')
       .moveDown();

    doc.fontSize(12)
       .font('Helvetica')
       .text(`Name: ${product.name}`)
       .text(`Category: ${product.category}`)
       .text(`Manufacturer: ${product.manufacturer}`)
       .text(`Submitted by: ${product.user.name}`)
       .text(`Company: ${product.user.company || 'N/A'}`)
       .moveDown();

    if (product.description) {
      doc.text(`Description: ${product.description}`).moveDown();
    }

    if (product.ingredients) {
      doc.text(`Ingredients: ${product.ingredients}`).moveDown();
    }

    // Transparency Scores
    if (transparencyScore !== null) {
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text('Transparency Scores')
         .moveDown();

      doc.fontSize(12)
         .font('Helvetica');

      if (transparencyScore !== null) {
        doc.text(`Overall Transparency Score: ${(transparencyScore * 100).toFixed(1)}%`);
      }
      if (healthScore !== null) {
        doc.text(`Health Impact Score: ${(healthScore * 100).toFixed(1)}%`);
      }
      if (environmentalScore !== null) {
        doc.text(`Environmental Impact Score: ${(environmentalScore * 100).toFixed(1)}%`);
      }
      if (socialScore !== null) {
        doc.text(`Social Impact Score: ${(socialScore * 100).toFixed(1)}%`);
      }
      doc.moveDown();
    }

    // Questions and Answers
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('Transparency Assessment')
       .moveDown();

    product.questions.forEach((question, index) => {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(`${index + 1}. ${question.text}`)
         .moveDown(0.5);

      const answer = question.answers[0];
      if (answer) {
        doc.fontSize(12)
           .font('Helvetica')
           .text(`Answer: ${answer.value}`)
           .moveDown();
      } else {
        doc.fontSize(12)
           .font('Helvetica-Oblique')
           .text('Answer: Not provided')
           .moveDown();
      }

      // Follow-up questions
      if (question.followUps && question.followUps.length > 0) {
        question.followUps.forEach((followUp, fIndex) => {
          doc.fontSize(11)
             .font('Helvetica-Bold')
             .text(`   ${index + 1}.${fIndex + 1} ${followUp.text}`)
             .moveDown(0.5);

          const followUpAnswer = followUp.answers[0];
          if (followUpAnswer) {
            doc.fontSize(10)
               .font('Helvetica')
               .text(`   Answer: ${followUpAnswer.value}`)
               .moveDown();
          } else {
            doc.fontSize(10)
               .font('Helvetica-Oblique')
               .text('   Answer: Not provided')
               .moveDown();
          }
        });
      }
    });

    // Recommendations
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('Recommendations')
       .moveDown();

    doc.fontSize(12)
       .font('Helvetica')
       .text('Based on the transparency assessment, consider the following:')
       .moveDown();

    const recommendations = [
      'Review and improve ingredient transparency',
      'Provide more detailed supply chain information',
      'Consider environmental impact in production processes',
      'Ensure fair labor practices throughout the supply chain',
      'Regularly update transparency information'
    ];

    recommendations.forEach((rec, index) => {
      doc.text(`• ${rec}`);
    });

    doc.moveDown();

    // Footer
    doc.fontSize(10)
       .font('Helvetica-Oblique')
       .text('This report was generated by Altibbe | Hedamo Product Transparency Platform', { align: 'center' });

    doc.end();

    // Wait for PDF to be written
    stream.on('finish', async () => {
      // Save report record to database
      const report = await prisma.report.create({
        data: {
          productId,
          generatedBy: req.user.id,
          reportUrl: `/uploads/${reportFileName}`,
          score: transparencyScore,
          summary: `Transparency report for ${product.name}`
        }
      });

      res.json({
        success: true,
        message: 'Report generated successfully',
        data: {
          report,
          downloadUrl: `/uploads/${reportFileName}`
        }
      });
    });

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report'
    });
  }
});

// Get all reports for a product
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

    const reports = await prisma.report.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { reports }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// Get all reports for current user
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { generatedBy: req.user.id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              manufacturer: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.report.count({
        where: { generatedBy: req.user.id }
      })
    ]);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// Download report
router.get('/:reportId/download', async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        generatedBy: req.user.id
      },
      include: {
        product: {
          where: {
            submittedBy: req.user.id
          }
        }
      }
    });

    if (!report || !report.product) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    const filePath = path.join(__dirname, '../..', report.reportUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Report file not found'
      });
    }

    res.download(filePath, `transparency-report-${report.product.name}.pdf`);
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download report'
    });
  }
});

module.exports = router; 