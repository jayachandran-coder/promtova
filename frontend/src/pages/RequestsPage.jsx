import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchRequests } from '../services/api';
import RequestCard from '../components/RequestCard';
import RequestFormModal from '../components/RequestFormModal';
import { useUserAuth } from '../contexts/UserAuthContext';
import SkeletonCard from '../components/SkeletonCard';

const CATEGORIES = ["All", "Cinematic", "Anime", "Fantasy", "Portrait", "Architecture", "Fashion", "Product Photography"];
const STATUSES = ["All", "Open", "In Progress", "Completed"];

const RequestsPage = () => {
  const { isAuthenticated } = useUserAuth();
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filters
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' or 'mostLiked'

  const loadRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (activeStatus !== 'All') params.status = activeStatus;
      if (searchQuery) params.search = searchQuery;
      if (sortBy) params.sort = sortBy;

      const res = await fetchRequests(params);
      setRequests(res.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadRequests();
    }, 300); // Debounce search

    return () => clearTimeout(delayDebounceFn);
  }, [activeCategory, activeStatus, searchQuery, sortBy]);

  const handleNewRequest = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
              Community Requests
            </h1>
            <p className="text-gray-500 font-medium max-w-xl">
              Looking for a specific prompt? Request it here, or fulfill requests from other creators to build your reputation.
            </p>
          </div>
          <button 
            onClick={handleNewRequest}
            className="shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 bg-black text-white rounded-full font-bold hover:bg-gray-900 transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            New Request
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-4 sticky top-20 z-40">
          
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            />
          </div>

          {/* Filters Wrapper */}
          <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar gap-2 pb-2 md:pb-0">
            {/* Category Filter */}
            <select 
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none cursor-pointer hover:bg-gray-100 transition-colors shrink-0 appearance-none pr-8 relative"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>

            {/* Status Filter */}
            <select 
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none cursor-pointer hover:bg-gray-100 transition-colors shrink-0 appearance-none pr-8 relative"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
            </select>

            {/* Sort Toggle */}
            <button 
              onClick={() => setSortBy(prev => prev === 'newest' ? 'mostLiked' : 'newest')}
              className="ml-auto md:ml-4 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors shrink-0 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {sortBy === 'newest' ? 'Newest First' : 'Most Liked'}
            </button>
          </div>
        </div>

        {/* Masonry Grid */}
        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="break-inside-avoid">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : requests.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
            {requests.map(request => (
              <div key={request._id} className="break-inside-avoid">
                <RequestCard request={request} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query.</p>
          </div>
        )}

      </div>

      <RequestFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadRequests} 
      />
    </div>
  );
};

export default RequestsPage;
