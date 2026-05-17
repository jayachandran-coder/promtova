import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import DashboardHome from './DashboardHome';
import UploadPrompt from './UploadPrompt';
import ManagePrompts from './ManagePrompts';
import Analytics from './Analytics';
import AdminSettings from './AdminSettings';
import AdminRequests from './AdminRequests';
import AdminUsers from './AdminUsers';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminProvider } from '../../contexts/AdminContext';

const AdminLayout = ({ onLogout }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const renderPage = () => {
    switch(activePage) {
      case 'dashboard': return <DashboardHome />;
      case 'upload': return <UploadPrompt />;
      case 'manage': return <ManagePrompts />;
      case 'analytics': return <Analytics />;
      case 'requests': return <AdminRequests />;
      case 'users': return <AdminUsers />;
      case 'settings': return <AdminSettings />;
      default: return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
            <span className="text-4xl">🚧</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 capitalize">{activePage} Page</h3>
          <p className="text-gray-400 mt-2">This module is currently under development.</p>
        </div>
      );
    }
  };

  return (
    <AdminProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar 
          activePage={activePage} 
          setActivePage={setActivePage}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          onLogout={onLogout}
        />
        
        <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
          <AdminNavbar 
            setIsMobileOpen={setIsMobileOpen} 
            title={activePage}
            onLogout={onLogout}
          />
          
          <main className="flex-1 p-4 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="py-8 px-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400">
             <span>© 2026 PROMPTOVA ADMIN ENGINE</span>
             <button 
               onClick={onLogout}
               className="px-4 py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
             >
               Logout Session
             </button>
          </footer>
        </div>
      </div>
    </AdminProvider>
  );
};

export default AdminLayout;
