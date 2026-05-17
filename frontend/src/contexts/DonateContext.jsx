import React, { createContext, useContext, useState, useEffect } from 'react';

const DonateContext = createContext();

export const useDonate = () => useContext(DonateContext);

export const DonateProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openDonateModal = () => {
    setTimeout(() => {
      setIsModalOpen(true);
    }, 3000);
  };

  const closeDonateModal = () => {
    setIsModalOpen(false);
  };

  // For testing or manual opening
  const forceOpenModal = () => {
    setIsModalOpen(true);
  };

  const [hasShownThisLoad, setHasShownThisLoad] = useState(false);

  // Cooldown workflow method - reset on every page load/refresh
  const openDonateWithCooldown = () => {
    if (!hasShownThisLoad) {
      setHasShownThisLoad(true);
      setTimeout(() => {
        setIsModalOpen(true);
      }, 3000);
    }
  };

  return (
    <DonateContext.Provider value={{ 
      isModalOpen, 
      openDonateModal, 
      closeDonateModal, 
      forceOpenModal,
      openDonateWithCooldown 
    }}>
      {children}
    </DonateContext.Provider>
  );
};
