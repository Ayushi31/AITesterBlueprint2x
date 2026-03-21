import { Download, Upload, BrainCog } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Header() {
  const { jobs, stats, importData } = useStore();

  const handleExport = () => {
    const data = { jobs, stats };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (window.confirm('Are you sure you want to overwrite your current data? This cannot be undone.')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data && Array.isArray(data.jobs)) {
            importData(data);
            alert('Data restored successfully!');
          } else {
            alert('Invalid backup file format.');
          }
        } catch (error) {
          alert('Failed to parse backup file.');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = ''; // Reset input
  };

  return (
    <header className="px-6 py-4 flex items-center justify-between glass z-10 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-purple-500 to-blue-500 p-2 rounded-xl text-white shadow-lg">
          <BrainCog size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            JobFlow AI
          </h1>
          <p className="text-xs text-slate-400">Intelligent Career Assistant</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <label className="glass-button cursor-pointer group">
          <Upload size={18} className="group-hover:-translate-y-0.5 transition-transform" />
          <span className="hidden sm:inline">Import Data</span>
          <input type="file" accept=".json" className="hidden" onChange={handleImport} />
        </label>
        
        <button onClick={handleExport} className="glass-button group">
          <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
          <span className="hidden sm:inline">Export Backup</span>
        </button>
      </div>
    </header>
  );
}
