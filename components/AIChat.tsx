import React, { useMemo, useState } from 'react';
import { generateChatResponse } from '../services/geminiService';
import { Message } from '../types';
import { Bot, CornerDownLeft, Lightbulb, Sparkles, Target } from 'lucide-react';

const starterPrompts = [
  'Generate 5 business ideas for sustainable packaging.',
  'Turn my hobby into a subscription business.',
  'Find a B2B SaaS idea for supply chain teams.',
  'Validate a fintech idea with risks and assumptions.',
];

const quickActions = [
  { label: 'Idea Sprint', prompt: 'Run a 10-minute idea sprint with 3 categories and 3 ideas each.' },
  { label: 'Customer Persona', prompt: 'Draft a primary customer persona with pains, gains, and triggers.' },
  { label: 'Go-to-Market', prompt: 'Outline a go-to-market plan for the strongest idea.' },
  { label: 'Competition Scan', prompt: 'List likely competitors and differentiation angles.' },
];

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Welcome to AI Command. Tell me the space, constraints, and goals, and I will craft business ideas, validate them, and plan next steps.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [signals, setSignals] = useState<string[]>([]);

  const summary = useMemo(() => {
    if (signals.length === 0) {
      return 'No goals captured yet. Add constraints to build a sharper brief.';
    }
    return signals.join(' · ');
  }, [signals]);

  const pushSignal = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSignals((prev) => {
      const next = [trimmed, ...prev];
      return next.slice(0, 3);
    });
  };

  const handleSend = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    pushSignal(trimmed.split('.').shift() || trimmed);

    try {
      const response = await generateChatResponse(nextMessages);
      const modelMessage: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: response,
      };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          text: 'The AI command link is offline. Please try again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-800">AI Command</h2>
            <p className="text-stone-500 text-sm">
              A business idea cockpit with prompt packs, memory signals, and an AI co-founder chat.
            </p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl shadow-sm flex flex-col min-h-[520px]">
          <div className="flex items-center justify-between border-b border-stone-100 p-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-400">Conversation</p>
              <p className="text-sm font-semibold text-stone-700">Strategy Chat</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Sparkles className="w-3 h-3 text-orange-500" />
              Adaptive response enabled
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.role === 'user'
                      ? 'bg-orange-600 text-white'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-stone-100 text-stone-500 rounded-2xl px-4 py-3 text-sm">
                  AI is crafting a response...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-stone-100 p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleSend(action.prompt)}
                  className="px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 transition"
                >
                  {action.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder="Ask for ideas, validation, or a plan..."
                className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={loading}
                className="px-4 py-3 rounded-xl bg-orange-600 text-white font-semibold flex items-center gap-2 hover:bg-orange-700 transition disabled:opacity-60"
              >
                <CornerDownLeft className="w-4 h-4" /> Send
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-stone-900 text-white rounded-2xl p-6 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">AI Signal Memory</p>
            <p className="text-sm text-stone-200 leading-relaxed">{summary}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-stone-400">
              <Target className="w-3 h-3 text-orange-400" />
              Captures top user constraints & goals
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-stone-800">Prompt Pack</h3>
            </div>
            <div className="space-y-3">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left px-4 py-3 rounded-xl border border-stone-100 bg-stone-50 text-xs text-stone-600 hover:border-orange-200 hover:bg-orange-50 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-3">Live Assist</h4>
            <p className="text-sm text-stone-600 leading-relaxed">
              The AI co-founder will challenge assumptions, propose MVPs, and surface risks automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
