import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Gallery from '../components/Gallery';
import PromptDetailView from '../components/PromptDetailView';
import SEOMeta from '../components/SEOMeta';
import api from '../services/api';
import { useNav } from '../contexts/NavContext';

const CATEGORY_SEO = {
  All: {
    title: 'Promptova – The AI Prompt Universe',
    description: 'Discover the best AI image prompts ranked by popularity. Copy viral Midjourney, Stable Diffusion, anime, cinematic, and fantasy prompts instantly.',
    keywords: 'AI prompts, Midjourney prompts, best AI prompts, viral prompts, anime prompts, cinematic prompts, fantasy prompts, Stable Diffusion'
  },
  Girls: {
    title: 'Girls AI Image Prompts',
    description: 'Find beautiful and realistic AI portrait prompts of girls. Copy high-quality Midjourney and Stable Diffusion aesthetic girl prompts.',
    keywords: 'girls AI prompts, realistic girl portraits, Midjourney aesthetic girl, AI female portraits, Stable Diffusion girl art'
  },
  Boys: {
    title: 'Boys AI Image Prompts',
    description: 'Explore premium streetwear, editorial, and cinematic AI prompts of boys. Copy Midjourney and Stable Diffusion aesthetic boy prompts.',
    keywords: 'boys AI prompts, aesthetic boy portraits, Midjourney male character, streetwear boy AI, Stable Diffusion boy'
  },
  Kutties: {
    title: 'Kutties AI Image Prompts',
    description: 'Discover adorable, artistic, and whimsical child portrait AI prompts. Copy the best Midjourney child art and toddler prompts.',
    keywords: 'kutties AI prompts, children AI portrait, cute kids Midjourney, artistic child prompts, Stable Diffusion kids'
  },
  Cinematic: {
    title: 'Cinematic AI Prompts',
    description: 'Explore stunning cinematic AI image prompts for Midjourney and Stable Diffusion. Epic lighting, dramatic compositions, Hollywood-style scenes.',
    keywords: 'cinematic AI prompts, Midjourney cinematic, film prompts, dramatic lighting prompts, Hollywood AI art'
  },
  Fashion: {
    title: 'Fashion AI Prompts',
    description: 'Find the best fashion AI image prompts. Editorial, haute couture, streetwear — explore Midjourney fashion prompts.',
    keywords: 'fashion AI prompts, Midjourney fashion, editorial AI, haute couture prompts, streetwear AI art'
  },
  Anime: {
    title: 'Anime AI Image Prompts',
    description: 'Discover the best anime-style AI image prompts. Copy Midjourney and Stable Diffusion prompts for stunning anime characters and scenes.',
    keywords: 'anime AI prompts, anime Midjourney, anime art prompts, Stable Diffusion anime, manga style prompts'
  },
  Fantasy: {
    title: 'Fantasy AI Art Prompts',
    description: 'Explore breathtaking fantasy AI prompts — magical worlds, mythical creatures, epic landscapes. Perfect for Midjourney and Stable Diffusion.',
    keywords: 'fantasy AI prompts, Midjourney fantasy, magical art prompts, dragon prompts, fantasy landscape AI'
  }
};

const HomePage = () => {
  const { activeCategory, debouncedSearchQuery } = useNav();
  const [currentView, setCurrentView] = useState('feed');
  const [selectedPrompt, setSelectedPrompt] = useState(null);

  const seo = CATEGORY_SEO[activeCategory] || CATEGORY_SEO['All'];

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
    <div className="relative min-h-screen bg-white">
      {currentView === 'feed' ? (
        <SEOMeta
          title={activeCategory !== 'All' ? `${activeCategory} AI Prompts` : undefined}
          description={seo.description}
          keywords={seo.keywords}
          url={activeCategory !== 'All' ? `/category/${activeCategory}` : '/'}
        />
      ) : selectedPrompt ? (
        <SEOMeta
          title={selectedPrompt.title}
          description={`${selectedPrompt.title} — ${selectedPrompt.category} AI image prompt. Copy this Midjourney or Stable Diffusion prompt on Promptova.`}
          keywords={`${selectedPrompt.title}, ${selectedPrompt.category} AI prompt, ${(selectedPrompt.tags || []).join(', ')}`}
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
            className="w-full pt-4 md:pt-8"
            aria-label="Prompt gallery feed"
          >
            <Gallery onItemClick={handlePromptClick} />
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

export default HomePage;
