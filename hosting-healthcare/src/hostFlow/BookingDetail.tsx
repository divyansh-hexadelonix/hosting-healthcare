import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, X, MessageSquare } from 'lucide-react';
import { propertiesData } from '../data/propertiesData';
import './BookingDetail.css';

const getDuration = (moveIn: string, moveOut: string): string => {
  try {
    const parse = (s: string) => { const [d, m, y] = s.split('-').map(Number); return new Date(y, m - 1, d); };
    const days = Math.round((parse(moveOut).getTime() - parse(moveIn).getTime()) / 86400000);
    if (days <= 0) return '';
    const months = Math.floor(days / 30);
    const weeks  = Math.floor(days / 7);
    if (months >= 1) return `${months} Month${months > 1 ? 's' : ''}`;
    if (weeks  >= 1) return `${weeks} Week${weeks > 1 ? 's' : ''}`;
    return `${days} Day${days > 1 ? 's' : ''}`;
  } catch { return ''; }
};

const formatDate = (s: string): string => {
  try {
    const [d, m, y] = s.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return s; }
};

const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const MOCK_GUEST_DB: Record<string, any> = {
  'Craig Thomas': {
    guestEmail: 'craig09@gmail.com',
    guestPhone: '+51 460 938 9048',
    guestLicense: 'ABC029010',
    guestFacilityName: 'Canada International Hospital',
    guestContactName: 'Dr. Jack Dawis',
    guestContactNumber: '546-9870-666',
    avatar: 'https://img.freepik.com/free-photo/doctor-smiling-with-stethoscope_1154-36.jpg',
  },
  'Sarah Jenkins': {
    guestEmail: 'sarah.jenkins@medstaff.com',
    guestPhone: '+1 312 445 8821',
    guestLicense: 'SJ-MDL-4492',
    guestFacilityName: "St. Mary's Medical Center",
    guestContactName: 'Dr. Alan Reed',
    guestContactNumber: '312-000-9921',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  'Daniel Kyte': {
    guestEmail: 'dkyte@healthgroup.org',
    guestPhone: '+44 20 7946 0023',
    guestLicense: 'DK-UK-88312',
    guestFacilityName: 'Westbrook NHS Trust',
    guestContactName: 'Dr. Priya Nair',
    guestContactNumber: '020-7946-9100',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
};

const BookingDetail: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const row = state?.row as any;

  const isAlreadyAccepted = (row?.status || '').toLowerCase() === 'accepted';
  const [actionDone, setActionDone] = useState<'accepted' | 'rejected' | null>(
    isAlreadyAccepted ? 'accepted' : null
  );

  // Navigate to host inbox and auto-open conversation with this guest
  const handleMessageGuest = () => {
    navigate('/host-inbox', {
      state: {
        openConvWith: guest?.guestEmail,
        guestName: guest?.guestName,
        guestAvatar: guest?.avatar,
      }
    });
  };

  const guest = useMemo(() => {
    if (!row) return null;

    let dbData: any = {};
    try {
      const dbUsers: any[] = JSON.parse(localStorage.getItem('hh_users_db') || '[]');
      const found = dbUsers.find((u: any) => u.name === row.guestName);
      if (found) {
        dbData = {
          guestEmail: found.email,
          guestPhone: found.contactNumber,
          guestLicense: found.medicalLicense,
        };
      }
    } catch {}

    const mock = MOCK_GUEST_DB[row.guestName] || {};
    return {
      ...mock,
      ...dbData,
      ...row,
      guestFacilityName: row.guestFacilityName || mock.guestFacilityName || '',
      guestContactName:  row.guestContactName  || mock.guestContactName  || '',
      guestContactNumber: row.guestContactNumber || mock.guestContactNumber || '',
    };
  }, [row]);

  const propertyData = useMemo(() =>
    propertiesData.find(p => p.hotelName === row?.property),
  [row]);

  const propertyImage = propertyData?.image ||
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=400&fit=crop';

  if (!row || !guest) {
    return (
      <div className="bd-empty">
        <p>No booking details found.</p>
        <button onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      </div>
    );
  }

  const duration = getDuration(guest.moveIn, guest.moveOut);

  // Write a notification for the guest so they see it in their Header bell
  const writeGuestNotification = (type: 'accepted' | 'rejected') => {
    try {
      const guestEmail =
        guest.guestEmail ||
        (() => {
          const db: any[] = JSON.parse(localStorage.getItem('hh_users_db') || '[]');
          return db.find((u: any) => u.name === guest.guestName)?.email || '';
        })();

      if (!guestEmail) return;

      const notifs: any[] = JSON.parse(localStorage.getItem('hh_guest_notifications') || '[]');
      // Avoids duplicate-update if same bookingId exist
      const existingIdx = notifs.findIndex(
        n => n.bookingId === row.id
      );
      const notif = {
        id: `gn-${row.id || Date.now()}`,
        bookingId: row.id,
        guestEmail,
        type,
        hotelName: row.property,
        timestamp: new Date().toISOString(),
        read: false,
      };
      if (existingIdx >= 0) notifs[existingIdx] = notif;
      else notifs.unshift(notif);

      localStorage.setItem('hh_guest_notifications', JSON.stringify(notifs));
      window.dispatchEvent(new Event('hh_guest_notifications_updated'));
    } catch {}
  };

  const handleAccept = () => {
    setActionDone('accepted');
    const requests: any[] = JSON.parse(localStorage.getItem('hh_host_requests') || '[]');
    localStorage.setItem('hh_host_requests', JSON.stringify(
      requests.map(r => r.id === row.id ? { ...r, status: 'Accepted' } : r)
    ));
    writeGuestNotification('accepted');
    window.dispatchEvent(new Event('hh_requests_updated'));
  };

  const handleReject = () => {
    setActionDone('rejected');
    const requests: any[] = JSON.parse(localStorage.getItem('hh_host_requests') || '[]');
    localStorage.setItem('hh_host_requests', JSON.stringify(
      requests.filter(r => r.id !== row.id)
    ));
    writeGuestNotification('rejected');
    window.dispatchEvent(new Event('hh_requests_updated'));
    setTimeout(() => navigate('/bookings'), 1000);
  };

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  return (
    <div className="bd-page">

      <div className="bd-layout">

        {/*-- LEFT PANEL-Guest Details --*/}
        <div className="bd-left">
          <h2 className="bd-section-title">Guest Details</h2>

          <div className="bd-avatar-box">
            {guest.avatar ? (
              <img src={guest.avatar} alt={guest.guestName} className="bd-avatar-img" />
            ) : (
              <div className="bd-avatar-initials">{getInitials(guest.guestName)}</div>
            )}
          </div>

          <div className="bd-name-row">
            <span className="bd-guest-name">{guest.guestName}</span>
            <button className="bd-msg-btn" aria-label="Message guest" onClick={handleMessageGuest}>
              <MessageSquare size={16} />
            </button>
          </div>

          <div className="bd-info-list">
            {guest.guestEmail && (
              <div className="bd-info-item">
                <span className="bd-info-label">Email:</span>
                <span className="bd-info-value">{guest.guestEmail}</span>
              </div>
            )}
            {guest.guestPhone && (
              <div className="bd-info-item">
                <span className="bd-info-label">Contact No:</span>
                <span className="bd-info-value">{guest.guestPhone}</span>
              </div>
            )}
            {guest.guestLicense && (
              <div className="bd-info-item">
                <span className="bd-info-label">Medical License Number:</span>
                <span className="bd-info-value">{guest.guestLicense}</span>
              </div>
            )}
            {(guest.guestFacilityName || guest.guestContactName || guest.guestContactNumber) && (
              <div className="bd-info-item">
                <span className="bd-info-label">Facility Details:</span>
                <div className="bd-facility-lines">
                  {guest.guestFacilityName && <span>{guest.guestFacilityName}</span>}
                  {guest.guestContactName  && <span>{guest.guestContactName}</span>}
                  {guest.guestContactNumber && <span>{guest.guestContactNumber}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/*-- RIGHT PANEL-Property --*/}
        <div className="bd-right">
          <h2 className="bd-section-title">Property</h2>

          <div className="bd-property-card">
            <div className="bd-property-img-wrap">
              <img src={propertyImage} alt={guest.property} className="bd-property-img" />
            </div>

            <div className="bd-property-info">
              <h3 className="bd-property-name">
                {guest.property}
                {propertyData?.city && `, ${propertyData.city}`}
              </h3>

              {propertyData?.price && (
                <p className="bd-property-price">{propertyData.price}</p>
              )}

              <div className="bd-dates-row">
                <div className="bd-date-block">
                  <span className="bd-date-label">Move-in</span>
                  <span className="bd-date-value">{formatDate(guest.moveIn)}</span>
                </div>

                {duration && <span className="bd-duration-pill">{duration}</span>}

                <div className="bd-date-block">
                  <span className="bd-date-label">Move-out</span>
                  <span className="bd-date-value">{formatDate(guest.moveOut)}</span>
                </div>
              </div>

              {actionDone === 'accepted' ? (
                <div className="bd-accepted-banner">
                  <Check size={18} /> Accepted
                </div>
              ) : actionDone === 'rejected' ? (
                <div className="bd-feedback bd-feedback--rejected">
                  <X size={17} /> Request Rejected. Redirecting…
                </div>
              ) : (
                <div className="bd-actions">
                  <button className="bd-btn bd-btn--accept" onClick={handleAccept}>
                    <Check size={16} /> Accept
                  </button>
                  <button className="bd-btn bd-btn--reject" onClick={handleReject}>
                    <X size={16} /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingDetail;