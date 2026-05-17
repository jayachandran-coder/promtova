import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const useAdminShortcut = () => {
  const [sequence, setSequence] = useState('');
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.key) return;

      if (e.key.toLowerCase() === 'a') {
        setSequence((prev) => prev + 'a');
      } else {
        setSequence('');
      }

      // Reset sequence if no key is pressed for 2 seconds
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setSequence(''), 2000);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (sequence === 'aaaa') {
      setSequence('');
      navigate('/admin/login');
    }
  }, [sequence, navigate]);
};

export default useAdminShortcut;
