const express = require('express');
const router = express.Router();
const axios = require('axios');
const History = require('../models/History');
const { optionalAuth } = require('../middleware/auth');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @route   POST /api/placement/generate
// @desc    Generate placement preparation roadmap & questions via LangGraph AI
// @access  Public (Guest friendly) / Private (Saves to History if authenticated)
router.post('/generate', optionalAuth, async (req, res, next) => {
  try {
    const { targetCompany, targetRole, timeLeftDays } = req.body;

    if (!targetCompany || !targetRole || !timeLeftDays) {
      return res.status(400).json({
        success: false,
        message: 'targetCompany, targetRole, and timeLeftDays are required',
      });
    }

    // Call FastAPI LangGraph AI microservice
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/ai/placement`, {
      targetCompany,
      targetRole,
      timeLeftDays: parseInt(timeLeftDays),
    });

    const planData = aiResponse.data;

    // Save history only if user is logged in
    if (req.user) {
      try {
        await History.create({
          userId: req.user._id,
          module: 'PLACEMENT',
          title: `${targetCompany} - ${targetRole}`,
          requestData: req.body,
          responseData: planData,
        });
      } catch (historyErr) {
        console.error('History save failed:', historyErr.message);
      }
    }

    res.json(planData);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    next(error);
  }
});

module.exports = router;
