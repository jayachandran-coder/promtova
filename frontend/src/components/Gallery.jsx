import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { fetchPrompts, fetchFeedPrompts, searchPrompts, fetchRelatedPrompts } from '../services/api';
import GalleryCard from './GalleryCard';
import SkeletonCard from './SkeletonCard';
import { useNav } from '../contexts/NavContext';

const POLL_INTERVAL = 30000; // 30 seconds

const Gallery = ({
  onItemClick,
  columns = "columns-2 md:columns-3 lg:columns-4",
  excludeId = null,
  relatedToId = null
}) => {
  // Use debouncedSearchQuery for fetches — raw searchQuery only for UI
  const { activeCategory, searchQuery, debouncedSearchQuery } = useNav();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pollingRef = useRef(null);
  const pageRef = useRef(1);

  // True while the user is mid-typing (raw ≠ debounced)
  const isTyping = searchQuery !== debouncedSearchQuery;

  // Core fetcher — uses /search endpoint when a query is present
  const loadItems = useCallback(async (pageNumber = 1, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const params = { page: pageNumber, limit: 12, excludeId };
      let res;

      if (relatedToId) {
        // Dedicated related prompts endpoint — retrieves same style/category prompts
        res = await fetchRelatedPrompts(relatedToId, params);
      } else if (debouncedSearchQuery) {
        // Dedicated search endpoint — searches title, category, tags, prompt text
        res = await searchPrompts(debouncedSearchQuery, params);
      } else if (activeCategory === "Trending") {
        res = await api.get('/prompts/trending', { params });
      } else if (activeCategory === "Most Liked") {
        res = await api.get('/prompts/most-liked', { params });
      } else if (activeCategory === "Best of Promptova") {
        res = await api.get('/prompts/best', { params });
      } else if (activeCategory === "All") {
        // Viral feed — sorted by engagement score
        res = await fetchFeedPrompts(params);
      } else {
        // Specific category filter
        res = await fetchPrompts({ ...params, category: activeCategory });
      }

      const newItems = Array.isArray(res.data) ? res.data : [];

      if (isInitial) {
        setItems(newItems);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }

      setHasMore(newItems.length === 12);
    } catch (err) {
      // Silent — don't surface network errors to users
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeCategory, debouncedSearchQuery, excludeId, relatedToId]);

  // Silent background poll — only on the viral feed, not during search
  const silentPoll = useCallback(async () => {
    if (activeCategory !== "All" || debouncedSearchQuery) return;
    try {
      const res = await fetchFeedPrompts({ page: 1, limit: 12, excludeId });
      const fresh = Array.isArray(res.data) ? res.data : [];
      if (fresh.length === 0) return;

      setItems(prev => {
        const prevIds = new Set(prev.map(p => p._id));
        const updated = prev.map(p => {
          const match = fresh.find(f => f._id === p._id);
          return match ? { ...p, ...match } : p;
        });
        const brandNew = fresh.filter(f => !prevIds.has(f._id));
        return brandNew.length > 0 ? [...brandNew, ...updated] : updated;
      });
    } catch (_) {}
  }, [activeCategory, debouncedSearchQuery, excludeId]);

  // Trigger fetch when debounced query, category, excludeId, or relatedToId changes
  useEffect(() => {
    pageRef.current = 1;
    setPage(1);
    loadItems(1, true);

    // Poll only on the main viral feed when not viewing related prompts
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (!relatedToId && activeCategory === "All" && !debouncedSearchQuery) {
      pollingRef.current = setInterval(silentPoll, POLL_INTERVAL);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeCategory, debouncedSearchQuery, excludeId, relatedToId]);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      pageRef.current = nextPage;
      setPage(nextPage);
      loadItems(nextPage);
    }
  }, [loading, loadingMore, hasMore, page, loadItems]);

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.8 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
  }, [hasMore, loading, loadingMore, loadMore]);

  return (
    <div className="w-full">
      {/* Search status bar */}
      <AnimatePresence>
        {(debouncedSearchQuery || isTyping) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="px-1 md:px-2 lg:px-4 xl:px-6 mb-4 flex items-center gap-2"
          >
            {isTyping ? (
              <span className="text-xs text-gray-400 font-medium">Searching…</span>
            ) : (
              <span className="text-xs text-gray-500 font-medium">
                {loading ? 'Loading results…' : `${items.length} result${items.length !== 1 ? 's' : ''} for `}
                {!loading && <span className="font-bold text-gray-900">"{debouncedSearchQuery}"</span>}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Masonry Grid */}
      <div className={`${columns} masonry-grid px-1 md:px-2 lg:px-4 xl:px-6`}>
        <AnimatePresence mode="popLayout">
          {loading && items.length === 0 ? (
            Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={`skel-${i}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SkeletonCard height={i % 2 === 0 ? 'h-72' : 'h-96'} />
              </motion.div>
            ))
          ) : items.length === 0 && !isTyping ? (
            <motion.div
              key="empty-state"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-40 flex flex-col items-center justify-center text-center"
            >
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {debouncedSearchQuery ? `No results for "${debouncedSearchQuery}"` : 'No prompts found'}
              </h3>
              <p className="text-gray-400 max-w-xs mt-2">
                {debouncedSearchQuery
                  ? 'Try different keywords or browse by category.'
                  : 'Check back later or try a different category.'}
              </p>
            </motion.div>
          ) : (
            items.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <GalleryCard
                  item={item}
                  onClick={onItemClick}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Infinite Scroll Trigger */}
      <div ref={observerTarget} className="py-20 flex justify-center w-full min-h-[100px]">
        {loadingMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400 text-xs font-black uppercase tracking-widest">More Magic Coming...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
