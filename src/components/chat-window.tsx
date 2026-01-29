"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import LogoutButton from "./logout-button";


interface ChatHistoryItem {
  sessionId: string;
  preview: string;
  lastCreatedAt: Date;
  messageCount: number;
}

interface ChatWindowV19Props {
  email: string;
  id: number;
}

interface ChatAreaProps {
  sessionId: string;
  userId: string;
  initialMessages: UIMessage[];
  onMessageComplete: () => void;
}

// ============================================================================
// CHAT AREA COMPONENT - ใช้ useChat hook
// แยกออกมาเพื่อใช้ key prop force re-mount เมื่อเปลี่ยน session
// ============================================================================

function ChatArea({ sessionId, userId, initialMessages, onMessageComplete }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
  } = useChat({
    id: sessionId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/chatv3',
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages,
          userId,
          sessionId,
        },
      }),
    }),
    onFinish: () => {
      onMessageComplete();
    },
    onError: (err) => {
      console.error('[ChatV19] Error:', err);
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  // Extract text content from message parts
  const getMessageContent = (message: typeof messages[0]): string => {
    if (!message.parts) return '';
    return message.parts
      .filter(part => part.type === 'text')
      .map(part => (part as { type: 'text'; text: string }).text)
      .join('');
  };

  return (
    <div className="flex-1 flex flex-col p-2 sm:p-4 bg-background">
      <h2 className="text-base sm:text-xl font-semibold mb-2 sm:mb-4 truncate">
        <span className="hidden sm:inline">Messages (Session: {sessionId})</span>
        <span className="sm:hidden">Chat</span>
      </h2>

      {error && (
        <div className="p-2 sm:p-4 bg-destructive/10 text-destructive rounded mb-2 sm:mb-4 text-xs sm:text-sm">
          {error.message || 'เกิดข้อผิดพลาดในการส่งข้อความ'}
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto border border-border rounded p-2 sm:p-4 mb-2 sm:mb-4 space-y-2 sm:space-y-4 bg-card">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-center py-4 sm:py-8 text-xs sm:text-sm">
            No messages yet. Start a conversation!
          </p>
        )}

        {messages.map((message) => {
          const content = getMessageContent(message);
          return (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-2 sm:p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-muted rounded-br-none'
                    : 'rounded-bl-none'
                }`}
              >
                <div className="font-semibold mb-1 text-[10px] sm:text-xs">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <div className="whitespace-pre-wrap text-xs sm:text-sm">
                  {content || (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <span className="animate-pulse">.</span>
                      <span className="animate-pulse delay-100">.</span>
                      <span className="animate-pulse delay-200">.</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Status indicator */}
      {status === 'streaming' && (
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
          <span className="animate-pulse">.</span>
          <span>AI is typing...</span>
          <button onClick={() => stop()} className="text-destructive hover:underline">
            Stop
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-input rounded bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ChatWindowV19({ email, id }: ChatWindowV19Props) {
  const [chatHistories, setChatHistories] = useState<ChatHistoryItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);

  // ============================================================================
  // Initialize on client only (avoid hydration mismatch)
  // ============================================================================
  useEffect(() => {
    setIsClient(true);
    if (!currentSessionId) {
      const newSessionId = crypto.randomUUID?.() || `${Date.now()}`;
      setCurrentSessionId(newSessionId);
    }
  }, [currentSessionId]);

  // ============================================================================
  // FETCH CHAT HISTORIES
  // ============================================================================
  const fetchChatHistories = useCallback(async () => {
    try {
      const res = await fetch('/api/chat-history');
      if (res.ok) {
        const data = await res.json();
        setChatHistories(data);
      }
    } catch (error) {
      console.error('Failed to fetch chat histories:', error);
    }
  }, []);

  useEffect(() => {
    fetchChatHistories();
  }, [fetchChatHistories]);

  // ============================================================================
  // DELETE HISTORY
  // ============================================================================
  const deleteChatHistory = async (sessionId: string) => {
    if (!confirm('Delete this chat history?')) return;

    try {
      const res = await fetch('/api/chat-history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (res.ok) {
        fetchChatHistories();
        if (sessionId === currentSessionId) {
          createNewSession();
        }
      }
    } catch (error) {
      console.error('Failed to delete chat history:', error);
    }
  };

  // ============================================================================
  // NEW SESSION
  // ============================================================================
  const createNewSession = useCallback(() => {
    const newSessionId = crypto.randomUUID?.() || `${Date.now()}`;
    setInitialMessages([]);
    setCurrentSessionId(newSessionId);
  }, []);

  // ============================================================================
  // LOAD SESSION
  // ============================================================================
  const loadSession = useCallback(async (sessionId: string) => {
    if (sessionId === currentSessionId) return;

    try {
      setLoadingSession(true);
      const res = await fetch(`/api/chat-history/${sessionId}`);

      if (res.ok) {
        const historyMessages = await res.json();

        const formattedMessages: UIMessage[] = historyMessages.map((msg: {
          id: string;
          role: string;
          content: string;
          createdAt?: string;
          created_at?: string
        }) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          parts: [{ type: 'text' as const, text: msg.content }],
          createdAt: new Date(msg.createdAt || msg.created_at || Date.now()),
        }));

        setInitialMessages(formattedMessages);
        setCurrentSessionId(sessionId);
      }
    } catch (error) {
      console.error('[ChatV19] Failed to load session:', error);
    } finally {
      setLoadingSession(false);
    }
  }, [currentSessionId]);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="container mx-auto max-w-7xl h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] flex flex-col rounded-lg border border-border shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 p-3 sm:p-4 border-b-2 border-border bg-card">
          <div className="w-full sm:w-auto">
            <h1 className="text-lg sm:text-2xl font-bold m-0">AI Chat Bot</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {email}
              <span className="hidden sm:inline"> (ID: {id})</span>
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar: Chat History */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-3 md:p-4 overflow-y-auto bg-card max-h-48 md:max-h-full">
            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Chat History</h2>

            <button
              onClick={createNewSession}
              className="w-full px-3 md:px-4 py-2 text-sm md:text-base bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity mb-3 md:mb-4"
            >
              + New Chat
            </button>

            <hr className="my-2 md:my-4 border-border" />

            <ul className="space-y-1 md:space-y-2">
              {chatHistories.slice(0, 10).map((history) => (
                <li key={history.sessionId} className="group relative">
                  <div
                    onClick={() => loadSession(history.sessionId)}
                    className={`p-2 md:p-3 rounded cursor-pointer transition-colors relative ${
                      isClient && currentSessionId === history.sessionId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    <div className="font-medium text-xs md:text-sm truncate pr-6">
                      {history.preview || 'New chat'}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {history.messageCount} msgs
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChatHistory(history.sessionId);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                      title="Delete chat"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-destructive"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Main: Chat Area */}
          {!isClient || !currentSessionId || loadingSession ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-muted-foreground">
                {loadingSession ? 'Loading session...' : 'Initializing...'}
                {loadingSession ? 'Loading session...' : 'Initializing...'}
              </span>
            </div>
          ) : (
            <ChatArea
              key={currentSessionId}
              sessionId={currentSessionId}
              userId={id.toString()}
              initialMessages={initialMessages}
              onMessageComplete={() => {
                setTimeout(() => fetchChatHistories(), 1000);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
