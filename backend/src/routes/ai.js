const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Generate questions for a product
router.post('/generate-questions', async (req, res) => {
  try {
    const { product, context, type = 'initial' } = req.body;

    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Product information is required'
      });
    }

    // Call AI service
    const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/generate-questions`, {
      product,
      context,
      type
    });

    res.json({
      success: true,
      data: aiResponse.data
    });
  } catch (error) {
    console.error('AI question generation error:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        message: 'AI service error',
        error: error.response.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to generate questions'
      });
    }
  }
});

// Calculate transparency score
router.post('/transparency-score', async (req, res) => {
  try {
    const { product, questions } = req.body;

    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Product information is required'
      });
    }

    // Call AI service
    const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/transparency-score`, {
      product,
      questions
    });

    res.json({
      success: true,
      data: aiResponse.data
    });
  } catch (error) {
    console.error('AI scoring error:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        message: 'AI service error',
        error: error.response.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to calculate transparency score'
      });
    }
  }
});

// Get AI service health status
router.get('/health', async (req, res) => {
  try {
    const aiResponse = await axios.get(`${process.env.AI_SERVICE_URL}/health`);
    
    res.json({
      success: true,
      data: aiResponse.data
    });
  } catch (error) {
    console.error('AI health check error:', error);
    
    res.status(503).json({
      success: false,
      message: 'AI service is unavailable',
      error: error.message
    });
  }
});

module.exports = router; 