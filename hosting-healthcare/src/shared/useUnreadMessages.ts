import { useState, useEffect, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  senderId: string;       
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;      
}

export interface Conversation {
  id: string;             
  guestEmail: string;
  guestName: string;
  guestAvatar?: string;
  hostEmail: string;
  hostName: string;
  hostAvatar?: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;   
}

const MSG_KEY  = 'hh_messages';
const READ_KEY = 'hh_msg_read';
const UPDATE_EVENT = 'hh_messages_updated';

/* Build a stable conversation id */
export const makeConvId = (guestEmail: string, hostEmail: string) =>
  `${guestEmail}___${hostEmail}`;

/* Parse convId back to parts */
export const parseConvId = (id: string) => {
  const [guestEmail, hostEmail] = id.split('___');
  return { guestEmail, hostEmail };
};

/* Read all raw message data from localStorage */
export const getAllMessages = (): Record<string, ChatMessage[]> => {
  try {
    return JSON.parse(localStorage.getItem(MSG_KEY) || '{}');
  } catch {
    return {};
  }
};

/* Read last-read timestamps */
const getReadMap = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || '{}');
  } catch {
    return {};
  }
};

/* Count unread messages in a conversation for a given user */
export const countUnread = (messages: ChatMessage[], userEmail: string, convId: string): number => {
  const readMap = getReadMap();
  const lastReadTs = readMap[`${convId}___${userEmail}`] || 0;
  return messages.filter(
    m => m.senderId !== userEmail && new Date(m.timestamp).getTime() > lastReadTs
  ).length;
};

/* Mark all messages in a conversation as read for a user */
export const markConversationRead = (convId: string, userEmail: string) => {
  const readMap = getReadMap();
  readMap[`${convId}___${userEmail}`] = Date.now();
  localStorage.setItem(READ_KEY, JSON.stringify(readMap));
  window.dispatchEvent(new Event(UPDATE_EVENT));
};

/* Send a message */
export const sendMessage = (
  convId: string,
  msg: Omit<ChatMessage, 'id' | 'timestamp'>
) => {
  const all = getAllMessages();
  const msgs = all[convId] || [];
  const newMsg: ChatMessage = {
    ...msg,
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    timestamp: new Date().toISOString(),
  };
  all[convId] = [...msgs, newMsg];
  localStorage.setItem(MSG_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(UPDATE_EVENT));
  return newMsg;
};

/* Hook: total unread count for a user across conversations they participate in their role */
export const useTotalUnread = (userEmail: string | undefined, role?: 'guest' | 'host') => {
  const [total, setTotal] = useState(0);

  const compute = useCallback(() => {
    if (!userEmail) { setTotal(0); return; }
    const all = getAllMessages();
    let count = 0;
    for (const [convId, msgs] of Object.entries(all)) {
      const { guestEmail, hostEmail } = parseConvId(convId);
      // Role-aware filtering: only count convos where this user is in the correct role
      if (role === 'guest' && guestEmail !== userEmail) continue;
      if (role === 'host'  && hostEmail  !== userEmail) continue;
      // No role specified: fall back to any participation (backwards-compat)
      if (!role && guestEmail !== userEmail && hostEmail !== userEmail) continue;
      count += countUnread(msgs, userEmail, convId);
    }
    setTotal(count);
  }, [userEmail, role]);

  useEffect(() => {
    compute();
    window.addEventListener(UPDATE_EVENT, compute);
    window.addEventListener('storage', compute);
    return () => {
      window.removeEventListener(UPDATE_EVENT, compute);
      window.removeEventListener('storage', compute);
    };
  }, [compute]);

  return total;
};

//Seed mock conversations so the inbox isn't empty on first load
export const seedMockConversations = () => {
  const all = getAllMessages();
const CONV1 = makeConvId('test@gmail.com', 'david@gmail.com');
const CONV2 = makeConvId('test@gmail.com', 'david@gmail.com');

  if (!all[CONV1]) {
    all[CONV1] = [
      {
        id: 'seed-1',
        senderId: 'david@gmail.com',
        senderName: 'David Beckham',
        senderAvatar: 'https://randomuser.me/api/portraits/men/75.jpg',
        text: 'Hello Craig, Let me Check! your Booking request. will warmly welcome you to my property',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      },
      {
        id: 'seed-2',
        senderId: 'test@gmail.com',
        senderName: 'Dr. Craig Thomas',
        senderAvatar: 'https://img.freepik.com/free-photo/doctor-smiling-with-stethoscope_1154-36.jpg',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco labori',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: 'seed-3',
        senderId: 'david@gmail.com',
        senderName: 'David Beckham',
        senderAvatar: 'https://randomuser.me/api/portraits/men/75.jpg',
        text: 'Hello Craig, Let me Check! your Booking request.',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
    ];
  }

  localStorage.setItem(MSG_KEY, JSON.stringify(all));
};

// ONLINE SYSTEM
const ONLINE_KEY = 'hh_online_users';
const HEARTBEAT_INTERVAL = 20_000;  
const ONLINE_THRESHOLD   = 35_000;   

/* Write / refresh a user's online heartbeat */
const writeHeartbeat = (email: string) => {
  try {
    const map: Record<string, number> = JSON.parse(localStorage.getItem(ONLINE_KEY) || '{}');
    map[email] = Date.now();
    localStorage.setItem(ONLINE_KEY, JSON.stringify(map));
    window.dispatchEvent(new StorageEvent('storage', { key: ONLINE_KEY }));
  } catch {}
};

/* Remove a user's heartbeat (mark offline) */
const removeHeartbeat = (email: string) => {
  try {
    const map: Record<string, number> = JSON.parse(localStorage.getItem(ONLINE_KEY) || '{}');
    delete map[email];
    localStorage.setItem(ONLINE_KEY, JSON.stringify(map));
    window.dispatchEvent(new StorageEvent('storage', { key: ONLINE_KEY }));
  } catch {}
};

/* Check if a specific email is currently online */
export const isUserOnline = (email: string): boolean => {
  try {
    const map: Record<string, number> = JSON.parse(localStorage.getItem(ONLINE_KEY) || '{}');
    const last = map[email];
    return !!last && (Date.now() - last) < ONLINE_THRESHOLD;
  } catch { return false; }
};

export const useOnlinePresence = (userEmail: string | undefined): Set<string> => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userEmail) return;

    writeHeartbeat(userEmail);
    const heartbeatTimer = window.setInterval(() => {
      writeHeartbeat(userEmail);
    }, HEARTBEAT_INTERVAL);

    const handleUnload = () => removeHeartbeat(userEmail);
    window.addEventListener('beforeunload', handleUnload);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        writeHeartbeat(userEmail);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    //Read online users every 5 s + on storage events
    const readOnline = () => {
      try {
        const map: Record<string, number> = JSON.parse(localStorage.getItem(ONLINE_KEY) || '{}');
        const now = Date.now();
        const online = new Set(
          Object.entries(map)
            .filter(([, ts]) => now - ts < ONLINE_THRESHOLD)
            .map(([email]) => email)
        );
        setOnlineUsers(online);
      } catch {}
    };

    readOnline();
    const readTimer = window.setInterval(readOnline, 5_000);
    window.addEventListener('storage', readOnline);

    return () => {
      clearInterval(heartbeatTimer);
      clearInterval(readTimer);
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('storage', readOnline);
      removeHeartbeat(userEmail);
    };
  }, [userEmail]);

  return onlineUsers;
};

// MESSAGE READ STATUS
export type MessageStatus = 'sent' | 'delivered' | 'read';
export const getMessageStatus = (
  msg: ChatMessage,
  convId: string,
  recipientEmail: string,
  onlineUsers: Set<string>
): MessageStatus => {

  try {
    const readMap: Record<string, number> = JSON.parse(localStorage.getItem(READ_KEY) || '{}');
    const lastReadTs = readMap[`${convId}___${recipientEmail}`] || 0;
    if (lastReadTs >= new Date(msg.timestamp).getTime()) return 'read';
  } catch {}

  if (onlineUsers.has(recipientEmail)) return 'delivered';

  return 'sent';
};