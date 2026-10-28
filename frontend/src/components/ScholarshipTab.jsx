import React, { useState } from 'react';
import { Award, CheckCircle2, ExternalLink, AlertCircle, Filter, Sparkles } from 'lucide-react';
import API from '../services/api';

const ScholarshipTab = () => {
  const [formData, setFormData] = useState({
    state: 'Delhi',
    category: 'General',
    annualFamilyIncome: '250000',
    course: 'B.Tech',
    educationStage: 'Undergraduate',
    currentYear: '1st Year',
    lastQualifyingExam: '12th Board',
    lastQualifyingExamPercentage: '85',
    gender: 'Male',
    pwd: false,
    parentOccupation: 'Private Sector',
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const statesList = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Gujarat', 'Haryana',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab',
    'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await API.post('/scholarships/find', {
        ...formData,
        annualFamilyIncome: parseFloat(formData.annualFamilyIncome),
        lastQualifyingExamPercentage: parseFloat(formData.lastQualifyingExamPercentage),
      });
      setResults(res.data.scholarshipResultList || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to match scholarships');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-amber-400 tracking-wider uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          Intelligent Scholarship Discovery
        </span>
        <h1 className="text-2xl font-extrabold text-white mt-2">
          Scholarship Finder & Eligibility Matcher
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Powered by 28 strict verification rules. Input your demographic and academic credentials to discover verified government, merit, and corporate scholarships.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              State / Domicile <span className="text-amber-400">*</span>
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            >
              {statesList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Category <span className="text-amber-400">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Annual Family Income (₹) <span className="text-amber-400">*</span>
            </label>
            <input
              type="number"
              name="annualFamilyIncome"
              required
              min={0}
              value={formData.annualFamilyIncome}
              onChange={handleChange}
              placeholder="e.g. 250000"
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Course / Stream <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              name="course"
              required
              value={formData.course}
              onChange={handleChange}
              placeholder="e.g. B.Tech / B.Sc / MBBS"
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Education Stage <span className="text-amber-400">*</span>
            </label>
            <select
              name="educationStage"
              value={formData.educationStage}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="11th">Class 11</option>
              <option value="12th">Class 12</option>
              <option value="Diploma">Diploma</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Last Exam Percentage (%) <span className="text-amber-400">*</span>
            </label>
            <input
              type="number"
              name="lastQualifyingExamPercentage"
              required
              min={0}
              max={100}
              step={0.1}
              value={formData.lastQualifyingExamPercentage}
              onChange={handleChange}
              placeholder="e.g. 85.5"
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Gender <span className="text-amber-400">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="pwd"
              name="pwd"
              checked={formData.pwd}
              onChange={handleChange}
              className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-800 border-slate-700"
            />
            <label htmlFor="pwd" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Person with Benchmark Disability (PwD)
            </label>
          </div>

          <div className="md:col-span-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold text-white text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Evaluating Strict Eligibility Rules...' : 'Find Matching Scholarships'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800/60 space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
          <h3 className="text-base font-semibold text-white">Filtering Domicile, Category & Income Ceilings</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Checking verified state and national schemes against your credentials...
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

      {/* Results */}
      {results && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Matching Opportunities ({results.length})
            </h2>
            <span className="text-xs text-slate-400">Strict Match Enforced</span>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-sm">
              No matching scholarships found for this exact profile combination.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {results.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          {item.provider}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {item.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{item.name}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Match Score</p>
                        <p className="text-lg font-black text-amber-400">{item.matchScore}%</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{item.eligibility}</p>

                  <div className="p-3 bg-slate-800/40 rounded-xl text-xs text-slate-300 border border-slate-700/50">
                    <span className="font-semibold text-emerald-400">Why You Match: </span>
                    {item.reason}
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 text-xs">
                    <div className="space-x-4 text-slate-400">
                      <span>Award: <strong className="text-white">{item.amount || 'As per norms'}</strong></span>
                      <span>Deadline: <strong className="text-white">{item.deadline || 'Ongoing'}</strong></span>
                    </div>

                    {item.applicationLink && (
                      <a
                        href={item.applicationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/30 transition-all font-semibold"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScholarshipTab;
