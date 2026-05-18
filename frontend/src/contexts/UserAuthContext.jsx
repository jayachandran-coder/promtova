import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signOut,
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { syncFirebaseUser } from '../services/api';

const getFriendlyAuthError = (error) => {
  if (!error) return 'An unexpected error occurred';
  const code = error.code;
  if (!code) return error.message || 'An unexpected error occurred';
  
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Google Authentication is currently disabled. Please enable it in your Firebase Console under Authentication > Sign-in method.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window closed before completing authentication.';
    case 'auth/too-many-requests':
      return 'Too many requests. Access has been temporarily disabled. Please try again later.';
    default:
      return error.message ? error.message.replace(/^Firebase:\s*/i, '') : 'Google authentication failed';
  }
};

const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          
          // Send it to the backend to sync and get a standard backend token + profile
          const res = await syncFirebaseUser(idToken);
          
          if (res.data && res.data.token) {
            localStorage.setItem('userToken', res.data.token);
            
            setUser({ 
              ...firebaseUser, 
              _id: res.data._id,
              username: res.data.username,
              email: res.data.email,
              role: res.data.role,
              savedPrompts: res.data.savedPrompts || [],
              likedPrompts: res.data.likedPrompts || [],
              profileImage: res.data.profileImage,
              displayName: firebaseUser.displayName || res.data.username,
              photoURL: firebaseUser.photoURL || res.data.profileImage
            });
          } else {
            setUser(firebaseUser);
          }
        } catch (error) {
          console.error("Error syncing Firebase user with backend:", error);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
        localStorage.removeItem('userToken');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        message: getFriendlyAuthError(err)
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <UserAuthContext.Provider value={{
      user,
      setUser,
      loading,
      loginWithGoogle,
      logout,
      isAuthModalOpen,
      openAuthModal,
      closeAuthModal,
      isAuthenticated: !!user
    }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) throw new Error('useUserAuth must be used within a UserAuthProvider');
  return context;
};
