import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function VerifyEmail() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');

    axios
      .get(`http://localhost:5002/api/users/verify-email?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Something went wrong.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      });
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Email Verification</h2>
        <div
          style={{
            ...styles.alert,
            backgroundColor: status === 'success' ? '#d4edda' : '#f8d7da',
            color: status === 'success' ? '#155724' : '#721c24',
            borderColor: status === 'success' ? '#c3e6cb' : '#f5c6cb',
          }}
        >
          {message}
        </div>
        <p style={{ marginTop: '1rem', fontSize: '14px', color: '#666' }}>
          You will be redirected shortly...
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
  },
  card: {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '90%',
    maxWidth: '400px',
  },
  alert: {
    padding: '1rem',
    borderRadius: '5px',
    border: '1px solid',
  },
};
