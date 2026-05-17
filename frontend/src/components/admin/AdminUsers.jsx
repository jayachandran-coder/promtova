import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, User, Mail, Calendar, Shield, MoreVertical } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { deleteUserAccount } from '../../services/api';

const AdminUsers = () => {
  const { users, setUsers, loading, refreshAll } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This will permanently remove their account and data.')) {
      try {
        await deleteUserAccount(id);
        setUsers(prev => prev.filter(u => u._id !== id));
        setSuccessMessage('User deleted successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
        refreshAll();
      } catch (err) {
        console.error('Error deleting user:', err);
        setErrorMessage('Failed to delete user');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-2 ring-gray-900 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-sm font-bold text-gray-400">Total Users:</span>
          <span className="text-sm font-black text-gray-900">{users.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-gray-50 rounded-[2.5rem] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredUsers.map((u) => (
              <motion.div
                key={u._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center">
                      {u.profileImage ? (
                        <img src={u.profileImage} alt={u.username} className="w-full h-full object-cover" />
                      ) : (
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt="avatar" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        {u.username}
                        {u.role === 'admin' && <Shield className="w-3.5 h-3.5 text-blue-500" />}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium truncate max-w-[150px]">{u.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(u._id)}
                    className="p-2.5 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-gray-50 p-3 rounded-2xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Joined</span>
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                   </div>
                   <div className="bg-gray-50 p-3 rounded-2xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Role</span>
                      <span className="text-xs font-bold text-gray-900 capitalize">{u.role}</span>
                   </div>
                </div>

                <div className="mt-6 flex items-center gap-6 px-2">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Liked</span>
                      <span className="text-sm font-black text-gray-900">{u.likedPrompts?.length || 0}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Saved</span>
                      <span className="text-sm font-black text-gray-900">{u.savedPrompts?.length || 0}</span>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredUsers.length === 0 && !loading && (
            <div className="col-span-full py-20 bg-white rounded-[3rem] border border-gray-100 text-center">
               <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                 <User className="w-10 h-10 text-gray-300" />
               </div>
               <h3 className="text-xl font-bold text-gray-900">No Users Found</h3>
               <p className="text-gray-400 mt-2">Try adjusting your search or sync the data.</p>
            </div>
          )}
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
            <User className="w-6 h-6" />
            <span className="font-bold">{successMessage || errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
