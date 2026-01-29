"use client"

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import LogoutButton from './logout-button';

export function ChatWindowV2({ email, id }: { email: string, id: number }) {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chatv2',
    }),
  });
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === 'ready') {
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 font-sans">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 italic">Poom Chat</h2>
          <p className="text-sm text-gray-500">{email} (ID: {id})</p>
        </div>
        <LogoutButton />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 px-2">
        {messages.length === 0 && (
          <div className="text-center mt-20 text-gray-400">
            <h1 className="text-4xl font-medium mb-2">สวัสดีครับ</h1>
            <p>มีอะไรให้ผมช่วยในวันนี้ไหม?</p>
          </div>
        )}
        {messages.map(message => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              message.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              {message.parts.map((part, index) =>
                part.type === 'text' ? <p key={index} className="leading-relaxed">{part.text}</p> : null
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Section (Gemini Style) */}
      <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto w-full">
        <div className="relative flex items-center bg-[#f0f4f9] rounded-full px-6 py-3 shadow-sm hover:shadow-md transition-shadow">
          <input
            className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-500 py-2"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={status !== 'ready'}
            placeholder="พิมพ์คำถามของคุณที่นี่..."
          />
          
          <button 
            type="submit" 
            disabled={status !== 'ready' || !input.trim()}
            className={`ml-2 p-2 rounded-full transition-all ${
              input.trim() ? 'text-blue-600 hover:bg-blue-100' : 'text-gray-400'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-center mt-2 text-gray-400">
          chatbot อาจแสดงข้อมูลที่ไม่ถูกต้อง รวมถึงข้อมูลเกี่ยวกับบุคคล ดังนั้นโปรดตรวจสอบความถูกต้องของคำตอบ
        </p>
      </form>
    </div>
  );
}