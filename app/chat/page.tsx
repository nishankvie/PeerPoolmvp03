'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

type Conversation = {
  id: string;
  name: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: Date;
  unread_count: number;
};

// Mock data - in real app, this would come from Supabase
const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Alex Chen',
    avatar_url: null,
    last_message: 'Sounds good! See you tomorrow',
    last_message_time: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    unread_count: 2,
  },
  {
    id: '2',
    name: 'Jordan Smith',
    avatar_url: null,
    last_message: 'What time works for you?',
    last_message_time: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    unread_count: 0,
  },
  {
    id: '3',
    name: 'Coffee Run ☕',
    avatar_url: null,
    last_message: 'Sam: I\'m in!',
    last_message_time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    unread_count: 5,
  },
  {
    id: '4',
    name: 'Taylor Wong',
    avatar_url: null,
    last_message: 'Thanks for organizing!',
    last_message_time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    unread_count: 0,
  },
];

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setConversations(mockConversations);
      setLoading(false);
    }, 500);
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="pb-24">
        <div className="sticky top-0 bg-bg-primary z-10 px-4 py-4 border-b border-border">
          <h1 className="text-2xl font-semibold text-text-primary">Chat</h1>
        </div>
        <div className="animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="px-4 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-bg-card rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-bg-card rounded w-32 mb-2"></div>
                  <div className="h-3 bg-bg-card rounded w-48"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-bg-card min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-bg-card z-10 px-4 py-4 border-b border-border">
        <h1 className="text-2xl font-semibold text-text-primary">Chat</h1>
      </div>

      {/* Conversation List */}
      {conversations.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-text-tertiary mb-2">No conversations yet</p>
          <p className="text-sm text-text-tertiary">
            Start a hangout to chat with friends
          </p>
        </div>
      ) : (
        <div>
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className="w-full px-4 py-4 border-b border-border flex items-center gap-3 hover:bg-bg-primary transition-colors text-left"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-bg-primary flex items-center justify-center text-lg">
                  {conversation.avatar_url ? (
                    <img 
                      src={conversation.avatar_url} 
                      alt="" 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <span className="text-text-tertiary">
                      {conversation.name[0].toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm truncate ${conversation.unread_count > 0 ? 'font-semibold text-text-primary' : 'font-medium text-text-primary'}`}>
                    {conversation.name}
                  </h3>
                  <span className="text-xs text-text-tertiary flex-shrink-0 ml-2">
                    {formatTime(conversation.last_message_time)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${conversation.unread_count > 0 ? 'text-text-primary' : 'text-text-tertiary'}`}>
                    {conversation.last_message}
                  </p>
                  
                  {/* Unread Badge */}
                  {conversation.unread_count > 0 && (
                    <span className="ml-2 flex-shrink-0 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-xs text-white font-semibold">
                      {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Notification Placeholder */}
      {conversations.length > 0 && (
        <div className="mx-4 mt-6 p-4 bg-accent/5 rounded-md border border-accent/20">
          <p className="text-sm text-accent font-medium">
            💡 Alex is free tomorrow — want to hang out?
          </p>
        </div>
      )}
    </div>
  );
}
