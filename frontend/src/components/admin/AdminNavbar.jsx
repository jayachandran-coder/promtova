import React from 'react';
import { Search, Bell, Menu, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';

const AdminNavbar = ({ setIsMobileOpen, title, onLogout }) => {
  const { adminId } = useAuth();
  const { refreshAll, loading } = useAdmin();

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
          >
            <Menu className="w-6 h-6 text-gray-500" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight capitalize">
            {title.replace('-', ' ')}
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          {/* Refresh Action */}
          <button 
            onClick={refreshAll}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
              ${loading ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95'}`}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          {/* Search Bar Desktop */}
          <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-48 lg:w-64 focus-within:ring-2 ring-gray-200 transition-all">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="relative p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            
            <div className="h-8 w-px bg-gray-100 mx-1 hidden md:block" />
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-3 pl-2 pr-1 py-1 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-900 leading-tight">{adminId}</span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Online</span>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border border-white">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Profile" />
                </div>
              </button>

              <button 
                onClick={onLogout}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
