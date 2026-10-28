const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    module: {
      type: String,
      enum: ['PLACEMENT', 'SCHOLARSHIP', 'COLLEGE_FINDER'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    requestData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    responseData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 din baad auto-expire
      index: { expires: '0s' }, // MongoDB automatic TTL expiry index
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: User ki history fast fetch karne ke liye
historySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('History', historySchema);
