import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import API from '../services/api';

const PlacementTab = () => {
  const [targetCompany, setTargetCompany] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [timeLeftDays, setTimeLeftDays] = useState('15');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [openQuestionIndex, setOpenQuestionIndex] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPlan(null);

    try {
      const res = await API.post('/placement/generate', {
        targetCompany,
        targetRole,
        timeLeftDays: parseInt(timeLeftDays),
      });
      setPlan(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate placement plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          AI-Driven Placement Engine
        </span>
        <h1 className="text-2xl font-extrabold text-white mt-2">
          Targeted Placement Preparation
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Powered by LangGraph Agentic Workflows. Enter your dream company, role, and preparation timeline to get a day-by-day roadmap and verified interview questions.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Company <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="e.g. Google, Amazon, Juspay"
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Role <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. SDE-1, Backend Engineer"
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Preparation Time (Days) <span className="text-emerald-400">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              max={120}
              value={timeLeftDays}
              onChange={(e) => setTimeLeftDays(e.target.value)}
              placeholder="e.g. 15"
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="md:col-span-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-bold text-white text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Synthesizing Roadmap with LangGraph...' : 'Generate Preparation Plan'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800/60 space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <h3 className="text-base font-semibold text-white">Analyzing Company Hiring Blueprints</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            LangGraph state nodes are curating real interview questions, technical focus areas, and scheduling your day-by-day plan...
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

      {/* Plan Results */}
      {plan && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400 font-bold tracking-wider uppercase">Verified AI Blueprint</p>
              <h2 className="text-xl font-bold text-white mt-1">
                {targetCompany} — {targetRole} ({timeLeftDays} Days Plan)
              </h2>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold">
              Live Plan
            </span>
          </div>

          {/* Section 1: Core Skills */}
          {plan.skillsRequired && plan.skillsRequired.length > 0 && (
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-white font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base">01. Core Skills Required</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {plan.skillsRequired.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-sm">{item.skill}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          item.priority?.toLowerCase() === 'high'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{item.topics}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Hiring Process & Preparation Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hiring Process */}
            {plan.hiringProcess && (
              <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Layers className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base">02. Hiring Process Blueprint</h3>
                </div>
                <div className="space-y-3">
                  {plan.hiringProcess.map((round, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{round.stage}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{round.focus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preparation Priority */}
            {plan.preparationPriority && (
              <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base">03. Time Allocation & Priority</h3>
                </div>
                <div className="space-y-3">
                  {plan.preparationPriority.map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                          #{item.rank}
                        </span>
                        <span className="text-sm font-semibold text-white">{item.area}</span>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                        {item.recommendedDays} Days
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Day-by-Day Preparation Roadmap */}
          {plan.preparationRoadmap && plan.preparationRoadmap.length > 0 && (
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-white font-bold">
                <Calendar className="w-5 h-5 text-teal-400" />
                <h3 className="text-base">04. Day-by-Day Preparation Roadmap</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plan.preparationRoadmap.map((interval, idx) => (
                  <div key={idx} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-2">
                    <span className="inline-block px-2.5 py-1 bg-teal-500/20 text-teal-300 font-bold text-xs rounded-lg border border-teal-500/30">
                      Days {interval.days}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">{interval.focus}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Previously Asked Questions */}
          {plan.previouslyAskedQuestions && plan.previouslyAskedQuestions.length > 0 && (
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-white font-bold">
                <HelpCircle className="w-5 h-5 text-purple-400" />
                <h3 className="text-base">05. Curated Technical Interview Questions</h3>
              </div>
              <div className="space-y-3">
                {plan.previouslyAskedQuestions.map((qa, idx) => {
                  const isOpen = openQuestionIndex === idx;
                  return (
                    <div key={idx} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-800/30">
                      <button
                        onClick={() => setOpenQuestionIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-800/60 transition-colors"
                      >
                        <span className="text-sm font-semibold text-slate-200">
                          {idx + 1}. {qa.question}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-0 text-xs text-slate-300 bg-slate-900/50 border-t border-slate-800/60 leading-relaxed font-mono">
                          <p className="text-emerald-400 font-sans font-bold mb-1">Model Answer:</p>
                          {qa.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlacementTab;
