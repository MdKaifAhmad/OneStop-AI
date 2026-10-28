const express = require('express');
const router = express.Router();
const History = require('../models/History');
const { protect } = require('../middleware/auth');

// @route   GET /api/history
// @desc    Get non-expired history for authenticated user
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const history = await History.find({
      userId: req.user._id,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/history/:id
// @desc    Delete a specific history entry owned by user
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const item = await History.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'History not found' });
    }

    if (item.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this record' });
    }

    await item.deleteOne();
    res.json({ success: true, message: 'History deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
