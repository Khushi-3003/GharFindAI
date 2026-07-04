'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Settings, 
  Home, 
  MapPin, 
  Shield, 
  GraduationCap, 
  Clock, 
  Compass, 
  Filter, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  X, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  User, 
  Eye, 
  EyeOff,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AgentPreferences, RankedProperty, ChatMessage, AgentStep, formatIndianCurrency } from '../lib/agentEngine';

export default function HomeDashboard() {
  // App Config
  const [useLive, setUseLive] = useState<boolean>(false);
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [apiKey, setApiKey] = useState<string>('');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  
  // App State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your AI Property-Discovery Agent (GharFind AI). I can help you search, evaluate, and shortlist homes based on real listing data, school scores, safety indexes, and your commute parameters in India.

To get started, **which city are you searching in?** (I support **Bengaluru**, **Mumbai**, **Delhi NCR**, and **Pune**). 

Feel free to also tell me about your budget (in Lakhs or Crores, e.g., "under 1.5 Cr" or "below 90 L"), BHK requirements, workplace address (to calculate your commute!), and what features (like school ratings or neighborhood safety) are most important to you!`,
      thoughts: 'Waiting for buyer connection and city selection. Defaulting preferences to neutral.'
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [preferences, setPreferences] = useState<AgentPreferences>({
    priorities: { price: 3, schools: 3, safety: 3, commute: 3, space: 3 }
  });
  const [workplaceInput, setWorkplaceInput] = useState<string>('Manyata Tech Park');
  const [shortlist, setShortlist] = useState<RankedProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<RankedProperty | null>(null);
  
  // Loading & Thinking states
  const [loading, setLoading] = useState<boolean>(false);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Set default model on provider change
  useEffect(() => {
    if (provider === 'gemini') {
      setModel('gemini-2.5-flash');
    } else {
      setModel('gpt-4o-mini');
    }
  }, [provider]);

  // Load workplace updates into preferences
  useEffect(() => {
    if (workplaceInput.trim()) {
      setPreferences(prev => ({
        ...prev,
        workplaceAddress: workplaceInput.trim()
      }));
    }
  }, [workplaceInput]);

  // Handle message send
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessageText = input.trim();
    setInput('');
    
    // Add user message
    const userMsgId = 'msg-' + Date.now();
    const newMessages = [
      ...messages,
      { id: userMsgId, role: 'user' as const, content: userMessageText }
    ];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Sync workplace address inside preferences if defined
      const payloadPreferences = {
        ...preferences,
        workplaceAddress: preferences.workplaceAddress || workplaceInput
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          preferences: payloadPreferences,
          config: {
            useLive,
            provider,
            apiKey: useLive ? apiKey : undefined,
            model
          }
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Server error occurred');
      }

      const result = await res.json();
      
      // Update states
      const responseMsgId = 'msg-reply-' + Date.now();
      setMessages(prev => [
        ...prev,
        {
          id: responseMsgId,
          role: 'assistant',
          content: result.reply,
          thoughts: result.thoughts,
          steps: result.steps,
          preferences: result.preferences,
          shortlist: result.shortlist
        }
      ]);

      if (result.preferences) {
        setPreferences(result.preferences);
        if (result.preferences.workplaceAddress) {
          setWorkplaceInput(result.preferences.workplaceAddress);
        }
      }
      
      if (result.shortlist) {
        setShortlist(result.shortlist);
        // Play success confetti if shortlist gets updated and has high scores
        if (result.shortlist.length > 0 && result.shortlist[0].score >= 85) {
          triggerConfetti();
        }
      }
      
      // Open thoughts for new response
      setExpandedThoughts(prev => ({ ...prev, [responseMsgId]: true }));

    } catch (err: any) {
      console.error(err);
      // Fallback message error
      setMessages(prev => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          role: 'assistant',
          content: `⚠️ **Error communicating with the agent:** ${err.message || 'Something went wrong.'} Make sure your settings are configured correctly.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#00f2fe', '#4facfe', '#7f00ff', '#e100ff']
    });
  };

  // Toggle single response thoughts
  const toggleThoughts = (msgId: string) => {
    setExpandedThoughts(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  // Reset conversation
  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I am your AI Property-Discovery Agent (GharFind AI). I can help you search, evaluate, and shortlist homes based on real listing data, school scores, safety indexes, and your commute parameters in India.

To get started, **which city are you searching in?** (I support **Bengaluru**, **Mumbai**, **Delhi NCR**, and **Pune**). 

Feel free to also tell me about your budget (in Lakhs or Crores, e.g., "under 1.5 Cr" or "below 90 L"), BHK requirements, workplace address (to calculate your commute!), and what features (like school ratings or neighborhood safety) are most important to you!`,
        thoughts: 'Resetting agent workspace to baseline preferences.'
      }
    ]);
    setPreferences({
      priorities: { price: 3, schools: 3, safety: 3, commute: 3, space: 3 }
    });
    setShortlist([]);
    setSelectedProperty(null);
  };

  // Helper format price (Adapted to Indian Notation)
  const formatPrice = (price: number) => {
    return formatIndianCurrency(price);
  };

  // Check if a preference is active
  const hasPref = (val: any) => val !== undefined && val !== null && val !== '';

  return (
    <div className="dashboard-container" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      
      {/* 1. SIDEBAR SETTINGS PANEL */}
      <aside className="glass-panel" style={{ 
        margin: '12px', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '20px', 
        gap: '20px',
        overflowY: 'auto'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Building style={{ color: '#00f2fe' }} size={24} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.5px' }} className="gradient-text">GharFind AI</h2>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Autonomous Indian Property Agent</p>
        </div>

        <hr style={{ border: 'none', height: '1.5px', background: 'var(--border-color)' }} />

        {/* Mode Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Agent Execution Mode</label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            background: 'rgba(0,0,0,0.3)', 
            padding: '4px', 
            borderRadius: '10px',
            border: '1px solid var(--border-color)'
          }}>
            <button 
              onClick={() => setUseLive(false)}
              className={!useLive ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px', fontSize: '0.8rem', border: 'none', borderRadius: '6px' }}
            >
              Mock Engine
            </button>
            <button 
              onClick={() => setUseLive(true)}
              className={useLive ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px', fontSize: '0.8rem', border: 'none', borderRadius: '6px' }}
            >
              Live LLM
            </button>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.25' }}>
            {!useLive 
              ? 'Local heuristic agent. Extremely fast, zero configuration required.' 
              : 'Genuinely autonomous agent. Invokes APIs with function calling. Requires LLM Key.'}
          </p>
        </div>

        {/* Live LLM Settings */}
        {useLive && (
          <div className="glass-panel" style={{ 
            padding: '12px', 
            borderRadius: '12px', 
            background: 'rgba(255,255,255,0.01)',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>API Provider</label>
              <select 
                value={provider} 
                onChange={(e) => setProvider(e.target.value as 'gemini' | 'openai')}
                style={{ 
                  background: '#0a0b10', 
                  color: 'white', 
                  border: '1px solid var(--border-color)', 
                  padding: '8px', 
                  borderRadius: '6px',
                  fontSize: '0.8rem'
                }}
              >
                <option value="gemini">Gemini API</option>
                <option value="openai">OpenAI API</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>LLM Model</label>
              <input 
                type="text" 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                style={{ 
                  background: '#0a0b10', 
                  color: 'white', 
                  border: '1px solid var(--border-color)', 
                  padding: '8px', 
                  borderRadius: '6px',
                  fontSize: '0.8rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>API Key</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showKey ? 'text' : 'password'} 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
                  style={{ 
                    background: '#0a0b10', 
                    color: 'white', 
                    border: '1px solid var(--border-color)', 
                    padding: '8px 32px 8px 8px', 
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    width: '100%'
                  }}
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  style={{ 
                    position: 'absolute', 
                    right: '8px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        )}

        <hr style={{ border: 'none', height: '1.5px', background: 'var(--border-color)' }} />

        {/* Global Commute Workplace Override */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} style={{ color: 'var(--accent-blue)' }} />
            Workplace Destination
          </label>
          <input 
            type="text" 
            value={workplaceInput} 
            onChange={(e) => setWorkplaceInput(e.target.value)}
            placeholder="e.g. Manyata Tech Park"
            style={{ 
              background: 'rgba(0,0,0,0.3)', 
              color: 'white', 
              border: '1px solid var(--border-color)', 
              padding: '10px', 
              borderRadius: '8px',
              fontSize: '0.85rem'
            }}
          />
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Used to calculate driving, walking, or transit commute durations for candidate properties.
          </p>
        </div>

        {/* Priorities Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={16} style={{ color: 'var(--accent-purple)' }} />
            Preferences Priorities Weights
          </label>
          
          {preferences.priorities && Object.keys(preferences.priorities).map((key) => {
            const val = (preferences.priorities as any)[key] || 3;
            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{key}</span>
                  <span style={{ color: 'var(--accent-cyan)' }}>{val}x</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={val}
                  onChange={(e) => {
                    const nextVal = parseInt(e.target.value);
                    setPreferences(prev => ({
                      ...prev,
                      priorities: {
                        ...(prev.priorities || { price: 3, schools: 3, safety: 3, commute: 3, space: 3 }),
                        [key]: nextVal
                      }
                    }));
                  }}
                  className="slider-custom"
                />
              </div>
            );
          })}
        </div>

        <button 
          onClick={handleReset}
          className="btn-secondary"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            fontSize: '0.85rem',
            padding: '10px'
          }}
        >
          <RefreshCw size={16} />
          Reset Workspace
        </button>
      </aside>

      {/* 2. CHAT CONVERSATION AREA */}
      <main className="glass-panel" style={{ 
        margin: '12px 6px 12px 6px', 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden'
      }}>
        {/* Chat Header */}
        <header style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.01)'
        }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />
              Conversational Buyer Agent
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Ask to find properties, calculate commutes, or sort by preferences
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: useLive ? 'var(--accent-green)' : 'var(--accent-cyan)',
              boxShadow: useLive ? '0 0 10px var(--accent-green)' : '0 0 10px var(--accent-cyan)'
            }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {useLive ? 'Live API Connected' : 'Mock Mode Active'}
            </span>
          </div>
        </header>

        {/* Chat Feed */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            
            return (
              <div 
                key={msg.id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  animation: 'fadeIn 0.25s ease-out'
                }}
              >
                {/* User/Agent Icon Row */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '6px',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  flexDirection: isUser ? 'row-reverse' : 'row'
                }}>
                  <div style={{ 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    background: isUser ? 'rgba(79, 172, 254, 0.2)' : 'rgba(0, 242, 254, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${isUser ? 'var(--accent-blue)' : 'var(--accent-cyan)'}`
                  }}>
                    {isUser ? <User size={14} style={{ color: 'var(--accent-blue)' }} /> : <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {isUser ? 'You' : 'Agentic Assistant'}
                  </span>
                </div>

                {/* Message Bubble */}
                <div style={{ 
                  background: isUser ? 'rgba(79, 172, 254, 0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isUser ? 'rgba(79, 172, 254, 0.25)' : 'var(--border-color)'}`,
                  padding: '14px 16px',
                  borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  color: 'white'
                }}>
                  {/* Clean bullet rendering for simple agent formats */}
                  {msg.content.split('\n').map((line, i) => {
                    if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                      return <li key={i} style={{ marginLeft: '12px', listStyleType: 'circle' }}>{line.replace(/^[-*]\s+/, '')}</li>;
                    }
                    // Handle bold markdown formatting
                    const parts = line.split(/(\*\*.*?\*\*)/g);
                    return (
                      <p key={i} style={{ margin: line.trim() === '' ? '8px 0' : '0 0 4px 0' }}>
                        {parts.map((part, pi) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={pi} style={{ color: 'var(--accent-cyan)' }}>{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </p>
                    );
                  })}
                </div>

                {/* Expandable Agent Reasoning steps */}
                {!isUser && (msg.thoughts || (msg.steps && msg.steps.length > 0)) && (
                  <div style={{ marginTop: '8px', alignSelf: 'flex-start', width: '100%' }}>
                    <button 
                      onClick={() => toggleThoughts(msg.id)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--accent-cyan)', 
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 0'
                      }}
                    >
                      {expandedThoughts[msg.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {expandedThoughts[msg.id] ? 'Hide Agentic Thought Steps' : 'Show Agentic Thought Steps'}
                      {msg.steps && msg.steps.length > 0 && (
                        <span className="badge-tool" style={{ marginLeft: '6px' }}>{msg.steps.length} Tool Calls</span>
                      )}
                    </button>
                    
                    {expandedThoughts[msg.id] && (
                      <div className="glass-panel" style={{ 
                        marginTop: '6px', 
                        padding: '12px 14px', 
                        borderRadius: '8px', 
                        background: 'rgba(0,0,0,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        animation: 'fadeIn 0.15s ease-out'
                      }}>
                        {msg.thoughts && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--accent-blue)' }}>Agent Reasoning:</strong> {msg.thoughts}
                          </div>
                        )}
                        
                        {msg.steps && msg.steps.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Executed Agent Actions:</span>
                            {msg.steps.map((step, sIdx) => (
                              <div key={sIdx} style={{ 
                                padding: '8px', 
                                border: '1px solid rgba(255,255,255,0.05)', 
                                borderRadius: '6px',
                                background: 'rgba(255,255,255,0.01)',
                                fontSize: '0.75rem'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                                    🔧 Call: {step.toolName}()
                                  </span>
                                  <span style={{ color: 'var(--text-muted)' }}>Step #{sIdx+1}</span>
                                </div>
                                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                  {step.thought}
                                </div>
                                <div style={{ 
                                  fontFamily: 'monospace', 
                                  background: 'rgba(0,0,0,0.4)', 
                                  padding: '6px', 
                                  borderRadius: '4px',
                                  color: 'var(--text-secondary)',
                                  whiteSpace: 'pre-wrap',
                                  maxHeight: '120px',
                                  overflowY: 'auto'
                                }}>
                                  Input: {JSON.stringify(step.toolInput)}\nOutput: {JSON.stringify(step.toolOutput)}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loader */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'flex-start', maxWidth: '85%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  background: 'rgba(0, 242, 254, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid var(--accent-cyan)',
                  animation: 'spin 2s linear infinite'
                }}>
                  <RefreshCw size={14} style={{ color: 'var(--accent-cyan)' }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Agent is thinking...</span>
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                padding: '14px 16px',
                borderRadius: '4px 16px 16px 16px',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                animation: 'pulseGlow 2s infinite ease-in-out'
              }}>
                Querying multi-source databases, analyzing nearby school ratings, computing commute routes, and compiling ranked shortlists...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={handleSend}
          style={{ 
            padding: '16px 20px', 
            borderTop: '1px solid var(--border-color)',
            background: 'rgba(255, 255, 255, 0.01)',
            display: 'flex',
            gap: '12px'
          }}
        >
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              useLive && !apiKey 
                ? '⚠️ Please enter your API Key in the settings sidebar first...' 
                : 'Say: "I want a 3 BHK in Bengaluru under 1.5 Cr near Manyata Tech Park"'
            }
            disabled={loading || (useLive && !apiKey)}
            style={{ 
              flex: 1, 
              background: '#0a0b10', 
              color: 'white', 
              border: '1px solid var(--border-color)', 
              padding: '12px 16px', 
              borderRadius: '10px',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim() || (useLive && !apiKey)}
            className="btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              padding: '0 20px'
            }}
          >
            <Send size={16} />
            Send
          </button>
        </form>
      </main>

      {/* 3. DYNAMIC PREFERENCES & RANKED SHORTLIST PANEL */}
      <section className="glass-panel" style={{ 
        margin: '12px', 
        display: 'flex', 
        flexDirection: 'column', 
        padding: '20px', 
        gap: '20px',
        overflowY: 'auto'
      }}>
        
        {/* Active Preferences Panel */}
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} style={{ color: 'var(--accent-blue)' }} />
            Extracted Search Preferences
          </h3>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px', 
            background: 'rgba(0,0,0,0.2)', 
            padding: '12px', 
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            minHeight: '60px'
          }}>
            {/* If no parameters extracted */}
            {!hasPref(preferences.city) && !hasPref(preferences.maxPrice) && !hasPref(preferences.minBeds) && !hasPref(preferences.minBaths) && !hasPref(preferences.workplaceAddress) && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                No search preferences extracted yet. Tell the agent what you are looking for in the chat.
              </span>
            )}
            
            {hasPref(preferences.city) && (
              <span className="badge-tool" style={{ background: 'rgba(0, 242, 254, 0.15)', borderColor: 'var(--accent-cyan)' }}>
                📍 City: {preferences.city}
              </span>
            )}
            {hasPref(preferences.maxPrice) && (
              <span className="badge-tool" style={{ background: 'rgba(0, 245, 160, 0.15)', borderColor: 'var(--accent-green)' }}>
                💰 Max Price: {formatPrice(preferences.maxPrice!)}
              </span>
            )}
            {(hasPref(preferences.minBeds) || hasPref(preferences.minBaths)) && (
              <span className="badge-tool" style={{ background: 'rgba(127, 0, 255, 0.15)', borderColor: 'var(--accent-purple)' }}>
                🛏️ Rooms: {preferences.minBeds || 0} BHK / {preferences.minBaths || 0} Ba
              </span>
            )}
            {hasPref(preferences.workplaceAddress) && (
              <span className="badge-tool" style={{ background: 'rgba(79, 172, 254, 0.15)', borderColor: 'var(--accent-blue)' }}>
                🏢 Work: {preferences.workplaceAddress} ({preferences.commuteMode || 'drive'})
              </span>
            )}
            {hasPref(preferences.minSchoolRating) && (
              <span className="badge-tool" style={{ background: 'rgba(225, 0, 255, 0.15)', borderColor: 'var(--accent-pink)' }}>
                🎓 Schools: {preferences.minSchoolRating}+/10
              </span>
            )}
            {hasPref(preferences.minSafetyScore) && (
              <span className="badge-tool" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                🛡️ Safety: {preferences.minSafetyScore}+/100
              </span>
            )}
          </div>
        </div>

        <hr style={{ border: 'none', height: '1.5px', background: 'var(--border-color)' }} />

        {/* Shortlist listings */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} style={{ color: 'var(--accent-green)' }} />
              Ranked Property Shortlist
            </h3>
            {shortlist.length > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {shortlist.length} Matches Found
              </span>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 280px)',
            padding: '2px'
          }}>
            {shortlist.length === 0 ? (
              <div style={{ 
                border: '1px dashed var(--border-color)', 
                borderRadius: '12px', 
                padding: '40px 20px', 
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Home size={32} style={{ opacity: 0.3 }} />
                <span>Shortlist will populate once city & housing preferences are shared in the chat.</span>
              </div>
            ) : (
              shortlist.map((rp) => {
                const schoolAvg = ((rp.property.schools.elementary.rating + rp.property.schools.middle.rating + rp.property.schools.high.rating) / 3).toFixed(1);
                
                return (
                  <div 
                    key={rp.property.id}
                    onClick={() => setSelectedProperty(rp)}
                    className="interactive-card"
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px',
                      position: 'relative',
                      overflow: 'hidden',
                      animation: 'slideInRight 0.25s ease-out'
                    }}
                  >
                    {/* Glowing highlight border on top-ranked match */}
                    {rp.ranking === 1 && (
                      <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '4px', 
                        height: '100%', 
                        background: 'linear-gradient(to bottom, var(--accent-cyan), var(--accent-blue))' 
                      }} />
                    )}
                    
                    {/* Title and score bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rp.property.title}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {rp.property.neighborhood}, {rp.property.city}
                        </span>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          color: rp.score >= 85 ? 'var(--accent-green)' : rp.score >= 70 ? 'var(--accent-blue)' : 'var(--text-secondary)',
                          background: 'rgba(255,255,255,0.03)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          {rp.score}% Match
                        </span>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Rank #{rp.ranking}
                        </div>
                      </div>
                    </div>

                    {/* Image & Price row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', marginTop: '4px' }}>
                      <img 
                        src={rp.property.imageUrl} 
                        alt={rp.property.title}
                        style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                          {formatPrice(rp.property.price)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {rp.property.beds} BHK • {rp.property.baths} Bath • {rp.property.sqft.toLocaleString()} sqft
                        </div>
                      </div>
                    </div>

                    {/* Mini Stats Icons */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '0.7rem', 
                      color: 'var(--text-secondary)',
                      background: 'rgba(0,0,0,0.15)',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      marginTop: '4px'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <GraduationCap size={12} style={{ color: 'var(--accent-pink)' }} />
                        Schools: {schoolAvg}/10
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Shield size={12} style={{ color: 'var(--accent-green)' }} />
                        Safety: {rp.property.safetyScore}/100
                      </span>
                      {hasPref(preferences.workplaceAddress) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} style={{ color: 'var(--accent-blue)' }} />
                          Commute: {rp.details.commuteTime}m
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 4. DETAIL MODAL OVERLAY */}
      {selectedProperty && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          background: 'rgba(0,0,0,0.85)', 
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{ 
            width: '100%', 
            maxWidth: '680px', 
            background: 'var(--bg-secondary)', 
            padding: '24px',
            position: 'relative',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProperty(null)}
              style={{ 
                position: 'absolute', 
                right: '16px', 
                top: '16px', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--border-color)', 
                color: 'white',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>

            {/* Title / Main details */}
            <div>
              <span className="badge-tool" style={{ 
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                color: 'black', 
                fontWeight: 'bold',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                border: 'none',
                display: 'inline-block',
                marginBottom: '8px'
              }}>
                Rank #{selectedProperty.ranking} • {selectedProperty.score}% Compatibility Match
              </span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedProperty.property.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <MapPin size={14} style={{ color: 'var(--accent-cyan)' }} />
                {selectedProperty.property.address}, {selectedProperty.property.city}, {selectedProperty.property.state} Pincode {selectedProperty.property.zipCode}
              </p>
            </div>

            {/* Split layout: Photo & Quick numbers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <img 
                src={selectedProperty.property.imageUrl} 
                alt={selectedProperty.property.title} 
                style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border-color)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4px 0' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LIST PRICE</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-cyan)' }}>{formatPrice(selectedProperty.property.price)}</div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ROOMS</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedProperty.property.beds} BHK / {selectedProperty.property.baths} Bath</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SPACE</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedProperty.property.sqft.toLocaleString()} sqft</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>YEAR BUILT</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedProperty.property.yearBuilt}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PROPERTY TYPE</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{selectedProperty.property.type}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>PROPERTY DESCRIPTION</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{selectedProperty.property.description}</p>
            </div>

            <hr style={{ border: 'none', height: '1px', background: 'var(--border-color)' }} />

            {/* Match Compatibility Scores breakdown */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>MATCH SCORE BREAKDOWN</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Price Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Budget Match</span>
                    <span style={{ fontWeight: 'bold' }}>{Math.round(selectedProperty.details.priceScore)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${selectedProperty.details.priceScore}%`, 
                      height: '100%', 
                      background: 'var(--accent-green)',
                      boxShadow: '0 0 8px var(--accent-green)'
                    }} />
                  </div>
                </div>

                {/* Space Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>BHK Room Fit</span>
                    <span style={{ fontWeight: 'bold' }}>{Math.round(selectedProperty.details.spaceScore)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${selectedProperty.details.spaceScore}%`, 
                      height: '100%', 
                      background: 'var(--accent-purple)',
                      boxShadow: '0 0 8px var(--accent-purple)'
                    }} />
                  </div>
                </div>

                {/* School Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>School Quality score</span>
                    <span style={{ fontWeight: 'bold' }}>{Math.round(selectedProperty.details.schoolScore)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${selectedProperty.details.schoolScore}%`, 
                      height: '100%', 
                      background: 'var(--accent-pink)',
                      boxShadow: '0 0 8px var(--accent-pink)'
                    }} />
                  </div>
                </div>

                {/* Safety Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Safety Index match</span>
                    <span style={{ fontWeight: 'bold' }}>{Math.round(selectedProperty.details.safetyScore)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${selectedProperty.details.safetyScore}%`, 
                      height: '100%', 
                      background: 'white',
                      boxShadow: '0 0 8px white'
                    }} />
                  </div>
                </div>

                {/* Commute Bar */}
                {hasPref(preferences.workplaceAddress) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Commute duration match</span>
                      <span style={{ fontWeight: 'bold' }}>{Math.round(selectedProperty.details.commuteScore)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${selectedProperty.details.commuteScore}%`, 
                        height: '100%', 
                        background: 'var(--accent-blue)',
                        boxShadow: '0 0 8px var(--accent-blue)'
                      }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Neighborhood Detailed Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              
              {/* Left Column: School details */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px' }}>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', color: 'var(--accent-pink)' }}>
                  <GraduationCap size={14} /> NEARBY SCHOOL RATINGS
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.7rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Primary: {selectedProperty.property.schools.elementary.name}</span>
                    <strong style={{ color: 'var(--accent-pink)' }}>{selectedProperty.property.schools.elementary.rating}/10</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Middle: {selectedProperty.property.schools.middle.name}</span>
                    <strong style={{ color: 'var(--accent-pink)' }}>{selectedProperty.property.schools.middle.rating}/10</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>High/Senior: {selectedProperty.property.schools.high.name}</span>
                    <strong style={{ color: 'var(--accent-pink)' }}>{selectedProperty.property.schools.high.rating}/10</strong>
                  </div>
                </div>
              </div>

              {/* Right Column: Walk/Transit Scores */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px' }}>
                <h5 style={{ fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', color: 'var(--accent-green)' }}>
                  <Compass size={14} /> NEIGHBORHOOD RATINGS
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.7rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Safety Score</span>
                    <strong>{selectedProperty.property.safetyScore} / 100</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Walkability Index</span>
                    <strong>{selectedProperty.property.walkScore} / 100</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Transit Accessibility</span>
                    <strong>{selectedProperty.property.transitScore} / 100</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Commute Info */}
            {hasPref(preferences.workplaceAddress) && (
              <div style={{ 
                background: 'rgba(79, 172, 254, 0.05)', 
                border: '1px solid rgba(79, 172, 254, 0.2)', 
                borderRadius: '12px', 
                padding: '12px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Clock size={20} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                <div>
                  <strong>Workplace Commute:</strong> Estimated commute is <strong>{selectedProperty.details.commuteTime} minutes</strong> ({selectedProperty.details.commuteDistance} km) via <strong>{preferences.commuteMode || 'driving'}</strong> to {preferences.workplaceAddress}.
                </div>
              </div>
            )}

            {/* Agent's customized justification */}
            <div style={{ 
              background: 'rgba(0, 242, 254, 0.05)', 
              border: '1px solid rgba(0, 242, 254, 0.2)', 
              borderRadius: '12px', 
              padding: '14px',
              fontSize: '0.8rem'
            }}>
              <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Sparkles size={14} /> AGENT JUSTIFICATION & FIT
              </h5>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {selectedProperty.details.explanation} This property matches your target parameters beautifully. In the local {selectedProperty.property.neighborhood} neighborhood, it holds a safety index of {selectedProperty.property.safetyScore}/100 and nearby schools have average ratings of {((selectedProperty.property.schools.elementary.rating + selectedProperty.property.schools.middle.rating + selectedProperty.property.schools.high.rating)/3).toFixed(1)}/10. {selectedProperty.details.priceScore >= 95 ? 'It is well inside your specified price target, saving you significant budget.' : 'It represents an optimal trade-off of space and price for this high-demand district.'}
              </p>
            </div>

            {/* Amenities list */}
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>KEY AMENITIES</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedProperty.property.amenities.map((amenity, idx) => (
                  <span key={idx} style={{ 
                    background: 'rgba(255,255,255,0.04)', 
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)'
                  }}>
                    ✓ {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
