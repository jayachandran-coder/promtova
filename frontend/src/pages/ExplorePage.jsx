import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Heart, LayoutGrid, Star } from 'lucide-react';
import api from '../services/api';
import ExploreSection from '../components/ExploreSection';
import CategoryCard from '../components/CategoryCard';
import PromptDetailView from '../components/PromptDetailView';
import SEOMeta from '../components/SEOMeta';
import { useUserAuth } from '../contexts/UserAuthContext';

import { useNav } from '../contexts/NavContext';

const ExplorePage = () => {
  const { setActiveCategory } = useNav();
  const { token } = useUserAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('explore');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [loading, setLoading] = useState(true);

  const [trending, setTrending] = useState([]);
  const [mostLiked, setMostLiked] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);

  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        setLoading(true);
        const [trendingRes, mostLikedRes, recommendedRes, categoriesRes] = await Promise.all([
          api.get('/prompts/trending'),
          api.get('/prompts/most-liked'),
          api.get('/prompts/recommended'),
          api.get('/prompts/featured-categories')
        ]);
        setTrending(Array.isArray(trendingRes.data) ? trendingRes.data : []);
        setMostLiked(Array.isArray(mostLikedRes.data) ? mostLikedRes.data : []);
        setRecommended(Array.isArray(recommendedRes.data) ? recommendedRes.data : []);
        setFeaturedCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    if (currentView === 'explore') fetchExploreData();
  }, [currentView, token]);

  const handlePromptClick = React.useCallback((item) => {
    setSelectedPrompt(item);
    setCurrentView('detail');
    api.post(`/prompts/${item._id}/track`, { action: 'view' })
      .catch(() => {});
  }, []);

  const handleBackToExplore = React.useCallback(() => {
    setCurrentView('explore');
    setSelectedPrompt(null);
  }, []);

  const handleCategoryClick = React.useCallback((category) => {
    navigate(`/category/${category}`);
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-white">
      {currentView === 'explore' ? (
        <SEOMeta
          title="Explore AI Prompts"
          description="Explore the best AI image prompts on Promptova. Browse trending, most liked, and recommended Midjourney, Stable Diffusion, and ChatGPT prompts by category."
          keywords="explore AI prompts, trending Midjourney prompts, best AI art prompts, recommended prompts, AI prompt gallery"
          url="/explore"
          breadcrumb={[
            { name: 'Promptova', url: '/' },
            { name: 'Explore', url: '/explore' }
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
        {currentView === 'explore' ? (
          <motion.main
            key="explore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full pt-8 pb-20"
            aria-label="Explore AI prompts"
          >
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
              <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 tracking-tight">
                  Explore the best of Promptova
                </h1>
                <p className="text-gray-400 text-sm">Trending, most liked, and highest engagement AI prompts</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <ExploreSection
                  title="Most Copied Prompts"
                  items={trending}
                  loading={loading}
                  icon={TrendingUp}
                  description="Viral prompts that users are copying and using most frequently right now."
                  onPromptClick={handlePromptClick}
                  onViewAll={() => handleCategoryClick('Trending')}
                />
                <ExploreSection
                  title="Highest Liked"
                  items={mostLiked}
                  loading={loading}
                  icon={Heart}
                  description="The community's favorites. These prompts have received the most love."
                  onPromptClick={handlePromptClick}
                  onViewAll={() => handleCategoryClick('Most Liked')}
                />
                <ExploreSection
                  title="Featured Categories"
                  loading={loading}
                  icon={LayoutGrid}
                  description="Browse prompts by top categories and find what inspires you."
                >
                  {Array.isArray(featuredCategories) && featuredCategories.map((cat, i) => (
                    <CategoryCard key={i} category={cat} onClick={handleCategoryClick} />
                  ))}
                </ExploreSection>
                <ExploreSection
                  title="Recommended For You"
                  items={recommended}
                  loading={loading}
                  icon={Star}
                  description="The overall highest engagement prompts, calculated by combining likes, saves, and copies."
                  onPromptClick={handlePromptClick}
                  onViewAll={() => handleCategoryClick('Best of Promptova')}
                />
              </div>
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
              onBack={handleBackToExplore}
              onRelatedItemClick={handlePromptClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="py-12 border-t border-gray-50 mt-12 bg-white" role="contentinfo">
        <div className="max-w-[1400px] mx-auto px-4 text-center md:flex md:justify-between md:items-center">
          <p className="text-gray-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 md:mb-0">
            &copy; 2026 Promptova AI. All Rights Reserved.
          </p>
          <nav aria-label="Social links" className="flex justify-center gap-6">
            {['Instagram', 'Twitter', 'Discord'].map(social => (
              <a key={social} href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
                {social}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default ExplorePage;
