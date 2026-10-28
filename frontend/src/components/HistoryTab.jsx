import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Trash2, Eye, Calendar, Lock, AlertCircle, X } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const HistoryTab = () => {
  const { isLoggedIn, setIsAuthModalOpen } = useAuth();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchHistory = async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/history');
      setHistoryItems(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [isLoggedIn]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/history/${id}`);
      setHistoryItems((prev) => prev.filter((item) => item._id !== id));
      if (selectedItem && selectedItem._id === id) {
        setSelectedItem(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete history item');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 max-w-lg mx-auto mt-12 animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/20">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Activity history automatically archives your placement roadmaps, scholarship schemes, and college cutoff predictions for 7 days. Sign in or register to access saved searches.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-semibold text-white text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-purple-400 tracking-wider uppercase bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            Automated Audit & 7-Day TTL Lifecycle
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-2">Saved Activity History</h1>
          <p className="text-sm text-slate-400 mt-1">
            Review your past queries. Expired records are automatically pruned after 7 days by the scheduled cron cleaner.
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800/60">
          <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading your history records...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* History Items List */}
      {!loading && historyItems.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-sm">
          No saved activities yet. Generate a placement roadmap, search scholarships, or predict colleges to see them saved here!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {historyItems.map((item) => (
            <div
              key={item._id}
              onClick={() => setSelectedItem(item)}
              className="p-5 bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      item.module === 'PLACEMENT'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : item.module === 'SCHOLARSHIP'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {item.module}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString()} at{' '}
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  {item.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item);
                  }}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(item._id, e)}
                  className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Delete Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col p-6 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                {selectedItem.module} ARCHIVE
              </span>
              <h2 className="text-lg font-bold text-white mt-1">{selectedItem.title}</h2>
              <p className="text-xs text-slate-400">
                Created: {new Date(selectedItem.createdAt).toLocaleString()} | Auto-expires on:{' '}
                {new Date(selectedItem.expiresAt).toLocaleDateString()}
              </p>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 text-xs">
              <div>
                <h4 className="font-bold text-slate-300 mb-1">Request Payload:</h4>
                <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 font-mono overflow-x-auto text-[11px]">
                  {JSON.stringify(selectedItem.requestData, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-bold text-slate-300 mb-1">Saved Response Data:</h4>
                <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-emerald-400 font-mono overflow-x-auto text-[11px]">
                  {JSON.stringify(selectedItem.responseData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
