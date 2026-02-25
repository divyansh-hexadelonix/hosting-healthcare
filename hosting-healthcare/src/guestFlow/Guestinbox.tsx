import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../assets/AuthContext';
import InboxPage from '../shared/InboxPage';

const GuestInbox: React.FC = () => {
  const { user } = useAuth();
  const { state } = useLocation();

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  return (
    <InboxPage
      currentUserEmail={user?.email || ''}
      currentUserName={user?.name || ''}
      currentUserAvatar={user?.profileImage}
      role="guest"
      openConvWith={state?.openConvWith}
      openConvWithName={state?.hostName}
      openConvWithAvatar={state?.hostAvatar}
    />
  );
};

export default GuestInbox;