import React, { useState } from 'react';
import { GraduationCap, ShieldCheck, Target, Flame, Sparkles, AlertCircle } from 'lucide-react';
import API from '../services/api';

const CollegeTab = () => {
  const [formData, setFormData] = useState({
    examType: 'JEE Main',
    examRankPercentile: '4500',
    rankType: 'RANK',
    category: 'General',
    gender: 'Gender-Neutral',
    quota: 'All India',
    preferredCourse: 'CSE',
    targetCollege: 'NIT Trichy',
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const res = await API.post('/college-prediction/predict', formData);
      setPrediction(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'College prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-blue-400 tracking-wider uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          RAG-Powered Cutoff Engine
        </span>
        <h1 className="text-2xl font-extrabold text-white mt-2">
          JoSAA College Predictor & Cutoff Analyzer
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Powered by Retrieval-Augmented Generation (RAG) over verified JoSAA opening & closing ranks for IITs, NITs, IIITs, and GFTIs.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl">
        <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Entrance Exam <span className="text-blue-400">*</span>
            </label>
            <select
              name="examType"
              value={formData.examType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="JEE Main">JEE Main (NITs, IIITs, GFTIs)</option>
              <option value="JEE Advanced">JEE Advanced (IITs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              All India Rank (AIR) <span className="text-blue-400">*</span>
            </label>
            <input
              type="number"
              name="examRankPercentile"
              required
              min={1}
              value={formData.examRankPercentile}
              onChange={handleChange}
              placeholder="e.g. 4500"
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category <span className="text-blue-400">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="General">OPEN / General</option>
              <option value="OBC">OBC-NCL</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">GEN-EWS</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Seat Quota <span className="text-blue-400">*</span>
            </label>
            <select
              name="quota"
              value={formData.quota}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="All India">All India (AI)</option>
              <option value="Home State">Home State (HS)</option>
              <option value="Other State">Other State (OS)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Preferred Course / Branch <span className="text-blue-400">*</span>
            </label>
            <select
              name="preferredCourse"
              value={formData.preferredCourse}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="CSE">Computer Science & Engineering (CSE)</option>
              <option value="ECE">Electronics & Communication (ECE)</option>
              <option value="ME">Mechanical Engineering (ME)</option>
              <option value="CE">Civil Engineering (CE)</option>
              <option value="All">Any Branch</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Dream College (Optional)
            </label>
            <input
              type="text"
              name="targetCollege"
              value={formData.targetCollege}
              onChange={handleChange}
              placeholder="e.g. IIT Delhi, NIT Trichy"
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 font-bold text-white text-sm rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Retrieving Historical Ranks with RAG...' : 'Predict Colleges'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800/60 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <h3 className="text-base font-semibold text-white">Filtering JoSAA Multi-Year Cutoff Database</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Categorizing into Safe, Target, and Ambitious tiers using rank proximity algorithms...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Prediction Output */}
      {prediction && (
        <div className="space-y-6 animate-fadeIn">
          {/* Target College Evaluation Card */}
          {prediction.targetCollegeResult && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800/80 border border-slate-700/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Target College Feasibility Analysis
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    prediction.targetCollegeStatus === 'SAFE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : prediction.targetCollegeStatus === 'TARGET'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                  }`}
                >
                  {prediction.targetCollegeStatus}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {prediction.targetCollegeResult.college} ({prediction.targetCollegeResult.branch})
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {prediction.targetCollegeMessage}
              </p>
              <div className="text-xs text-slate-400 font-mono">
                Historical Cutoff Range: <span className="text-white font-bold">{prediction.targetCollegeResult.openingClosingRank}</span>
              </div>
            </div>
          )}

          {/* AI Strategic Counseling Summary */}
          {prediction.aiAnalysis && (
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI Admission Strategy & Choice Filling Advice</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{prediction.aiAnalysis}</p>
            </div>
          )}

          {/* Balanced Strategic Recommendations (Safe, Target, Ambitious) */}
          {prediction.recommendations && prediction.recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white">
                Strategic Recommendations (Balanced 5-College Portfolio)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {prediction.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          rec.category?.toLowerCase() === 'safe'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : rec.category?.toLowerCase() === 'target'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                        }`}
                      >
                        {rec.category?.toLowerCase() === 'safe' && <ShieldCheck className="w-3 h-3" />}
                        {rec.category?.toLowerCase() === 'target' && <Target className="w-3 h-3" />}
                        {rec.category?.toLowerCase() === 'ambitious' && <Flame className="w-3 h-3" />}
                        <span>{rec.category}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Confidence: {rec.confidence}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{rec.college}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{rec.branch}</p>
                    </div>

                    <p className="text-[11px] text-slate-300 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                      {rec.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Cutoff Results Table */}
          {prediction.collegeResultList && prediction.collegeResultList.length > 0 && (
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white">
                Detailed JoSAA Cutoff Records ({prediction.collegeResultList.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3">Institute</th>
                      <th className="p-3">Branch / Program</th>
                      <th className="p-3">Opening – Closing Rank</th>
                      <th className="p-3">Counselling</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {prediction.collegeResultList.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-semibold text-white">{row.college}</td>
                        <td className="p-3 text-slate-300">{row.branch}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">{row.openingClosingRank}</td>
                        <td className="p-3 text-slate-400">{row.counselling}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollegeTab;
