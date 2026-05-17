import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Send, CheckCircle2 } from 'lucide-react';
import { uploadPrompt } from '../../services/api';
import { useAdmin } from '../../contexts/AdminContext';

const categories = [
  "Cinematic", "Anime", "Fantasy", "Portrait", 
  "Product Photography", "Architecture", "Fashion"
];

const UploadPrompt = () => {
  const { refreshAll } = useAdmin();
  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    category: 'Cinematic',
    tags: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert('Please select an image');

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('prompt', formData.prompt);
    data.append('category', formData.category);
    data.append('tags', formData.tags);
    data.append('image', image);

    try {
      await uploadPrompt(data);
      setSuccess(true);
      setFormData({ title: '', prompt: '', category: 'Cinematic', tags: '' });
      setImage(null);
      setPreview(null);
      refreshAll();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error uploading:', err);
      alert(err.response?.data?.message || 'Upload failed. Please ensure the backend is running and you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 text-left">
      <div className="flex flex-col md:flex-row gap-10">
        
        {/* Left: Upload Area */}
        <div className="w-full md:w-1/2">
          <div 
            onClick={() => fileInputRef.current.click()}
            className={`relative aspect-square rounded-[3rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center p-8
              ${preview ? 'border-transparent shadow-2xl' : 'border-gray-200 hover:border-gray-400 bg-gray-50'}`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
            
            {preview ? (
              <motion.img 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={preview} 
                className="absolute inset-0 w-full h-full object-cover"
                alt="Preview" 
              />
            ) : (
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-5 bg-white rounded-3xl shadow-sm">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Drop your image here</h4>
                  <p className="text-sm text-gray-400">Supports JPG, PNG, WEBP</p>
                </div>
              </div>
            )}
            
            {preview && (
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                 <div className="p-4 bg-white/90 backdrop-blur rounded-2xl shadow-xl">
                    <ImageIcon className="w-6 h-6 text-gray-900" />
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Form Details */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Prompt Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 text-left block">Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="Cinematic Sunset in Cyberpunk City"
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-gray-900 rounded-2xl outline-none transition-all text-sm font-semibold text-gray-700"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 text-left block">Category</label>
                <select 
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-gray-900 rounded-2xl outline-none transition-all text-sm font-semibold text-gray-700 appearance-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 text-left block">Full Prompt</label>
                <textarea 
                  required
                  placeholder="Describe the prompt settings and style..."
                  rows="4"
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-gray-900 rounded-2xl outline-none transition-all text-sm font-semibold text-gray-700 resize-none"
                  value={formData.prompt}
                  onChange={e => setFormData({...formData, prompt: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1 text-left block">Tags (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="cyberpunk, neon, sunset, 8k"
                  className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-gray-900 rounded-2xl outline-none transition-all text-sm font-semibold text-gray-700"
                  value={formData.tags}
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl
                  ${loading ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:scale-[1.02] active:scale-95 shadow-gray-200'}`}
              >
                {loading ? 'Uploading...' : <><Send className="w-4 h-4" /> Upload Prompt</>}
              </button>
            </form>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 right-10 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[200]"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-bold">Prompt uploaded successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadPrompt;
