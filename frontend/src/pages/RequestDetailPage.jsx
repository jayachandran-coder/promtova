import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MessageSquare, Send, CheckCircle, Search } from 'lucide-react';
import { fetchRequestById, likeRequest, commentRequest, fulfillRequest, fetchPrompts } from '../services/api';
import { useUserAuth } from '../contexts/UserAuthContext';
import { useAuth } from '../contexts/AuthContext';
import GalleryCard from '../components/GalleryCard';

const statusColors = {
  'Open': 'bg-gray-100 text-gray-700 border-gray-200',
  'In Progress': 'bg-orange-100 text-orange-700 border-orange-200',
  'Completed': 'bg-green-100 text-green-700 border-green-200'
};

const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserAuth();
  const { isAuthenticated: isAdmin } = useAuth(); // Admin context

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Like state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fulfill state (for admin/creators)
  const [showFulfill, setShowFulfill] = useState(false);
  const [searchPromptId, setSearchPromptId] = useState('');
  const [isFulfilling, setIsFulfilling] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [id, user]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const res = await fetchRequestById(id);
      setRequest(res.data);
      setLikesCount(res.data.likes?.length || 0);
      if (user && res.data.likes) {
        setIsLiked(res.data.likes.includes(user._id));
      }
    } catch (err) {
      console.error('Failed to load request:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) return navigate('/login');
    const prevLiked = isLiked;
    setIsLiked(!prevLiked);
    setLikesCount(prev => prevLiked ? prev - 1 : prev + 1);
    
    try {
      const res = await likeRequest(id);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prev => prevLiked ? prev + 1 : prev - 1);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate('/login');
    if (!commentText.trim()) return;

    try {
      setIsSubmittingComment(true);
      const res = await commentRequest(id, commentText);
      setRequest(prev => ({
        ...prev,
        comments: [...prev.comments, res.data]
      }));
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleFulfill = async () => {
    if (!searchPromptId.trim()) return;
    try {
      setIsFulfilling(true);
      await fulfillRequest(id, searchPromptId);
      await loadRequest(); // Reload to get updated status and populated prompt
      setShowFulfill(false);
    } catch (err) {
      alert('Failed to fulfill request. Make sure the Prompt ID is valid.');
      console.error(err);
    } finally {
      setIsFulfilling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-20">
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center pt-20">
        <h2 className="text-2xl font-black mb-4">Request Not Found</h2>
        <button onClick={() => navigate('/requests')} className="text-gray-500 hover:text-black underline">
          Back to Requests
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate('/requests')}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Requests
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area */}
          <div className="flex-1 space-y-8">
            
            {/* Request Details Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${statusColors[request.status]}`}>
                  {request.status}
                </span>
                <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs font-black uppercase tracking-wider text-gray-500">
                  {request.category}
                </span>
                <span className="text-xs font-bold text-gray-400 ml-auto">
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">
                {request.title}
              </h1>

              {/* Requester Info */}
              <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.createdBy?.username || 'user'}`} alt="avatar" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Requested by {request.createdBy?.username || 'Anonymous'}</p>
                </div>
              </div>

              {/* Description & Tags */}
              <div className="prose prose-lg max-w-none text-gray-600 font-medium mb-8">
                {request.description.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              {request.tags && request.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {request.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all
                    ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="font-bold">{likesCount} Likes</span>
                </button>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-600">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-bold">{request.comments?.length || 0} Comments</span>
                </div>
              </div>
            </div>

            {/* Fulfilled Prompt Section (If Completed) */}
            {request.status === 'Completed' && request.fulfilledPrompt && (
              <div className="bg-green-50 rounded-3xl p-6 md:p-8 border border-green-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <CheckCircle className="w-32 h-32 text-green-500" />
                </div>
                <h3 className="text-xl font-black text-green-900 mb-4 flex items-center gap-2 relative z-10">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  Request Fulfilled
                </h3>
                <p className="text-green-800 font-medium mb-6 relative z-10 max-w-lg">
                  This request has been fulfilled by the community. Check out the generated prompt below!
                </p>
                <div className="max-w-sm relative z-10">
                  <GalleryCard item={request.fulfilledPrompt} onClick={(item) => navigate(`/?prompt=${item._id}`)} />
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-8">Discussion</h3>
              
              <div className="space-y-6 mb-8">
                {request.comments?.length > 0 ? (
                  request.comments.map(comment => (
                    <div key={comment._id} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0 mt-1">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.username || 'user'}`} alt="avatar" />
                      </div>
                      <div className="flex-1 bg-gray-50 p-4 rounded-2xl rounded-tl-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-gray-900">{comment.user?.username || 'Anonymous'}</span>
                          <span className="text-xs font-medium text-gray-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 font-medium text-center py-4">No comments yet. Be the first to discuss this idea!</p>
                )}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleCommentSubmit} className="flex gap-3 relative">
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0 mt-1 hidden sm:block">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`} alt="avatar" />
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none pr-12 transition-all text-sm"
                  />
                  <button 
                    type="submit"
                    disabled={isSubmittingComment || !commentText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-lg disabled:opacity-50 hover:bg-gray-800 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Sidebar Area */}
          <div className="w-full lg:w-[350px] space-y-6">
            
            {/* Reference Image */}
            {request.imageUrl && (
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                <h4 className="font-black text-sm text-gray-900 mb-3 uppercase tracking-wider">Reference Image</h4>
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <img src={request.imageUrl} alt="Reference" className="w-full h-auto" />
                </div>
              </div>
            )}

            {/* Admin/Creator Tools */}
            {(isAdmin || user) && request.status !== 'Completed' && (
              <div className="bg-black text-white rounded-3xl p-6 shadow-xl">
                <h4 className="font-black text-lg mb-2">Can you build this?</h4>
                <p className="text-gray-400 text-sm font-medium mb-6">
                  If you've created a prompt that matches this request, link it here to mark the request as fulfilled.
                </p>
                
                {showFulfill ? (
                  <div className="space-y-4">
                    <input 
                      type="text"
                      placeholder="Paste Prompt ID here..."
                      value={searchPromptId}
                      onChange={(e) => setSearchPromptId(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm focus:border-white outline-none text-white placeholder-gray-500"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowFulfill(false)}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleFulfill}
                        disabled={isFulfilling || !searchPromptId.trim()}
                        className="flex-[2] py-3 px-4 rounded-xl font-bold text-sm bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isFulfilling ? 'Linking...' : 'Fulfill Request'}
                      </button>
                    </div>
                    {/* Note: Admin token might be needed based on routing setup. Ensure admin logs in or simplify logic. */}
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowFulfill(true)}
                    className="w-full py-4 bg-white text-black rounded-xl font-black flex items-center justify-center gap-2 hover:bg-gray-200 transition-all hover:scale-[1.02]"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Fulfill Request
                  </button>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailPage;
