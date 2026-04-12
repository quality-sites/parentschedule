"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function ChatApp({ 
  scheduleId, 
  currentUserId 
}: { 
  scheduleId: string, 
  currentUserId: string 
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Simple auto-poll every 5 seconds
    return () => clearInterval(interval);
  }, [scheduleId]);

  useEffect(() => {
    // Scroll to bottom when messages load
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat?scheduleId=${scheduleId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    const content = input;
    setInput("");

    // Optimistic UI update could go here
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId, content }),
      });

      if (res.ok) {
        // Just fetch latest
        await fetchMessages();
      } else {
        alert("Failed to send message");
        setInput(content); // restore input
      }
    } catch (err) {
      alert("Network error sending message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
     return <div className="p-12 text-center text-gray-500">Loading chat history...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 flex flex-col h-[70vh]">
      
      {/* LEGAL WARNING BANNER */}
      <div className="bg-red-50 border-b border-red-100 p-4 shrink-0">
        <div className="flex">
          <div className="shrink-0 flex items-center pr-3 text-red-400">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
             </svg>
          </div>
          <div className="flex-1 md:flex md:justify-between">
            <p className="text-sm text-red-700">
               <strong>Legal Advisory:</strong> For your protection, all chat messages are permanently recorded. It is physically impossible to edit or delete a message. If a mistake is typed, you must send a separate correction. Messages are 100% transparent and submissible as evidence.
            </p>
          </div>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50" style={{ backgroundImage: 'radial-gradient(circle at center, #f3f4f6 0%, #ffffff 100%)' }}>
        {messages.length === 0 ? (
           <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              <p>No messages yet. Start the conversation securely.</p>
           </div>
        ) : (
           <div className="space-y-6">
             {messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                const dateString = new Date(msg.createdAt).toLocaleString([], {
                   month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-3 ${
                        isMe 
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-200 shadow-md' 
                          : 'bg-white text-gray-900 rounded-bl-none shadow-sm border border-gray-100'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                           {isMe ? 'You' : (msg.sender?.name || msg.sender?.email?.split('@')[0])}
                        </span>
                        <span className={`text-[10px] ${isMe ? 'text-indigo-300' : 'text-gray-400'}`}>
                           {dateString}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                );
             })}
             <div ref={bottomRef} />
           </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="bg-white border-t border-gray-200 p-4 shrink-0">
        <form onSubmit={sendMessage} className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your secure message here..."
            className="flex-1 rounded-full border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-6 py-3 text-sm"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300 transition-colors flex items-center justify-center min-w-[100px]"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
