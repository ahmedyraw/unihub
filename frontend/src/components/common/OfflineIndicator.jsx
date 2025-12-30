import React from 'react';
import { Alert } from 'react-bootstrap';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <Alert 
      variant="warning" 
      className="mb-0 text-center" 
      style={{ 
        position: 'fixed', 
        top: '60px', 
        left: 0, 
        right: 0, 
        zIndex: 1050,
        borderRadius: 0,
        padding: '0.75rem'
      }}
    >
      <strong>⚠️ No Internet Connection</strong> - You are currently offline. Some features may not be available.
    </Alert>
  );
};

export default OfflineIndicator;
