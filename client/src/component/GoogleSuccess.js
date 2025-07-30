import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const role = params.get('role');

    if (token && role) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      // ✅ تأخير التوجيه لفترة قصيرة بعد التخزين
      setTimeout(() => {
        navigate('/');
      }, 100); // 100ms كافية للتخزين
    } else {
      console.warn("Token or role missing");
      navigate('/login');
    }
  }, [navigate]);

  return <div>Redirecting...</div>;
};

export default Success;
