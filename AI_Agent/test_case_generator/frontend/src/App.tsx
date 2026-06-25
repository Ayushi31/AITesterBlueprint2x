import { useState } from 'react';
import axios from 'axios';
import { JiraConnection } from './components/JiraConnection';
import { IssueFetcher } from './components/IssueFetcher';
import { TestCaseTable } from './components/TestCaseTable';
import { ExportPanel } from './components/ExportPanel';
import { Loader2, Beaker, Wand2 } from 'lucide-react';

function App() {
  const [credentials, setCredentials] = useState<any>(null);
  const [issueData, setIssueData] = useState<any>(null);
  const [template, setTemplate] = useState('Standard Functional');
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<string[]>(['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it']);
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [testingLlm, setTestingLlm] = useState(false);
  const [llmMessage, setLlmMessage] = useState('');
  const [testCases, setTestCases] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const testLlmConnection = async () => {
    setTestingLlm(true);
    setLlmMessage('');
    try {
      const response = await axios.post('http://localhost:8000/testcases/test-llm-connection', {
        api_key: apiKey
      });
      if (response.data.status === 'success') {
        const fetchedModels = response.data.models;
        setModels(fetchedModels);
        if (fetchedModels.length > 0) setSelectedModel(fetchedModels[0]);
        setLlmMessage('Connection successful! Models loaded.');
      }
    } catch (err: any) {
      setLlmMessage(err.response?.data?.detail || 'Failed to connect to LLM');
    } finally {
      setTestingLlm(false);
    }
  };

  const handleGenerate = async () => {
    if (!issueData) return;
    setGenerating(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:8000/testcases/generate', {
        issue_data: issueData,
        template: template,
        llm_provider: 'groq',
        model: selectedModel,
        api_key: apiKey
      });
      setTestCases(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate test cases');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateTestCase = (id: string, updated: any) => {
    setTestCases(prev => prev.map(tc => tc.id === id ? updated : tc));
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <header className="bg-card border-b border-border py-4 px-6 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Beaker className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">AI Test Case Generator</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <JiraConnection onConnect={setCredentials} />
            
            <IssueFetcher 
              credentials={credentials} 
              onIssueFetched={setIssueData} 
            />

            {issueData && (
              <div className="bg-card text-card-foreground shadow-sm rounded-lg border border-border p-6">
                <h2 className="text-xl font-semibold mb-4">3. Generation Settings</h2>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Select Template</label>
                <select 
                  className="w-full bg-transparent border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring mb-4"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                >
                  <option className="bg-card text-foreground">Standard Functional</option>
                  <option className="bg-card text-foreground">Regression Focus</option>
                  <option className="bg-card text-foreground">Edge & Boundary Focus</option>
                  <option className="bg-card text-foreground">Security Focused</option>
                </select>

                <label className="block text-sm font-medium text-muted-foreground mb-2 mt-4">Groq API Key (Optional - uses Office Key if blank)</label>
                <div className="flex space-x-2 mb-4">
                  <input 
                    type="password" 
                    placeholder="Leave blank to use Corporate Default"
                    className="flex-1 bg-transparent border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <button 
                    onClick={testLlmConnection}
                    disabled={testingLlm}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    {testingLlm ? 'Testing...' : 'Test LLM'}
                  </button>
                </div>
                {llmMessage && <p className={`text-sm mb-4 font-medium ${llmMessage.toLowerCase().includes('failed') ? 'text-destructive' : 'text-green-500'}`}>{llmMessage}</p>}

                <label className="block text-sm font-medium text-muted-foreground mb-2">Select Model</label>
                <select 
                  className="w-full bg-transparent border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring mb-6"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  {models.map(m => <option key={m} value={m} className="bg-card text-foreground">{m}</option>)}
                </select>

                <button 
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-md font-semibold transition-colors shadow-sm flex items-center"
                >
                  {generating ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
                  ) : (
                    <><Wand2 className="w-5 h-5 mr-2" /> Generate Test Cases</>
                  )}
                </button>
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {!testCases.length && !generating && (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-lg p-12 text-center text-muted-foreground">
                <div className="flex flex-col items-center">
                  <Wand2 className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg">Connect Jira and fetch a story to generate test cases.</p>
                </div>
              </div>
            )}

            {generating && (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-lg p-12 text-center">
                <div className="flex flex-col items-center text-primary">
                  <Loader2 className="w-12 h-12 mb-4 animate-spin" />
                  <p className="text-lg font-medium">AI is analyzing AC and writing test cases...</p>
                  <p className="text-sm text-muted-foreground mt-2">This may take 10-20 seconds.</p>
                </div>
              </div>
            )}

            {testCases.length > 0 && !generating && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ExportPanel testCases={testCases} />
                <TestCaseTable testCases={testCases} onUpdateTestCase={handleUpdateTestCase} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
