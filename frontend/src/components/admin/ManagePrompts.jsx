import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Search, Filter, X, Save } from 'lucide-react';
import { deletePrompt, updatePrompt } from '../../services/api';
import { useAdmin } from '../../contexts/AdminContext';
import axios from 'axios';
import MultiSelectDropdown from './MultiSelectDropdown';

const categories = ["Girls", "Boys", "Kutties", "Cinematic", "Fashion", "Anime", "Fantasy"];

const ManagePrompts = () => {
  const { prompts, setPrompts, loading, refreshAll } = useAdmin();
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'https://promtova-nq5i.onrender.com/api';
        const adminToken = localStorage.getItem('adminToken');
        
        // Ensure robust URL formatting
        const targetUrl = baseUrl.endsWith('/api') 
          ? `${baseUrl}/prompts/${id}` 
          : `${baseUrl}/api/prompts/${id}`;

        await axios.delete(targetUrl, {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        });
        
        // Real-time update: remove from local state immediately
        setPrompts(prev => prev.filter(p => p._id !== id));
        showSuccess('Prompt deleted successfully');
        // Refresh everything to sync counts
        refreshAll();
      } catch (err) {
        console.error('Error deleting:', err);
        showError('Failed to delete prompt');
      }
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

  const startEditing = (p) => {
    setEditingItem({
      ...p,
      categories: p.categories || (p.category ? [p.category] : []),
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || '')
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updatePrompt(editingItem._id, editingItem);
      // Real-time update: map through current state using backend response
      setPrompts(prev => prev.map(p => p._id === editingItem._id ? res.data : p));
      setEditingItem(null);
      showSuccess('Prompt updated successfully');
      refreshAll();
    } catch (err) {
      console.error('Error updating:', err);
      showError('Failed to update prompt');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPrompts = prompts.filter(p => {
    const title = p.title || "";
    const promptText = p.prompt || "";
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          promptText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || 
                            (p.categories && p.categories.includes(activeCategory)) || 
                            p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 text-left">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search uploaded prompts..." 
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 ring-gray-900 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Girls', 'Boys', 'Kutties', 'Cinematic', 'Fashion', 'Anime', 'Fantasy'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-4 rounded-2xl text-sm font-bold whitespace-nowrap transition-all
                ${activeCategory === cat ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="h-64 bg-gray-50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredPrompts.map((p) => (
              <motion.div
                key={p._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="masonry-item relative group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-50 aspect-square"
              >
                <div className="absolute inset-0 w-full h-full">
                  <img src={p.imageUrl} className="w-full h-full object-cover block" alt={p.title} />
                  
                  {/* Persistent Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 pointer-events-none" />

                  {/* Top Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-wider text-white shadow-sm border border-white/20">
                      {p.categories && p.categories.length > 0 ? p.categories[0] : (p.category || 'All')}
                    </span>
                  </div>

                  {/* Hover Actions (Edit/Delete) */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                    <button 
                      onClick={() => startEditing(p)}
                      className="p-3 bg-white text-gray-900 rounded-xl hover:scale-110 transition-transform shadow-xl"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(p._id)}
                      className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition-transform shadow-xl"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Bottom Title & Stats */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <h4 className="text-white font-black text-sm tracking-tight truncate drop-shadow-md mb-2">
                      {p.title}
                    </h4>
                    <div className="flex items-center gap-4 text-[11px] font-bold text-white/80">
                      <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">Likes: {p.likes || 0}</span>
                      <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10">Copies: {p.copies || 0}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 text-left">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setEditingItem(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Edit Prompt</h3>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 block">Title</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-gray-900 transition-all font-semibold"
                    value={editingItem.title}
                    onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 block">Categories</label>
                  <MultiSelectDropdown
                    options={categories}
                    selectedOptions={editingItem.categories}
                    onChange={selected => setEditingItem({...editingItem, categories: selected})}
                    placeholder="Select categories..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 block">Full Prompt</label>
                  <textarea 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-gray-900 transition-all font-semibold resize-none"
                    rows="4"
                    value={editingItem.prompt}
                    onChange={e => setEditingItem({...editingItem, prompt: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 block">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-gray-900 transition-all font-semibold"
                    value={editingItem.tags}
                    onChange={e => setEditingItem({...editingItem, tags: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isSaving ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:scale-[1.02]'
                  }`}
                >
                  {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
            <Save className="w-6 h-6" />
            <span className="font-bold">{successMessage || errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagePrompts;
