import { Download, Upload, ShieldCheck, Database } from 'lucide-react';
import { useStore } from '../store/useStore';

export function SettingsView() {
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
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Database className="text-emerald-400" /> Settings
        </h2>
        <p className="text-slate-400 text-sm mt-1">Control your local data and backup settings.</p>
      </div>

      <div className="glass-card p-6 border border-white/10 space-y-6">
        <div className="flex items-start gap-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
          <ShieldCheck className="text-purple-400 shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-purple-300">Privacy First</h3>
            <p className="text-sm text-purple-200/70 mt-1">
              Your data never leaves this browser. Everything is strictly stored in your device's <code>localStorage</code>. 
              Remember to regularly export backups!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
              <Download size={18} className="text-blue-400" /> Export Backup
            </h4>
            <p className="text-xs text-slate-400 mb-4 h-10">Export your jobs and stats to a JSON file. Use this to transfer data to another browser.</p>
            <button
              onClick={handleExport}
              className="w-full glass-button primary-button text-sm"
            >
              Download Backup
            </button>
          </div>

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
              <Upload size={18} className="text-orange-400" /> Import Backup
            </h4>
            <p className="text-xs text-slate-400 mb-4 h-10">Restore your jobs from a JSON file. Warning: This will overwrite your current active data.</p>
            <label className="w-full glass-button border-orange-500/50 hover:bg-orange-500/20 text-orange-300 cursor-pointer justify-center text-sm">
              <span>Select File to Import</span>
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
