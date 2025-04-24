import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  FaSmile,
  FaSearch,
  FaPlus,
  FaUserPlus,
  FaUserMinus,
  FaFlag
} from 'react-icons/fa';
import './ChatsPage.css';

// Mock data for chats and messages
let mockChats = [
  { id: 1, title: 'General Discussion', avatar: 'https://i.pravatar.cc/40?img=1', lastMessage: 'Hey, how are you?', unread: 2, isFriend: true },
  { id: 2, title: 'Strategy Tips',     avatar: 'https://i.pravatar.cc/40?img=2', lastMessage: 'Try the Sicilian.', unread: 0, isFriend: false },
  { id: 3, title: 'Off-topic',         avatar: 'https://i.pravatar.cc/40?img=3', lastMessage: 'Nice meme!', unread: 5, isFriend: false },
];

const mockMessages = {
  1: [
    { id: 1, sender: 'Alice', text: 'Hey, how are you?', time: '10:00', date: '2025-04-25' },
    { id: 2, sender: 'You',   text: "I'm fine!",        time: '10:02', date: '2025-04-25' },
  ],
  2: [ { id: 1, sender: 'Bob',     text: 'Try the Sicilian!', time: '09:15', date: '2025-04-24' } ],
  3: [ { id: 1, sender: 'Charlie', text: 'Haha 😂',           time: '08:30', date: '2025-04-23' } ],
};

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(mockChats[0].id);
  const [messages, setMessages] = useState(() => mockMessages[mockChats[0].id] || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    setMessages(mockMessages[selectedChat] || []);
  }, [selectedChat]);

  // Auto-resize textarea on content change
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [textInput]);

  const handleSend = () => {
    const text = textInput.trim();
    if (!text) return;
    const now = new Date();
    const newMsg = {
      id: Date.now(), sender: 'You', text,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString()
    };
    setMessages(prev => [...prev, newMsg]);
    mockMessages[selectedChat]?.push(newMsg);
    setTextInput('');
    setEmojiPickerOpen(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const toggleFriend = () => {
    mockChats = mockChats.map(c => c.id === selectedChat ? { ...c, isFriend: !c.isFriend } : c);
    setMessages([...messages]);
  };

  const handleNewChat = () => {
    const name = prompt('Enter username to start chat:');
    if (name) {
      const id = Date.now();
      mockChats.push({ id, title: name, avatar: '', lastMessage: '', unread: 0, isFriend: false });
      mockMessages[id] = [];
      setSelectedChat(id);
    }
  };

  const handleReport = () => alert('Report sent for ' + mockChats.find(c => c.id === selectedChat)?.title);

  const filteredChats = mockChats.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const grouped = messages.reduce((acc, msg) => {
    acc[msg.date] = acc[msg.date] || [];
    acc[msg.date].push(msg);
    return acc;
  }, {});
  const emojis = ['😊','😂','😍','👍','🎉','😢','🤔'];

  return (
    <div className="chat-page-container">
      <Sidebar />
      <div className="chat-content">
        <aside className="chat-list">
          {/* search and new-chat button */}
          <div className="chat-search">
            <FaSearch className="icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button onClick={handleNewChat}><FaPlus title="New Chat" /></button>
          </div>
          {/* chat items */}
          <div className="chat-items">
            {filteredChats.map(chat => (
              <div
                key={chat.id}
                className={`chat-item ${chat.id === selectedChat ? 'active' : ''}`}
                onClick={() => setSelectedChat(chat.id)}
              >
                <img
                  src={chat.avatar || `https://i.pravatar.cc/40?u=${chat.id}`}
                  alt="avatar"
                  className="avatar"
                />
                <div className="info">
                  <h4>{chat.title}</h4>
                  <p>{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && <span className="badge">{chat.unread}</span>}
              </div>
            ))}
          </div>
        </aside>
        <section className="chat-window">
          {/* header with title, friend and report icons */}
          <header className="window-header">
            <div className="left">
              <h3>{mockChats.find(c => c.id === selectedChat)?.title}</h3>
              <button
                className="icon-btn"
                onClick={toggleFriend}
                title={mockChats.find(c => c.id === selectedChat)?.isFriend ? 'Remove Friend' : 'Add Friend'}
              >
                {mockChats.find(c => c.id === selectedChat)?.isFriend ? <FaUserMinus /> : <FaUserPlus />}
              </button>
              <button className="icon-btn" onClick={handleReport} title="Report user">
                <FaFlag />
              </button>
            </div>
          </header>
          {/* messages grouped by date, own messages right, others left */}
          <div className="messages">
            {Object.entries(grouped).map(([date, msgs]) => (
              <div key={date} className="date-group">
                <div className="date-label">{date}</div>
                {msgs.map(msg => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender === 'You' ? 'out' : 'in'}`}
                  >
                    <span className="text">{msg.text}</span>
                    <span className="time">{msg.time}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* input area: emoji, textarea, send */}
          <div className="input-area">
            <button
              className="emoji-btn"
              onClick={() => setEmojiPickerOpen(o => !o)}
              title="Emoji"
            >
              <FaSmile />
            </button>
            {emojiPickerOpen && (
              <div className="emoji-popover">
                {emojis.map(e => (
                  <span key={e} onClick={() => setTextInput(prev => prev + e)}>{e}</span>
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              placeholder="Type a message..."
              rows={1}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button className="send-btn" onClick={handleSend} title="Send"><FaPlus /></button>
          </div>
        </section>
      </div>
    </div>
  );
}
