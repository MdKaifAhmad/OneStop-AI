const express = require('express');
const router = express.Router();
const axios = require('axios');
const History = require('../models/History');
const { optionalAuth } = require('../middleware/auth');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @route   POST /api/scholarships/find
// @desc    Match scholarships with strict eligibility verification
// @access  Public / Authenticated
router.post('/find', optionalAuth, async (req, res, next) => {
  try {
    const {
      state,
      category,
      annualFamilyIncome,
      course,
      educationStage,
      currentYear,
      lastQualifyingExam,
      lastQualifyingExamPercentage,
      gender,
      pwd,
      parentOccupation,
    } = req.body;

    if (
      !state ||
      !category ||
      annualFamilyIncome === undefined ||
      !educationStage ||
      !lastQualifyingExamPercentage
    ) {
      return res.status(400).json({
        success: false,
        message: 'All core scholarship fields are required',
      });
    }

    // Call FastAPI Scholarship Matching Service
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/ai/scholarship`, {
      state,
      category,
      annualFamilyIncome: parseFloat(annualFamilyIncome),
      course: course || 'General',
      educationStage,
      currentYear: currentYear || '1st Year',
      lastQualifyingExam: lastQualifyingExam || '12th',
      lastQualifyingExamPercentage: parseFloat(lastQualifyingExamPercentage),
      gender: gender || 'Any',
      pwd: Boolean(pwd),
      parentOccupation: parentOccupation || 'Other',
    });

    const scholarshipData = aiResponse.data;

    // Save history only for logged-in users
    if (req.user) {
      try {
        await History.create({
          userId: req.user._id,
          module: 'SCHOLARSHIP',
          title: `Scholarships for ${category} - ${state}`,
          requestData: req.body,
          responseData: scholarshipData,
        });
      } catch (err) {
        console.error('Scholarship history save failed:', err.message);
      }
    }

    res.json(scholarshipData);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    next(error);
  }
});

module.exports = router;
