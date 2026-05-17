import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Settings2, 
  BarChart3, 
  MessageSquare, 
  Users, 
  Settings,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'upload', icon: UploadCloud, label: 'Upload Prompt' },
  { id: 'manage', icon: Settings2, label: 'Manage Prompts' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'requests', icon: MessageSquare, label: 'Requests' },
  { id: 'users', icon: Users, label: 'Users' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

const AdminSidebar = ({ activePage, setActivePage, isMobileOpen, setIsMobileOpen, onLogout }) => {
  const { adminId } = useAuth();
  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] lg:hidden" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 h-full bg-white glass border-r border-gray-100 z-[100] transition-all duration-300
        ${isMobileOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0 w-72'}
      `}>
        <div className="flex flex-col h-full p-6">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-10 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">Admin Panel</span>
            </div>
            <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative text-left
                    ${isActive 
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'group-hover:text-gray-900'}`} />
                  <span className="font-semibold text-sm">{item.label}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="adminActiveIndicator"
                      className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Section Bottom */}
          <div className="mt-auto pt-6 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adminId}`} 
                  className="w-10 h-10 rounded-2xl shadow-sm border border-gray-100" 
                  alt="Admin" 
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{adminId}</span>
                  <span className="text-xs text-gray-400">Super Admin</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
