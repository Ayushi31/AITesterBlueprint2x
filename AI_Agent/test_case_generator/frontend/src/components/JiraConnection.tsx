import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface JiraConnectionProps {
  onConnect: (credentials: any) => void;
}

export const JiraConnection: React.FC<JiraConnectionProps> = ({ onConnect }) => {
  const [baseUrl, setBaseUrl] = useState('');
  const [email, setEmail] = useState('');
  const [apiToken, setApiToken] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('testing');
    try {
      const response = await axios.post(`${API_BASE_URL}/jira/test-connection`, {
        base_url: baseUrl,
        email: email,
        api_token: apiToken
      });
      if (response.data.status === 'success') {
        setStatus('success');
        setMessage('Connected successfully!');
        onConnect({ baseUrl, email, apiToken });
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.detail || 'Connection failed');
    }
  };

  return (
    <div className="bg-card text-card-foreground shadow-sm rounded-lg border border-border p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">1. Jira Connection</h2>
      <form onSubmit={handleTestConnection} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Base URL</label>
            <input 
              type="text" 
              placeholder="https://yourcompany.atlassian.net"
              className="w-full bg-transparent border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-transparent border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">API Token</label>
            <input 
              type="password" 
              className="w-full bg-transparent border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex items-center space-x-4 pt-2">
          <button 
            type="submit" 
            disabled={status === 'testing'}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
          >
            {status === 'testing' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Test & Connect
          </button>
          
          {status === 'success' && (
            <span className="flex items-center text-sm text-green-600 dark:text-green-500">
              <CheckCircle className="w-4 h-4 mr-1" /> {message}
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center text-sm text-destructive">
              <XCircle className="w-4 h-4 mr-1" /> {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
