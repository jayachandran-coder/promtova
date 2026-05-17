import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, ExternalLink, MessageSquare, Heart, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import { useAdmin } from '../../contexts/AdminContext';

const AdminRequests = () => {
  const { requests, setRequests, loading, refreshAll } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState('All');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      try {
        await api.delete(`/requests/${id}`);
        // Real-time update
        setRequests(prev => prev.filter(r => r._id !== id));
        showSuccess('Request deleted successfully');
        refreshAll();
      } catch (err) {
        console.error('Error deleting:', err);
        showError('Failed to delete request');
      }
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await api.put(`/requests/${id}`, { status: newStatus });
      // Real-time update
      setRequests(prev => prev.map(r => r._id === id ? res.data : r));
      showSuccess(`Status updated to ${newStatus}`);
      refreshAll();
    } catch (err) {
      console.error('Error updating status:', err);
      showError('Failed to update status');
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const filteredRequests = requests.filter(r => {
    const title = r.title || "";
    const description = r.description || "";
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeStatus === 'All' || r.status === activeStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return 'bg-gray-100 text-gray-700';
      case 'In Progress': return 'bg-orange-100 text-orange-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search requests..." 
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 ring-gray-900 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Open', 'In Progress', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-6 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all
                ${activeStatus === status ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((r) => (
              <motion.div
                key={r._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 md:items-center"
              >
                {/* Image (if any) */}
                {r.imageUrl && (
                  <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 bg-gray-50">
                    <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                    <span className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-wider text-gray-500">
                      {r.category}
                    </span>
                    <span className="text-xs text-gray-400 font-medium ml-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-gray-900 truncate mb-1">{r.title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{r.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.createdBy?.username || 'user'}`} alt="user" />
                      </div>
                      {r.createdBy?.username || 'Anonymous'}
                    </div>
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {r.likes?.length || 0}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {r.comments?.length || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-col items-center gap-2 shrink-0 md:pl-6 md:border-l border-gray-100">
                  {/* Status Dropdown */}
                  <select
                    value={r.status}
                    onChange={(e) => handleStatusUpdate(r._id, e.target.value)}
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-gray-900 transition-colors cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <div className="flex items-center gap-2 w-full">
                    <a 
                      href={`/requests/${r._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 md:flex-none p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors flex justify-center"
                      title="View Public Page"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <button 
                      onClick={() => handleDelete(r._id)}
                      className="flex-1 md:flex-none p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors flex justify-center"
                      title="Delete Request"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredRequests.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-500 font-medium">No requests found matching your filters.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Notifications */}
      <AnimatePresence>
        {(successMessage || errorMessage) && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-10 right-10 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[250] ${
              successMessage ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            <CheckCircle className="w-6 h-6" />
            <span className="font-bold">{successMessage || errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminRequests;
