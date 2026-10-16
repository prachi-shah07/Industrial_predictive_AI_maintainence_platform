import React, { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import api from '../services/api'; // direct axios instance

export default function Copilot() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Maintenance Copilot. Ask me about machine health, predictions, or maintenance schedules.' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: 'user', content: query };
    setHistory(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      // Send query in JSON body to match updated FastAPI endpoint
      const res = await api.post(`/copilot`, { query: userMessage.content });
      setHistory(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error connecting to the intelligence backend." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <header className="mb-4">
        <h1 className="text-3xl font-bold">AI Maintenance Copilot</h1>
        <p className="text-muted">Natural language interface to your factory data</p>
      </header>

      <div className="flex-1 glass-panel flex flex-col overflow-hidden">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {history.map((msg, i) => (
            <div key={i} className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-surface border border-border'}`}>
                {msg.role === 'user' ? <User size={20}/> : <Bot size={20} className="text-accent"/>}
              </div>
              <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-primary/20 text-primary-foreground rounded-tr-none' : 'bg-surface border border-border rounded-tl-none'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                <Bot size={20} className="text-accent animate-pulse"/>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-border rounded-tl-none">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-muted rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-muted rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border/50 bg-background/50">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="E.g., Which machines are at critical risk of failure right now?"
              className="w-full bg-surface border border-border rounded-xl pl-4 pr-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={!query.trim() || loading}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}