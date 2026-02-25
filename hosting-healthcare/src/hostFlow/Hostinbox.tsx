import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import InboxPage from '../shared/InboxPage';

const HostInbox: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const { state } = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('hh_host_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  return (
    <InboxPage
      currentUserEmail={user?.email || ''}
      currentUserName={user?.name || ''}
      currentUserAvatar={user?.profileImage}
      role="host"
      openConvWith={state?.openConvWith}
      openConvWithName={state?.guestName}
      openConvWithAvatar={state?.guestAvatar}
    />
  );
};

export default HostInbox;