import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAdminShortcut = () => {
  const [sequence, setSequence] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Safety check for e.key
      if (!e.key) return;

      // We only care about the "A" key
      if (e.key.toLowerCase() === 'a') {
        setSequence((prev) => {
          const newSequence = [...prev, 'a'];
          
          if (newSequence.length === 4) {
            navigate('/admin/login');
            return [];
          }
          
          return newSequence;
        });
      } else {
        // Reset if any other key is pressed
        setSequence([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Reset sequence if no key is pressed for 2 seconds
    const timeout = setTimeout(() => {
      setSequence([]);
    }, 2000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [sequence, navigate]);
};

export default useAdminShortcut;
