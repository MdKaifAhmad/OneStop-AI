const express = require('express');
const router = express.Router();
const axios = require('axios');
const History = require('../models/History');
const CollegeCutoff = require('../models/CollegeCutoff');
const { optionalAuth } = require('../middleware/auth');
const { importJosaaCutoffs } = require('../utils/csvImporter');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @route   POST /api/college-prediction/predict
// @desc    Predict eligible colleges with RAG + JoSAA cutoff data
// @access  Public / Authenticated
router.post('/predict', optionalAuth, async (req, res, next) => {
  try {
    const { examRankPercentile, examType, preferredCourse } = req.body;

    if (!examRankPercentile) {
      return res.status(400).json({
        success: false,
        message: 'examRankPercentile is required',
      });
    }

    if (examType && examType.toLowerCase().includes('neet')) {
      return res.status(400).json({
        success: false,
        message: 'NEET is not supported by the engineering JoSAA cutoff database',
      });
    }

    // Call FastAPI RAG microservice
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/ai/college-rag`, req.body);
    const predictionData = aiResponse.data;

    // Save history only for authenticated users
    if (req.user) {
      try {
        await History.create({
          userId: req.user._id,
          module: 'COLLEGE_FINDER',
          title: `College Prediction (Rank: ${examRankPercentile}, Course: ${preferredCourse || 'All'})`,
          requestData: req.body,
          responseData: predictionData,
        });
      } catch (err) {
        console.error('College history save failed:', err.message);
      }
    }

    res.json(predictionData);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    next(error);
  }
});

// @route   POST /api/college-cutoffs/import/josaa
// @desc    Trigger streaming CSV ingestion of JoSAA cutoffs into MongoDB
// @access  Public / Admin
router.post('/import/josaa', async (req, res, next) => {
  try {
    const count = await importJosaaCutoffs();
    res.json({
      success: true,
      message: 'JoSAA previous-year cutoffs imported into MongoDB successfully',
      recordsImported: count,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
