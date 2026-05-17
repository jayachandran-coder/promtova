import React from 'react';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import BottomNav from '../components/BottomNav';
import AuthModal from '../components/auth/AuthModal';
import { NavProvider } from '../contexts/NavContext';

const MainLayout = ({ children }) => {
  return (
    <NavProvider>
      <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
        <TopNavbar />

        <div className="flex flex-1 relative">
          <Sidebar />
          
          <div className="flex-1 transition-all duration-300 min-w-0 md:pl-20 lg:pl-60 xl:pl-64 pt-16">
            <main className="w-full pb-24 md:pb-8 px-1 md:px-0">
              {children}
            </main>
          </div>
        </div>

        <BottomNav />
        <AuthModal />
      </div>
    </NavProvider>
  );
};

export default MainLayout;
