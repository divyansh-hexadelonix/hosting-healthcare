import React, { useState, useEffect, useRef } from 'react';
import './Inbox.css';

interface Message {
  id: string;
  sender: 'host' | 'customer';
  text: string;
  timestamp: number;
}

interface Chat {
  id: string;
  customerName: string;
  customerImage: string;
  lastMessage: string;
  unreadCount: number;
  messages: Message[];
  lastMessageTime: number;
}

const DEFAULT_CHATS: Chat[] = [
  {
    id: '1',
    customerName: 'Raj Thakur',
    customerImage: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'Thank you for the stay!',
    unreadCount: 0,
    messages: [
      {
        id: 'm1',
        sender: 'customer',
        text: 'Hi, when can I check in?',
        timestamp: Date.now() - 3600000,
      },
      {
        id: 'm2',
        sender: 'host',
        text: 'You can check in after 3 PM',
        timestamp: Date.now() - 3300000,

      },
      {
        id: 'm3',
        sender: 'customer',
        text: 'Thank you for the stay!',
        timestamp: Date.now() - 1800000,
      },
    ],
    lastMessageTime: Date.now() - 1800000,
  },
  {
    id: '2',
    customerName: 'Priya Singh',
    customerImage: 'https://i.pravatar.cc/150?img=2',
    lastMessage: 'Can you provide WiFi password?',
    unreadCount: 0,
    messages: [
      {
        id: 'm4',
        sender: 'customer',
        text: 'Can you provide WiFi password?',
        timestamp: Date.now() - 1200000,
      },
      {
        id: 'm5',
        sender: 'host',
        text: 'WiFi Password: HomeStay@2024',
        timestamp: Date.now() - 900000,
      },
    ],
    lastMessageTime: Date.now() - 900000,
  },
  {
    id: '3',
    customerName: 'Amit Gupta',
    customerImage: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Great property!',
    unreadCount: 0,
    messages: [
      {
        id: 'm6',
        sender: 'customer',
        text: 'Great property!',
        timestamp: Date.now() - 7200000,
      },
      {
        id: 'm7',
        sender: 'host',
        text: 'Thanks for staying with us!',
        timestamp: Date.now() - 6900000,
      },
    ],
    lastMessageTime: Date.now() - 6900000,
  },
  {
    id: '4',
    customerName: 'Grace David',
    customerImage: 'istockphoto-2150678874-612x612',
    lastMessage: 'Looking forward to visit',
    unreadCount: 0,
    messages: [
      {
        id: 'm8',
        sender: 'customer',
        text: 'Is the property near the beach?',
        timestamp: Date.now() - 10800000,
      },
      {
        id: 'm9',
        sender: 'host',
        text: 'Yes! Just 5 minutes walk from the beach.',
        timestamp: Date.now() - 10500000,
      },
      {
        id: 'm10',
        sender: 'customer',
        text: 'Looking forward to visit',
        timestamp: Date.now() - 9000000,
      },
    ],
    lastMessageTime: Date.now() - 9000000,
  },
  {
    id: '5',
    customerName: 'Aliena Watson',
    customerImage: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Booking confirmed!',
    unreadCount: 0,
    messages: [
      {
        id: 'm11',
        sender: 'customer',
        text: 'Booking confirmed!',
        timestamp: Date.now() - 14400000,
      },
    ],
    lastMessageTime: Date.now() - 14400000,
  },
];

function Inbox() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    const loadChats = () => {
      try {
        const savedChats = localStorage.getItem('hostChats');
        if (savedChats && savedChats !== '[]') {
          const parsedChats = JSON.parse(savedChats);
          setChats(parsedChats);
          if (parsedChats.length > 0) {
            setSelectedChatId(parsedChats[0].id);
          }
        } else {
          
          setChats(DEFAULT_CHATS);
          setSelectedChatId(DEFAULT_CHATS[0].id);
          localStorage.setItem('hostChats', JSON.stringify(DEFAULT_CHATS));
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        setChats(DEFAULT_CHATS);
        setSelectedChatId(DEFAULT_CHATS[0].id);
        localStorage.setItem('hostChats', JSON.stringify(DEFAULT_CHATS));
      }
      setIsLoading(false);
    };

    loadChats();

  
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save chats to local storage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('hostChats', JSON.stringify(chats));
    }
  }, [chats]);

  
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedChatId, chats]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !selectedChatId) return;

    const updatedChats = chats.map((chat) => {
      if (chat.id === selectedChatId) {
        const newMsg: Message = {
          id: `m${Date.now()}`,
          sender: 'host',
          text: newMessage,
          timestamp: Date.now(),
        };
        return {
          ...chat,
          messages: [...chat.messages, newMsg],
          lastMessage: newMessage,
          lastMessageTime: Date.now(),
        };
      }
      return chat;
    });

    setChats(updatedChats);
    setNewMessage('');
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    const updatedChats = chats.filter((chat) => chat.id !== chatId);
    setChats(updatedChats);
    if (selectedChatId === chatId) {
      setSelectedChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
    }
  };

  const handleRefreshChats = () => {
    setChats(DEFAULT_CHATS);
    setSelectedChatId(DEFAULT_CHATS[0].id);
    localStorage.setItem('hostChats', JSON.stringify(DEFAULT_CHATS));
  };

  const handleClearStorage = () => {
    if (window.confirm('Are you sure you want to clear all chats?')) {
      setChats(DEFAULT_CHATS);
      setSelectedChatId(DEFAULT_CHATS[0].id);
      localStorage.setItem('hostChats', JSON.stringify(DEFAULT_CHATS));
    }
  };

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="inbox-container loading">
        <div className="loader">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="inbox-container">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <div className={`chats-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="chats-header">
          <h2> Chats </h2>
          <button
            className="clear-btn"
            onClick={handleRefreshChats}
            title="Refresh chats"
          >
            ⟲
          </button>
        </div>

        <div className="chats-list">
          {chats.length === 0 ? (
            <div className="no-chats">
              <p>No chats yet</p>
              <button onClick={handleRefreshChats} className="reset-btn">
                Load Default Chats
              </button>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${selectedChatId === chat.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedChatId(chat.id);
                  setSidebarOpen(false);
                }}
              >
                <div className="avatar-container">
                  <img
                    src={chat.customerImage}
                    alt={chat.customerName}
                    className="customer-avatar"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/50?text=${chat.customerName.charAt(0)}`;
                    }}
                  />
                  <span className="online-indicator"></span>
                </div>
                <div className="chat-content">
                  <div className="chat-header-row">
                    <h3 className="customer-name">{chat.customerName}</h3>
                    <span className="message-time">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  </div>
                  <p className="last-message">
                    {chat.lastMessage.length > 35
                      ? `${chat.lastMessage.substring(0, 35)}...`
                      : chat.lastMessage}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <span className="unread-badge">{chat.unreadCount}</span>
                )}
                <button
                  className="delete-chat-btn"
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  title="Delete chat"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="chat-window">
        {selectedChat ? (
          <>
    
            <div className="chat-window-header">
              <img
                src={selectedChat.customerImage}
                alt={selectedChat.customerName}
                className="header-avatar"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/50?text=${selectedChat.customerName.charAt(0)}`;
                }}
              />
              <div className="header-info">
                <h2 className="header-name">{selectedChat.customerName}</h2>
                <p className="header-status">🟢 Online</p>
              </div>
            </div>

          
            <div className="messages-area">
              {selectedChat.messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                selectedChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender === 'host' ? 'host' : 'customer'}`}
                  >
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                      <span className="message-timestamp">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

          
            <div className="message-input-area">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                className="message-input"
              />
              <button
                onClick={handleSendMessage}
                className="send-button"
                disabled={newMessage.trim() === ''}
              >
                Send ➤
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inbox;