const mongoose = require('mongoose');

const collegeCutoffSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, index: true },
    exam: { type: String, required: true, index: true },
    counsellingAuthority: { type: String, default: 'JoSAA', index: true },
    college: { type: String, required: true, index: true },
    collegeType: { type: String, default: null },
    state: { type: String, default: null },
    course: { type: String, default: 'B.Tech' },
    branch: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    gender: { type: String, required: true },
    pwd: { type: Boolean, default: false },
    quota: { type: String, required: true },
    rankType: { type: String, default: 'RANK' },
    openingRank: { type: Number, default: null },
    closingRank: { type: Number, default: null },
    openingPercentile: { type: Number, default: null },
    closingPercentile: { type: Number, default: null },
    openingScore: { type: Number, default: null },
    closingScore: { type: Number, default: null },
    sourceName: { type: String, default: 'JoSAA Official' },
    sourceUrl: { type: String, default: 'https://josaa.nic.in/or-cr/' },
  },
  {
    timestamps: true,
  }
);

// Compound index for lightning-fast matching queries
collegeCutoffSchema.index({
  year: 1,
  counsellingAuthority: 1,
  category: 1,
  gender: 1,
  quota: 1,
});

module.exports = mongoose.model('CollegeCutoff', collegeCutoffSchema);
