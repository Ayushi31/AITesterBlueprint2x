import React, { useState } from 'react';
import { Download, MessageCircle, FileText, Share, Loader2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import axios from 'axios';
import { exportToCSV, exportToMarkdown, exportToWhatsApp } from '../utils/exportUtils';
import { API_BASE_URL } from '../config';

interface ExportPanelProps {
  testCases: any[];
  projectKey?: string;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ testCases, projectKey }) => {
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState('');
  const [pushSuccess, setPushSuccess] = useState(false);
  const [showXrayForm, setShowXrayForm] = useState(false);
  const [xrayClientId, setXrayClientId] = useState('');
  const [xrayClientSecret, setXrayClientSecret] = useState('');
  const [xrayProjectKey, setXrayProjectKey] = useState(projectKey || '');

  if (!testCases || testCases.length === 0) return null;

  const handlePushXray = async () => {
    if (!xrayClientId || !xrayClientSecret || !xrayProjectKey) {
      setPushSuccess(false);
      setPushResult('Please fill in all Xray credentials before pushing.');
      return;
    }
    setPushing(true);
    setPushResult('');

    try {
      const response = await axios.post(`${API_BASE_URL}/testcases/push-xray`, {
        test_cases: testCases,
        client_id: xrayClientId,
        client_secret: xrayClientSecret,
        project_key: xrayProjectKey
      });

      if (response.data.success) {
        setPushSuccess(true);
        setPushResult(`✅ Successfully pushed ${response.data.pushed_count} test cases to Xray!`);
      } else {
        setPushSuccess(false);
        setPushResult('❌ ' + response.data.message);
      }
    } catch (err: any) {
      setPushSuccess(false);
      setPushResult('❌ ' + (err.response?.data?.detail || 'Error pushing to Xray'));
    } finally {
      setPushing(false);
    }
  };

  return (
    <div className="bg-card text-card-foreground shadow-sm rounded-lg border border-border p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4">Export Options</h2>

      {/* Export Buttons Row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => exportToCSV(testCases)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </button>

        <button
          onClick={() => exportToWhatsApp(testCases)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </button>

        <button
          onClick={() => exportToMarkdown(testCases)}
          className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition"
        >
          <FileText className="w-4 h-4 mr-2" />
          Markdown
        </button>

        <div className="flex-1" />

        {/* Xray Push Button */}
        <button
          onClick={() => setShowXrayForm(prev => !prev)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          <Share className="w-4 h-4 mr-2" />
          Push to Xray
          {showXrayForm ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </button>
      </div>

      {/* Xray Credentials Collapsible Panel */}
      {showXrayForm && (
        <div className="border border-border rounded-lg p-5 bg-muted/20 mt-2 space-y-4">
          <div className="flex items-start space-x-2 text-sm text-muted-foreground mb-2">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
            <p>
              Get your Xray Cloud API credentials from{' '}
              <a
                href="https://id.atlassian.com/manage-profile/apps"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline hover:text-blue-300"
              >
                Atlassian API Tokens
              </a>{' '}
              or your Xray Cloud app settings under <strong>API Keys</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Xray Client ID</label>
              <input
                type="text"
                placeholder="Your Xray Cloud Client ID"
                className="w-full bg-transparent border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={xrayClientId}
                onChange={(e) => setXrayClientId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Xray Client Secret</label>
              <input
                type="password"
                placeholder="Your Xray Cloud Client Secret"
                className="w-full bg-transparent border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={xrayClientSecret}
                onChange={(e) => setXrayClientSecret(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Jira Project Key</label>
              <input
                type="text"
                placeholder="e.g. PROJ, SCRUM, QA"
                className="w-full bg-transparent border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={xrayProjectKey}
                onChange={(e) => setXrayProjectKey(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handlePushXray}
            disabled={pushing}
            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50 font-semibold"
          >
            {pushing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Pushing to Xray...</>
            ) : (
              <><Share className="w-4 h-4 mr-2" /> Confirm & Push to Xray</>
            )}
          </button>

          {pushResult && (
            <p className={`text-sm font-medium mt-2 ${pushSuccess ? 'text-green-500' : 'text-destructive'}`}>
              {pushResult}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
