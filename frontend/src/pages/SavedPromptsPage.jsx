import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Loader2, Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import GalleryCard from '../components/GalleryCard';
import PromptDetailView from '../components/PromptDetailView';
import SEOMeta from '../components/SEOMeta';
import { fetchSavedPrompts } from '../services/api';
import { useUserAuth } from '../contexts/UserAuthContext';

const SavedPromptsPage = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const { isAuthenticated, user } = useUserAuth();

  useEffect(() => {
    const getSaved = async () => {
      if (isAuthenticated) {
        try {
          const res = await fetchSavedPrompts();
          setPrompts(res.data);
        } catch (err) {
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    getSaved();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
          <Bookmark className="w-10 h-10 text-gray-200" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Your Collection</h2>
        <p className="text-gray-500 font-medium max-w-md mb-8">
          Sign in to view and manage your personally curated collection of AI prompts.
        </p>
        <Link 
          to="/login"
          className="px-8 py-4 bg-black text-white rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-gray-200 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pt-8">
      <SEOMeta
        title="Saved Prompts"
        description="Your personally curated collection of saved AI prompts on Promptova."
        noIndex={true}
      />
      {selectedPrompt ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <PromptDetailView 
            item={selectedPrompt} 
            onBack={() => setSelectedPrompt(null)} 
          />
        </motion.div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 px-4 md:px-0">
            <div>
              <div className="flex items-center gap-3 text-blue-600 font-bold text-xs uppercase tracking-[0.2em] mb-3">
                <Bookmark className="w-4 h-4 fill-current" />
                <span>Curated Collection</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
                Saved Prompts
              </h1>
            </div>
            <div className="bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
               <span className="text-gray-400 font-bold text-sm">
                 <span className="text-black">{prompts.length}</span> {prompts.length === 1 ? 'Prompt' : 'Prompts'} Saved
               </span>
            </div>
          </div>

          {prompts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-h-[50vh] bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center p-12 mx-4 md:mx-0"
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
                <Search className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-4">Nothing saved yet</h3>
              <p className="text-gray-500 font-medium max-w-sm mb-10 leading-relaxed">
                Your collection is looking a bit empty. Explore the gallery and save your favorite prompts to see them here!
              </p>
              <Link 
                to="/"
                className="group flex items-center gap-3 text-black font-black hover:gap-5 transition-all"
              >
                Explore Gallery <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
            </motion.div>
          ) : (
            <div className="columns-2 sm:columns-2 lg:columns-3 xl:columns-4 masonry-grid pb-20 px-0 md:px-0">
              {prompts.map((item) => (
                <GalleryCard 
                  key={item._id} 
                  item={item} 
                  onClick={(p) => setSelectedPrompt(p)} 
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SavedPromptsPage;
