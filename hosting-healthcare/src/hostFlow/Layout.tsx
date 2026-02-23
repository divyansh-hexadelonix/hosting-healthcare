import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Box, 
  CalendarDays, 
  Monitor, 
  User, 
  MessageSquare, 
  LogOut, 
  ChevronsLeft,
  ChevronsRight,
  Bell,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../assets/AuthContext';
import { propertiesData } from '../data/propertiesData';
import Logo from '../assets/logo.png';
import './Layout.css';

// Helper: format timestamp into relative time or date label
const formatNotifTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const months = Math.floor(diff / (86400000 * 30));

  if (months >= 1) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days >= 1) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours >= 1) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (mins >= 1) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const formatNotifDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
};

// Avatar color palette based on name
const AVATAR_COLORS = ['#7c3aed', '#2563eb', '#059669', '#dc2626', '#d97706', '#0891b2'];
const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

interface Notification {
  id: string | number;
  guestName: string;
  avatar?: string;
  property: string;
  timestamp: string; // ISO string
  read: boolean;
  fullRequest?: any;
}

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Build notifications from hh_host_requests on mount and updates
  const loadNotifications = React.useCallback(() => {
    if (!user) return;
    const stored = JSON.parse(localStorage.getItem('hh_host_requests') || '[]');
    const readIds: string[] = JSON.parse(localStorage.getItem('hh_notif_read') || '[]');

    // Filter for this host
    const mine = stored.filter(
      (r: any) => (r.hostEmail || 'david@gmail.com') === user.email ||
                  (r.hostName || 'David Beckham') === user.name
    );

    const notifs: Notification[] = mine.map((r: any) => ({
      id: r.id,
      guestName: r.guestName,
      avatar: r.avatar,
      property: r.property,
      timestamp: r.timestamp || new Date().toISOString(),
      read: readIds.includes(String(r.id)),
      fullRequest: r,
    }));

    // Also include mock requests as read/historical (with stable timestamps for demo)
    const mockNotifs: Notification[] = [
      {
        id: 'mock-101',
        guestName: 'Craig Thomas',
        property: 'Grand Canyon Horseshoe Bend',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(), // 3 months ago
        read: readIds.includes('mock-101'),
        fullRequest: {
          id: 'mock-101',
          guestName: 'Craig Thomas',
          property: 'Grand Canyon Horseshoe Bend',
          moveIn: '2024-10-03',
          moveOut: '2024-10-04',
          avatar: 'https://randomuser.me/api/portraits/men/44.jpg'
        }
      },
      {
        id: 'mock-102',
        guestName: 'Sarah Jenkins',
        property: 'Modern Loft in City Center',
        timestamp: new Date('2025-02-20T10:00:00Z').toISOString(),
        read: readIds.includes('mock-102'),
        fullRequest: {
          id: 'mock-102',
          guestName: 'Sarah Jenkins',
          property: 'Modern Loft in City Center',
          moveIn: '2025-04-15',
          moveOut: '2025-04-20',
          avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
        }
      },
    ];

    // Merge: local requests first (newest), then mocks
    const all = [...notifs, ...mockNotifs];
    // Deduplicate by id
    const seen = new Set();
    const deduped = all.filter(n => {
      if (seen.has(String(n.id))) return false;
      seen.add(String(n.id));
      return true;
    });

    setNotifications(deduped);
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    window.addEventListener('hh_requests_updated', loadNotifications);
    window.addEventListener('storage', loadNotifications);
    return () => {
      window.removeEventListener('hh_requests_updated', loadNotifications);
      window.removeEventListener('storage', loadNotifications);
    };
  }, [loadNotifications]);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  const markAllAsRead = () => {
    const allIds = notifications.map(n => String(n.id));
    localStorage.setItem('hh_notif_read', JSON.stringify(allIds));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOneAsRead = (id: string | number) => {
    const readIds: string[] = JSON.parse(localStorage.getItem('hh_notif_read') || '[]');
    if (!readIds.includes(String(id))) {
      readIds.push(String(id));
      localStorage.setItem('hh_notif_read', JSON.stringify(readIds));
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleViewNotification = (n: Notification) => {
    markOneAsRead(n.id);
    setIsNotifOpen(false);

    const matched = propertiesData.find(p => p.hotelName === n.property);
    const row = {
      ...(n.fullRequest || {}),
      id: n.id,
      guestName: n.guestName,
      property: n.property,
      avatar: n.avatar,
      propertyImage: matched?.image,
      propertyCity: matched?.city,
      propertyPrice: matched?.price,
    };
    navigate('/booking-detail', { state: { row } });
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  // Define menu items with their respective routes
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Listings', path: '/my-listings', icon: <Box size={20} /> },
    { name: 'Bookings', path: '/bookings', icon: <CalendarDays size={20} /> },
    { name: 'Pricing Plan', path: '/pricing-plan', icon: <Monitor size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Inbox', path: '/inbox', icon: <MessageSquare size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      
      {/* --- PERSISTENT SIDEBAR --- */}
      <aside className={`layout-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo-container" style={{ position: 'relative', justifyContent: 'center' }}>
          <div className="sidebar-logo">
            {!isCollapsed && <img src={Logo} alt="Hosting Healthcare" style={{ height: '40px', maxWidth: '100%', objectFit: 'contain' }} />}
          </div>
          <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)} style={{ position: 'absolute', right: '20px' }}>
            {isCollapsed ? <ChevronsRight size={20} color="#888" /> : <ChevronsLeft size={20} color="#888" />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li 
                key={item.name} 
                className={`nav-item ${location.pathname.includes(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-text">{item.name}</span>}
              </li>
            ))}
          </ul>

          <div className="nav-divider"></div>

          <ul className="nav-list">
            <li className="nav-item logout-item" onClick={handleLogout}>
              <span className="nav-icon"><LogOut size={20} /></span>
              {!isCollapsed && <span className="nav-text">Logout</span>}
            </li>
          </ul>
        </nav>
      </aside>

      {/* --- RIGHT SIDE WRAPPER --- */}
      <div className="layout-main">
        
        {/* --- PERSISTENT HEADER --- */}
        <header className="layout-header">
          <div className="header-right">

            {/* Notification Button + Modal */}
            <div className="notif-wrapper" ref={notifRef}>
              <button
                className={`notification-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setIsNotifOpen(prev => !prev)}
                aria-label="Notifications"
              >
                <Bell size={20} color="#666" />
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {/* Notification Modal */}
              {isNotifOpen && (
                <div className="notif-modal">
                  <div className="notif-modal-header">
                    <h3 className="notif-modal-title">Notifications</h3>
                  </div>

                  <div className="notif-modal-body">
                    {/* Unread Section */}
                    {unread.length > 0 && (
                      <div className="notif-section">
                        <div className="notif-section-header">
                          <span className="notif-section-label">Unread</span>
                          <button className="mark-read-btn" onClick={markAllAsRead}>
                            Mark all as read
                          </button>
                        </div>
                        {unread.map(n => (
                          <NotifItem
                            key={n.id}
                            notif={n}
                            isUnread={true}
                            onViewNow={() => handleViewNotification(n)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Read / Historical Section */}
                    {read.length > 0 && (
                      <div className="notif-section">
                        {read.map((n, idx) => {
                          const dateLabel = formatNotifDate(n.timestamp);
                          const prevDateLabel = idx > 0 ? formatNotifDate(read[idx - 1].timestamp) : null;
                          const showDate = dateLabel !== prevDateLabel;
                          return (
                            <React.Fragment key={n.id}>
                              {showDate && (
                                <div className="notif-date-label">{dateLabel}</div>
                              )}
                              <NotifItem
                                notif={n}
                                isUnread={false}
                                onViewNow={() => handleViewNotification(n)}
                              />
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}

                    {notifications.length === 0 && (
                      <div className="notif-empty">
                        <Bell size={32} color="#ccc" />
                        <p>No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="user-profile-dropdown">
              <img src={user?.profileImage || "https://randomuser.me/api/portraits/men/32.jpg"} alt="User Profile" className="profile-avatar" />
              <div className="profile-info">
                <span className="profile-name">{user?.name}</span>
                <span className="profile-email">{user?.email}</span>
              </div>
              <ChevronDown size={16} color="#666" className="dropdown-icon" />
            </div>
          </div>
        </header>

        <main className="layout-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

// --- Notification Item Sub-component ---
interface NotifItemProps {
  notif: Notification;
  isUnread: boolean;
  onViewNow: () => void;
}

const NotifItem: React.FC<NotifItemProps> = ({ notif, isUnread, onViewNow }) => {
  const timeLabel = isUnread
    ? formatNotifTime(notif.timestamp)
    : formatNotifDate(notif.timestamp);

  return (
    <div className={`notif-item ${isUnread ? 'notif-item--unread' : ''}`}>
      {isUnread && <span className="notif-unread-dot" />}
      <div className="notif-avatar-wrap">
        {notif.avatar ? (
          <img src={notif.avatar} alt={notif.guestName} className="notif-avatar-img" />
        ) : (
          <div
            className="notif-avatar-initials"
            style={{ backgroundColor: getAvatarColor(notif.guestName) }}
          >
            {getInitials(notif.guestName)}
          </div>
        )}
      </div>
      <div className="notif-content">
        <p className="notif-text">
          <strong>{notif.guestName}</strong> has sent a booking request for your property.{' '}
          <button className="notif-view-btn" onClick={onViewNow}>View now</button>
        </p>
        <span className="notif-time">{timeLabel}</span>
      </div>
    </div>
  );
};

export default Layout;