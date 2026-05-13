import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const BrowsePage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/marketplace', { replace: true });
  }, [navigate]);
  return null;
};

export default BrowsePage;
