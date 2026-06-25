import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface IssueFetcherProps {
  credentials: any;
  onIssueFetched: (issueData: any) => void;
}

export const IssueFetcher: React.FC<IssueFetcherProps> = ({ credentials, onIssueFetched }) => {
  const [issueId, setIssueId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [issue, setIssue] = useState<any>(null);

  const handleFetch = async () => {
    if (!issueId) return;
    setLoading(true);
    setError('');
    setIssue(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/jira/fetch-issue`, {
        issue_id: issueId,
        base_url: credentials.baseUrl,
        email: credentials.email,
        api_token: credentials.apiToken
      });
      setIssue(response.data);
      onIssueFetched(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch issue');
    } finally {
      setLoading(false);
    }
  };

  if (!credentials) return null;

  return (
    <div className="bg-card text-card-foreground shadow-sm rounded-lg border border-border p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">2. Fetch Jira Story</h2>
      <div className="flex space-x-3 mb-4">
        <div className="flex-1 max-w-sm relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="e.g. PROJ-123" 
            className="w-full bg-transparent border border-input rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={issueId}
            onChange={(e) => setIssueId(e.target.value)}
          />
        </div>
        <button 
          onClick={handleFetch}
          disabled={loading || !issueId}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Fetch Data
        </button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {issue && (
        <div className="bg-muted p-4 rounded-md mt-4 border border-border">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-foreground">{issue.key}: {issue.summary}</h3>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">{issue.issue_type}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mt-3">
            <div>
              <p className="text-muted-foreground font-medium">Priority</p>
              <p className="text-foreground">{issue.priority}</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Components</p>
              <p className="text-foreground">{issue.components.join(', ') || 'None'}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-muted-foreground font-medium mb-1">Acceptance Criteria</p>
            <div className="text-sm text-foreground bg-background p-3 rounded border border-border max-h-32 overflow-y-auto whitespace-pre-wrap">
              {issue.acceptance_criteria}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
