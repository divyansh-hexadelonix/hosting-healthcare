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
import { useTotalUnread } from '../shared/useUnreadMessages';
import { propertiesData } from '../data/propertiesData';
import Logo from '../assets/logo.png';
import './Layout.css';

// Format relative time — compact like Slack / Linear
const formatRelativeTime = (isoString: string): string => {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins   = Math.floor(diff / 60000);
  const hours  = Math.floor(diff / 3600000);
  const days   = Math.floor(diff / 86400000);
  const months = Math.floor(diff / (86400000 * 30));
  if (months >= 1) return `${months}mo ago`;
  if (days >= 1)   return `${days}d ago`;
  if (hours >= 1)  return `${hours}h ago`;
  if (mins >= 1)   return `${mins}m ago`;
  return 'Just now';
};

const getGroupLabel = (isoString: string): string | null => {
  const date = new Date(isoString);
  const now  = new Date();
  const startOfToday     = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const ts               = date.getTime();

  if (ts >= startOfToday)     return null;        
  if (ts >= startOfYesterday) return 'Yesterday';
  const daysAgo = Math.floor((startOfToday - ts) / 86400000);
  if (daysAgo < 7) return date.toLocaleDateString('en-GB', { weekday: 'long' });
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
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
  timestamp: string;
  read: boolean;
  type?: 'booking_request' | 'cancellation';
  fullRequest?: any;
}

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState<any>(null);

  const loadHostUser = React.useCallback(() => {
    const stored = localStorage.getItem('hh_host_user');
    if (stored) setUser(JSON.parse(stored));
    else setUser(null);
  }, []);

  useEffect(() => {
    loadHostUser();
    window.addEventListener('hh_host_user_updated', loadHostUser);
    return () => window.removeEventListener('hh_host_user_updated', loadHostUser);
  }, [loadHostUser]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Unread messages badge for sidebar Inbox item
  const inboxUnread = useTotalUnread(user?.email, 'host');

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
      type: 'booking_request' as const,
      fullRequest: r,
    }));

    const mockNotifs: Notification[] = [
      {
        id: 'mock-101',
        guestName: 'Craig Thomas',
        property: 'Grand Canyon Horseshoe Bend',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
        read: readIds.includes('mock-101'),
        type: 'booking_request',
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
        type: 'booking_request',
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

    // Load guest cancellation notifications for this host
    const cancelNotifs: Notification[] = (() => {
      try {
        const raw: any[] = JSON.parse(localStorage.getItem('hh_host_cancel_notifications') || '[]');
        return raw
          .filter(n => n.hostEmail === user.email || n.hostName === user.name)
          .map(n => ({
            id: `cancel-${n.bookingId}`,
            guestName: n.guestName,
            avatar: n.guestAvatar,
            property: n.hotelName,
            timestamp: n.timestamp,
            read: readIds.includes(`cancel-${n.bookingId}`),
            type: 'cancellation' as const,
          }));
      } catch { return []; }
    })();

    const all = [...cancelNotifs, ...notifs, ...mockNotifs];
    const seen = new Set();
    const deduped = all.filter(n => {
      if (seen.has(String(n.id))) return false;
      seen.add(String(n.id));
      return true;
    });

    // Always sort newest-first so latest dates appear at the top
    deduped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setNotifications(deduped);
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    window.addEventListener('hh_requests_updated', loadNotifications);
    window.addEventListener('storage', loadNotifications);
    window.addEventListener('hh_host_cancel_notifications_updated', loadNotifications);
    return () => {
      window.removeEventListener('hh_requests_updated', loadNotifications);
      window.removeEventListener('storage', loadNotifications);
      window.removeEventListener('hh_host_cancel_notifications_updated', loadNotifications);
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

    const matched = propertiesData.find(p => p.propertyName === n.property);
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
    { name: 'Pricing Plan', path: '/pricing', icon: <Monitor size={20} /> },
    { name: 'Profile', path: '/host-my-profile', icon: <User size={20} /> },
    { name: 'Inbox', path: '/host-inbox', icon: <MessageSquare size={20} />, badge: inboxUnread },
  ];

  const handleLogout = () => {
    localStorage.removeItem('hh_host_user');
    window.dispatchEvent(new Event('hh_host_user_updated'));
    navigate('/host-login');
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
                <span className="nav-icon" style={{ position: 'relative' }}>
                  {item.icon}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="sidebar-inbox-badge">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </span>
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
                  {/* Header */}
                  <div className="notif-modal-header">
                    <div className="notif-modal-header-left">
                      <h3 className="notif-modal-title">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="notif-header-count">{unreadCount}</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button className="mark-read-btn" onClick={markAllAsRead}>
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Body */}
                  <div className="notif-modal-body">
                    {notifications.length === 0 && (
                      <div className="notif-empty">
                        <div className="notif-empty-icon">
                          <Bell size={28} color="#c4b5fd" />
                        </div>
                        <p className="notif-empty-title">You're all caught up!</p>
                        <p className="notif-empty-sub">New booking activity will appear here.</p>
                      </div>
                    )}

                    {unread.length > 0 && (
                      <div className="notif-group">
                        <div className="notif-group-label">
                          <span>New</span>
                          <span className="notif-group-pill">{unread.length}</span>
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

                    {read.length > 0 && (
                      <div className={`notif-group ${unread.length > 0 ? 'notif-group--bordered' : ''}`}>
                        {unread.length === 0 && (
                          <div className="notif-group-label"><span>Earlier</span></div>
                        )}
                        {(() => {
                          let lastLabel: string | null = '__init__';
                          return read.map(n => {
                            const label = getGroupLabel(n.timestamp);
                            const showLabel = label !== lastLabel;
                            lastLabel = label;
                            return (
                              <React.Fragment key={n.id}>
                                {showLabel && label && (
                                  <div className="notif-date-sep">{label}</div>
                                )}
                                <NotifItem
                                  notif={n}
                                  isUnread={false}
                                  onViewNow={() => handleViewNotification(n)}
                                />
                              </React.Fragment>
                            );
                          });
                        })()}
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
  const isCancellation = notif.type === 'cancellation';
  const timeLabel = formatRelativeTime(notif.timestamp);

  return (
    <div
      className={`notif-item ${isUnread ? 'notif-item--unread' : ''}`}
      onClick={!isCancellation ? onViewNow : undefined}
      style={{ cursor: isCancellation ? 'default' : 'pointer' }}
    >
      {isUnread && <span className="notif-unread-dot" />}

      {/* Avatar with type badge */}
      <div className="notif-avatar-wrap">
        {notif.avatar ? (
          <img src={notif.avatar} alt={notif.guestName} className="notif-avatar-img" />
        ) : (
          <div
            className="notif-avatar-initials"
            style={{ background: getAvatarColor(notif.guestName) }}
          >
            {getInitials(notif.guestName)}
          </div>
        )}
        <span className={`notif-type-dot notif-type-dot--${isCancellation ? 'cancel' : 'request'}`} />
      </div>

      <div className="notif-content">
        <p className="notif-text">
          {isCancellation ? (
            <><strong>{notif.guestName}</strong> cancelled their booking for <strong>{notif.property}</strong>.</>
          ) : (
            <><strong>{notif.guestName}</strong> sent a booking request for <strong>{notif.property}</strong>.</>
          )}
        </p>
        <div className="notif-meta-row">
          <span className="notif-time">{timeLabel}</span>
          {!isCancellation && (
            <button className="notif-view-btn" onClick={e => { e.stopPropagation(); onViewNow(); }}>
              View →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;