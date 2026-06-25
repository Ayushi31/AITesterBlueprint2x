import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Settings, Send, Loader2, Bot, History, Plus, X, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './App.css';

interface AppConfig {
  provider: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

function App() {
  const [config, setConfig] = useState<AppConfig>({
    provider: 'ollama',
    baseUrl: 'http://localhost:11434',
    apiKey: '',
    model: 'llama2',
    temperature: 0.7
  });

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize first session
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, []);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];
  const messages = currentSession?.messages || [];

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `TestCase-${sessions.length + 1}`,
      messages: [{ role: 'assistant', content: 'Hi! Paste your Jira requirements below, and I will generate your test cases in a **Jira structured Table format**.' }]
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
  };

  const updateCurrentSession = (newMessages: Message[], titleMatch?: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: newMessages, title: titleMatch ? titleMatch : s.title };
      }
      return s;
    }));
  };

  const generateSummaryTitle = (text: string) => {
    let cleanText = text.replace(/^(please )?(create|generate|write|make|give me)( )?(a )?(test|tests|test case|test cases)?( )?(for|about|on|of)? /i, '').trim();
    if (!cleanText) cleanText = text;
    const words = cleanText.split(/\s+/);
    return words.slice(0, 4).join(' ') + (words.length > 4 ? '...' : '');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userReq = input;
    const newMsgs = [...messages, { role: 'user', content: userReq } as Message];

    const titleMatch = messages.length === 1 ? generateSummaryTitle(userReq) : undefined;
    updateCurrentSession(newMsgs, titleMatch);

    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/generate', {
        requirements: userReq,
        ...config
      });

      updateCurrentSession([...newMsgs, { role: 'assistant', content: response.data.testCases }]);
    } catch (error: any) {
      updateCurrentSession([...newMsgs, { role: 'assistant', content: `Error: ${error.response?.data?.error || error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    alert("Testing connection to " + config.provider + " at " + config.baseUrl);
    // basic mock test connection
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-left">
          <Bot className="app-icon" size={28} />
          <h1>TestGenBuddy</h1>
        </div>
        <button className="settings-btn" onClick={() => setShowSettings(true)}>
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </header>

      <div className="main-wireframe-container">

        {/* Sidebar History */}
        <aside className="wireframe-sidebar">
          <div className="sidebar-header">
            <h3><History size={16} /> History</h3>
            <button className="new-chat-btn" title="New Session" onClick={createNewSession}>
              <Plus size={18} />
            </button>
          </div>
          <div className="history-list">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`history-item ${session.id === currentSessionId ? 'active' : ''}`}
                onClick={() => setCurrentSessionId(session.id)}
              >
                {session.title}
              </div>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="wireframe-main-content">
          <div className="wireframe-output-box">
            <div className="output-header">
              <span>Test Case generated with {config.provider.toUpperCase()} API</span>
              {lastAssistantMessage && lastAssistantMessage.content.includes('|') && !loading && (
                <button
                  className="download-btn"
                  onClick={() => {
                    // Extract table data and convert to CSV
                    const text = lastAssistantMessage.content;
                    const tableRegex = /\|(.+)\|\n\|[-|\s]+\|\n((?:\|.*\|\n?)+)/;
                    const match = text.match(tableRegex);

                    if (match) {
                      const headers = match[1].split('|').map(s => s.trim()).filter(Boolean);
                      const rows = match[2].trim().split('\n').map(r => r.split('|').map(s => s.trim()).filter(Boolean));

                      const csvContent = [
                        headers.join(','),
                        ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
                      ].join('\n');

                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      const url = URL.createObjectURL(blob);
                      link.setAttribute('href', url);
                      link.setAttribute('download', `test_cases_${new Date().getTime()}.csv`);
                      link.style.visibility = 'hidden';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    } else {
                      // Fallback to downloading raw markdown if no table structure is found
                      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `test_cases_${new Date().getTime()}.md`;
                      link.click();
                    }
                  }}
                  title="Download Table as CSV"
                >
                  <Download size={16} />
                  Download
                </button>
              )}
            </div>
            <div className="output-content">
              {loading ? (
                <div className="loading-state">
                  <Loader2 className="spinner" size={32} />
                  <p>Generating...</p>
                </div>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {lastAssistantMessage ? lastAssistantMessage.content : ''}
                </ReactMarkdown>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="wireframe-input-box">
            <textarea
              placeholder="Paste your requirement here to generate test cases"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button className="send-btn" onClick={handleSend} disabled={loading || !input.trim()}>
              <Send size={20} />
            </button>
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="wireframe-settings-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Settings</h2>
              <button className="close-btn" onClick={() => setShowSettings(false)}><X size={24} /></button>
            </div>

            <div className="wireframe-setting-section">
              <h3>Ollama Setting</h3>
              <div className="form-group setting-row">
                <label>Base URL</label>
                <input
                  type="text"
                  value={config.provider === 'ollama' ? config.baseUrl : 'http://localhost:11434'}
                  onChange={(e) => {
                    setConfig({ ...config, provider: 'ollama', baseUrl: e.target.value });
                  }}
                  disabled={config.provider !== 'ollama'}
                  className={config.provider === 'ollama' ? 'active-input' : ''}
                />
                <button
                  className={`btn-select ${config.provider === 'ollama' ? 'active' : ''}`}
                  onClick={() => setConfig({ ...config, provider: 'ollama' })}
                >Select</button>
              </div>
            </div>

            <div className="wireframe-setting-section">
              <h3>Groq Setting</h3>
              <div className="form-group setting-row">
                <label>API Key</label>
                <input
                  type="password"
                  value={config.provider === 'groq' ? config.apiKey : ''}
                  onChange={(e) => setConfig({ ...config, provider: 'groq', apiKey: e.target.value })}
                  placeholder="gsk-..."
                  disabled={config.provider !== 'groq'}
                  className={config.provider === 'groq' ? 'active-input' : ''}
                />
                <button
                  className={`btn-select ${config.provider === 'groq' ? 'active' : ''}`}
                  onClick={() => setConfig({ ...config, provider: 'groq', baseUrl: 'https://api.groq.com/openai/v1' })}
                >Select</button>
              </div>
            </div>

            <div className="wireframe-setting-section">
              <h3>Open AI API keys</h3>
              <div className="form-group setting-row">
                <label>API Key</label>
                <input
                  type="password"
                  value={config.provider === 'openai' ? config.apiKey : ''}
                  onChange={(e) => setConfig({ ...config, provider: 'openai', apiKey: e.target.value })}
                  placeholder="sk-..."
                  disabled={config.provider !== 'openai'}
                  className={config.provider === 'openai' ? 'active-input' : ''}
                />
                <button
                  className={`btn-select ${config.provider === 'openai' ? 'active' : ''}`}
                  onClick={() => setConfig({ ...config, provider: 'openai', baseUrl: 'https://api.openai.com/v1' })}
                >Select</button>
              </div>
            </div>

            <div className="wireframe-setting-section">
              <h3>Model Parameters</h3>
              <div className="form-group setting-row">
                <label>Model Name</label>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  placeholder="e.g. llama2, mixtral, gpt-4o"
                  className="active-input"
                />
              </div>
              <div className="form-group setting-row" style={{ marginTop: '1rem' }}>
                <label>Temperature ({config.temperature})</label>
                <input
                  type="range"
                  min="0" max="1" step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="active-input"
                />
              </div>
            </div>

            <div className="settings-footer">
              <button className="save-btn" onClick={() => setShowSettings(false)}>Save Button</button>
              <button className="test-conn-btn" onClick={testConnection}>Test Connection</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
