import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Mic, Search, Check, CheckCheck, MessageCircle } from 'lucide-react';
import {
  getAllMessages,
  sendMessage,
  markConversationRead,
  countUnread,
  makeConvId,
  parseConvId,
  seedMockConversations,
  getMessageStatus,
  useOnlinePresence,
  ChatMessage,
  Conversation,
  MessageStatus,
} from './useUnreadMessages';
import './InboxPage.css';

//Known users registry
const KNOWN_USERS: Record<string, { name: string; avatar: string }> = {
  'david@gmail.com': {
    name: 'David Beckham',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  'test@gmail.com': {
    name: 'Dr. Craig Thomas',
    avatar: 'https://img.freepik.com/free-photo/doctor-smiling-with-stethoscope_1154-36.jpg',
  },
};

//Helpers
const getInitials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
};

const formatMsgTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

//tick component
interface TicksProps {
  status: MessageStatus;
}

const MessageTicks: React.FC<TicksProps> = ({ status }) => {
  if (status === 'sent') {
    return <Check size={13} className="msg-tick msg-tick--sent" />;
  }
  if (status === 'delivered') {
    return <CheckCheck size={13} className="msg-tick msg-tick--delivered" />;
  }
  return <CheckCheck size={13} className="msg-tick msg-tick--read" />;
};


interface InboxPageProps {
  currentUserEmail: string;
  currentUserName: string;
  currentUserAvatar?: string;
  role: 'guest' | 'host';
  openConvWith?: string;
  openConvWithName?: string;
  openConvWithAvatar?: string;
}

//Main Component
const InboxPage: React.FC<InboxPageProps> = ({
  currentUserEmail,
  currentUserName,
  currentUserAvatar,
  role,
  openConvWith,
  openConvWithName,
  openConvWithAvatar,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchText, setSearchText] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const openConvHandled = useRef(false);
  const prevConvIdRef = useRef<string | null>(null);

  
  const onlineUsers = useOnlinePresence(currentUserEmail || undefined);

  //Load conversations from localStorage — role-scoped so guest inbox ≠ host inbox
  const loadConversations = useCallback(() => {
    const all = getAllMessages();
    const convList: Conversation[] = [];

    for (const [convId, msgs] of Object.entries(all)) {
      const { guestEmail, hostEmail } = parseConvId(convId);

      // Role-aware: only include conversations where this user occupies their role position
      if (role === 'guest' && guestEmail !== currentUserEmail) continue;
      if (role === 'host'  && hostEmail  !== currentUserEmail) continue;
      // Fallback if role somehow not provided
      if (!role && currentUserEmail !== guestEmail && currentUserEmail !== hostEmail) continue;

      const otherEmail = role === 'guest' ? hostEmail : guestEmail;
      const otherMeta = KNOWN_USERS[otherEmail] || { name: otherEmail.split('@')[0], avatar: '' };

      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : undefined;
      const unread = countUnread(msgs, currentUserEmail, convId);

      convList.push({
        id: convId,
        guestEmail,
        guestName:   KNOWN_USERS[guestEmail]?.name   || guestEmail,
        guestAvatar: KNOWN_USERS[guestEmail]?.avatar,
        hostEmail,
        hostName:    KNOWN_USERS[hostEmail]?.name    || hostEmail,
        hostAvatar:  KNOWN_USERS[hostEmail]?.avatar,
        messages: msgs,
        lastMessage: lastMsg,
        unreadCount: unread,
      });
    }

    convList.sort((a, b) => {
      const tA = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const tB = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return tB - tA;
    });

    setConversations(convList);
  }, [currentUserEmail]);

  useEffect(() => {
    seedMockConversations();
    loadConversations();
  }, [loadConversations]);

  //Auto-open conversation navigated from StayDetails / BookingDetail
  useEffect(() => {
    if (!openConvWith || !currentUserEmail || openConvHandled.current) return;

    // Use role to correctly assign guest/host positions in the convId
    const convId = role === 'host'
      ? makeConvId(openConvWith, currentUserEmail)   
      : makeConvId(currentUserEmail, openConvWith);  

    if (openConvWithName) {
      KNOWN_USERS[openConvWith] = {
        name: openConvWithName,
        avatar: openConvWithAvatar || '',
      };
    }

    const all = getAllMessages();
    if (!all[convId]) {
      all[convId] = [];
      localStorage.setItem('hh_messages', JSON.stringify(all));
    }

    openConvHandled.current = true;
    loadConversations();
    setActiveConvId(convId);
    markConversationRead(convId, currentUserEmail);
  }, [openConvWith, currentUserEmail, openConvWithName, openConvWithAvatar, loadConversations]);

  useEffect(() => {
    window.addEventListener('hh_messages_updated', loadConversations);
    window.addEventListener('storage', loadConversations);
    return () => {
      window.removeEventListener('hh_messages_updated', loadConversations);
      window.removeEventListener('storage', loadConversations);
    };
  }, [loadConversations]);

  //Scroll behavior: Instant on load/switch, Smooth on new message
  useEffect(() => {
    if (!activeConvId) {
      prevConvIdRef.current = null;
      return;
    }
    
    const container = messagesContainerRef.current;
    if (container) {
      if (activeConvId !== prevConvIdRef.current) {
        prevConvIdRef.current = activeConvId;
        container.scrollTop = container.scrollHeight;
      } else {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [activeConvId, conversations]);

  //Mark conversation read when opening it
  const openConversation = (convId: string) => {
    setActiveConvId(convId);
    markConversationRead(convId, currentUserEmail);
  };

  const handleSend = () => {
    if (!messageText.trim() || !activeConvId) return;
    sendMessage(activeConvId, {
      senderId: currentUserEmail,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      text: messageText.trim(),
    });
    setMessageText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId);
  const otherUser = activeConv
    ? role === 'guest'
      ? { email: activeConv.hostEmail,  name: activeConv.hostName,  avatar: activeConv.hostAvatar }
      : { email: activeConv.guestEmail, name: activeConv.guestName, avatar: activeConv.guestAvatar }
    : null;

  const filteredConvs = conversations.filter(c => {
    if (!searchText) return true;
    const lo = searchText.toLowerCase();
    const name = role === 'guest' ? c.hostName : c.guestName;
    return name.toLowerCase().includes(lo) || (c.lastMessage?.text || '').toLowerCase().includes(lo);
  });

  return (
    <div className="inbox-page">

      {/*-- LEFT: Conversation List --*/}
      <aside className="inbox-sidebar">
        <div className="inbox-sidebar-header">
          <h2 className="inbox-sidebar-title">Chats</h2>
        </div>

        <div className="inbox-search-wrap">
          <Search size={15} className="inbox-search-icon" />
          <input
            type="text"
            className="inbox-search-input"
            placeholder="Search conversations..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>

        <div className="inbox-conv-list">
          {filteredConvs.length === 0 && (
            <div className="inbox-empty-sidebar">No conversations yet.</div>
          )}

          {filteredConvs.map(conv => {
            const otherEmail  = role === 'guest' ? conv.hostEmail  : conv.guestEmail;
            const otherName   = role === 'guest' ? conv.hostName   : conv.guestName;
            const otherAvatar = role === 'guest' ? conv.hostAvatar : conv.guestAvatar;
            const isActive    = conv.id === activeConvId;
            const preview     = conv.lastMessage?.text || '';
            const timeLabel   = conv.lastMessage ? formatTime(conv.lastMessage.timestamp) : '';
            const isOnline    = onlineUsers.has(otherEmail);

            const lastMine = conv.lastMessage?.senderId === currentUserEmail;
            const previewStatus: MessageStatus | null = lastMine
              ? getMessageStatus(conv.lastMessage!, conv.id, otherEmail, onlineUsers)
              : null;

            return (
              <div
                key={conv.id}
                className={`inbox-conv-item ${isActive ? 'inbox-conv-item--active' : ''}`}
                onClick={() => openConversation(conv.id)}
              >
                <div className="inbox-conv-avatar-wrap">
                  {otherAvatar ? (
                    <img
                      src={otherAvatar}
                      alt={otherName}
                      className="inbox-conv-avatar"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="inbox-conv-avatar-initials">{getInitials(otherName)}</div>
                  )}
                  {isOnline && <span className="inbox-online-dot inbox-online-dot--active" />}
                </div>

                <div className="inbox-conv-text">
                  <div className="inbox-conv-top">
                    <span className="inbox-conv-name">{otherName}</span>
                    <span className="inbox-conv-time">{timeLabel}</span>
                  </div>
                  <div className="inbox-conv-bottom">
                    <span className={`inbox-conv-preview ${conv.unreadCount > 0 ? 'inbox-conv-preview--unread' : ''}`}>
                      {previewStatus && (
                        <span className="inbox-preview-tick">
                          <MessageTicks status={previewStatus} />
                        </span>
                      )}
                      {preview.length > 32 ? preview.slice(0, 32) + '…' : preview}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="inbox-unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/*-- RIGHT: Chat Window --*/}
      <div className="inbox-chat">
        {activeConv && otherUser ? (
          <>
            <div className="inbox-chat-header">
              <div className="inbox-chat-header-user">
                <div className="inbox-chat-header-avatar-wrap">
                  {otherUser.avatar ? (
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      className="inbox-chat-header-avatar"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="inbox-chat-header-initials">{getInitials(otherUser.name)}</div>
                  )}
                  {onlineUsers.has(otherUser.email) && (
                    <span className="inbox-chat-header-online-dot" />
                  )}
                </div>
                <div className="inbox-chat-header-text">
                  <span className="inbox-chat-header-name">{otherUser.name}</span>
                  {onlineUsers.has(otherUser.email) && (
                    <span className="inbox-chat-header-status">Online</span>
                  )}
                </div>
              </div>
            </div>

            <div className="inbox-messages" ref={messagesContainerRef}>
              <div className="inbox-messages-inner">
              {activeConv.messages.map((msg, idx) => {
                const isMine = msg.senderId === currentUserEmail;
                const showAvatar =
                  !isMine &&
                  (idx === 0 || activeConv.messages[idx - 1].senderId !== msg.senderId);

                const recipientEmail = otherUser.email;
                const status: MessageStatus = isMine
                  ? getMessageStatus(msg, activeConv.id, recipientEmail, onlineUsers)
                  : 'sent';

                return (
                  <div
                    key={msg.id}
                    className={`inbox-msg-row ${isMine ? 'inbox-msg-row--mine' : 'inbox-msg-row--theirs'}`}
                  >
                    {!isMine && (
                      <div className="inbox-msg-avatar-col">
                        {showAvatar ? (
                          msg.senderAvatar ? (
                            <img
                              src={msg.senderAvatar}
                              alt={msg.senderName}
                              className="inbox-msg-avatar"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="inbox-msg-avatar-initials">{getInitials(msg.senderName)}</div>
                          )
                        ) : (
                          <div className="inbox-msg-avatar-spacer" />
                        )}
                      </div>
                    )}

                    <div className="inbox-msg-bubble-col">
                      <div className={`inbox-msg-bubble ${isMine ? 'inbox-msg-bubble--mine' : 'inbox-msg-bubble--theirs'}`}>
                        <span className="inbox-msg-text">{msg.text}</span>
                        <span className="inbox-msg-meta">
                          <span className="inbox-msg-time">{formatMsgTime(msg.timestamp)}</span>
                          {isMine && <MessageTicks status={status} />}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            <div className="inbox-input-area">
              <textarea
                ref={inputRef}
                className="inbox-input"
                placeholder="Send a message..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <div className="inbox-input-actions">
                <button className="inbox-mic-btn" aria-label="Voice message">
                  <Mic size={20} color="#888" />
                </button>
                <button
                  className={`inbox-send-btn ${messageText.trim() ? 'inbox-send-btn--active' : ''}`}
                  onClick={handleSend}
                  aria-label="Send message"
                >
                  Send <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="inbox-no-chat">
            <div className="inbox-no-chat-icon"><MessageCircle size={72}/></div>
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;