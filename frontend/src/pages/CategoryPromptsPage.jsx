import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Gallery from '../components/Gallery';
import PromptDetailView from '../components/PromptDetailView';
import SEOMeta from '../components/SEOMeta';
import api from '../services/api';
import { useNav } from '../contexts/NavContext';

const CATEGORY_META = {
  Girls: {
    description: 'Find beautiful and realistic AI portrait prompts of girls. Copy high-quality Midjourney and Stable Diffusion aesthetic girl prompts.',
    keywords: 'girls AI prompts, realistic girl portraits, Midjourney aesthetic girl, AI female portraits, Stable Diffusion girl art'
  },
  Boys: {
    description: 'Explore premium streetwear, editorial, and cinematic AI prompts of boys. Copy Midjourney and Stable Diffusion aesthetic boy prompts.',
    keywords: 'boys AI prompts, aesthetic boy portraits, Midjourney male character, streetwear boy AI, Stable Diffusion boy'
  },
  Kutties: {
    description: 'Discover adorable, artistic, and whimsical child portrait AI prompts. Copy the best Midjourney child art and toddler prompts.',
    keywords: 'kutties AI prompts, children AI portrait, cute kids Midjourney, artistic child prompts, Stable Diffusion kids'
  },
  Cinematic: {
    description: 'Browse the best cinematic AI image prompts on Promptova. Epic lighting, dramatic compositions, and Hollywood-style scenes for Midjourney and Stable Diffusion.',
    keywords: 'cinematic AI prompts, Midjourney cinematic, film prompts, dramatic lighting AI art, Hollywood prompts'
  },
  Fashion: {
    description: 'Discover premium fashion AI image prompts. Editorial, haute couture, and streetwear Midjourney prompts for stunning visual results.',
    keywords: 'fashion AI prompts, Midjourney fashion, editorial AI prompts, haute couture prompts, streetwear AI'
  },
  Anime: {
    description: 'Discover stunning anime AI image prompts. Copy Midjourney and Stable Diffusion prompts for beautiful anime characters, scenes, and artwork.',
    keywords: 'anime AI prompts, Midjourney anime, anime art prompts, manga AI, Stable Diffusion anime'
  },
  Fantasy: {
    description: 'Explore breathtaking fantasy AI prompts — magical worlds, mythical creatures, and epic landscapes for Midjourney and Stable Diffusion.',
    keywords: 'fantasy AI prompts, Midjourney fantasy, magical landscape prompts, dragon AI art, fantasy characters'
  }
};

const CategoryPromptsPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { setActiveCategory } = useNav();
  const [currentView, setCurrentView] = useState('feed');
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  // Sync the URL category into NavContext so Gallery picks it up
  useEffect(() => {
    if (categoryName) setActiveCategory(categoryName);
    return () => setActiveCategory('All'); // reset on unmount
  }, [categoryName]);

  const meta = CATEGORY_META[categoryName] || {
    description: `Browse the best ${categoryName} AI image prompts on Promptova. Copy top-rated Midjourney and Stable Diffusion prompts instantly.`,
    keywords: `${categoryName} AI prompts, ${categoryName} Midjourney, ${categoryName} Stable Diffusion, AI art prompts`
  };

  const handlePromptClick = (item) => {
    setSelectedPrompt(item);
    setCurrentView('detail');
    api.post(`/prompts/${item._id}/track`, { action: 'view' })
      .catch(() => {});
  };

  const handleBackToFeed = () => {
    setCurrentView('feed');
    setSelectedPrompt(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {currentView === 'feed' ? (
        <SEOMeta
          title={`${categoryName} AI Prompts`}
          description={meta.description}
          keywords={meta.keywords}
          url={`/category/${categoryName}`}
          breadcrumb={[
            { name: 'Promptova', url: '/' },
            { name: 'Explore', url: '/explore' },
            { name: `${categoryName} Prompts`, url: `/category/${categoryName}` }
          ]}
        />
      ) : selectedPrompt ? (
        <SEOMeta
          title={selectedPrompt.title}
          description={`${selectedPrompt.title} — ${selectedPrompt.category} AI image prompt. Copy this prompt on Promptova.`}
          image={selectedPrompt.imageUrl}
          type="article"
          articleSchema={{
            headline: selectedPrompt.title,
            image: selectedPrompt.imageUrl,
            datePublished: selectedPrompt.createdAt
          }}
        />
      ) : null}

      <AnimatePresence mode="wait">
        {currentView === 'feed' ? (
          <motion.main
            key="feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full pt-8 pb-20"
            aria-label={`${categoryName} prompts gallery`}
          >
            <div className="max-w-[1400px] mx-auto px-0 md:px-8">
              {/* SEO Header */}
              <header className="mb-6 flex items-center justify-between px-4 md:px-0">
                <div>
                  <nav aria-label="Breadcrumb" className="mb-2">
                    <ol className="flex items-center gap-2 text-xs text-gray-400">
                      <li><a href="/" className="hover:text-gray-700 transition-colors">Home</a></li>
                      <li>/</li>
                      <li><a href="/explore" className="hover:text-gray-700 transition-colors">Explore</a></li>
                      <li>/</li>
                      <li className="text-gray-700 font-medium capitalize">{categoryName}</li>
                    </ol>
                  </nav>
                  <h1 className="text-2xl md:text-5xl font-black text-gray-900 tracking-tight capitalize">
                    {categoryName} <span className="text-gray-300">Prompts.</span>
                  </h1>
                  <p className="text-sm text-gray-400 mt-1 max-w-lg">{meta.description.split('.')[0]}.</p>
                </div>

                <button
                  onClick={() => navigate('/explore')}
                  className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-full transition-all active:scale-95 border border-gray-100 shadow-sm"
                  aria-label="Back to Explore"
                  title="Back to Explore"
                >
                  <ArrowLeft size={20} strokeWidth={3} />
                </button>
              </header>

              <Gallery onItemClick={handlePromptClick} />
            </div>
          </motion.main>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <PromptDetailView
              item={selectedPrompt}
              onBack={handleBackToFeed}
              onRelatedItemClick={handlePromptClick}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryPromptsPage;
