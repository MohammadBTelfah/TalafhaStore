import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const role = params.get('role') || 'user'; // احتياطي

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      // ✅ استخدم setTimeout للتأكد من تخزين البيانات قبل التوجيه
      setTimeout(() => {
        navigate(role === 'admin' ? '/dashboard' : '/');
      }, 100);
    } else {
      console.warn("Token or role missing");
      navigate('/login');
    }
  }, [navigate]);

  return <div>Redirecting...</div>;
};

export default Success;
