
import React from 'react';
import { X, Terminal, Globe, Key, ChevronRight, ExternalLink } from 'lucide-react';

interface SetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuide: React.FC<SetupGuideProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Terminal className="text-indigo-500 w-5 h-5" />
            System Setup Protocol
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Terminal size={16} /> 1. LOCAL ENGINE
            </div>
            <div className="bg-black p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed">
              <span className="text-slate-600"># Install core modules</span><br />
              npm install @google/genai lucide-react recharts
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Globe size={16} /> 2. DEPLOYMENT
            </div>
            <p className="text-sm text-slate-400">Sync your local repository with Vercel or Netlify. Ensure the <code className="text-indigo-300">API_KEY</code> is set in your environment variables.</p>
          </section>

          <section className="space-y-3 bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <Key size={16} /> 3. AI ACTIVATION
            </div>
            <p className="text-sm text-slate-300">This analyzer requires a Gemini API Key to provide deep scan insights.</p>
            <a 
              href="https://aistudio.google.com/" 
              target="_blank" 
              className="mt-2 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
            >
              Get Free API Key <ExternalLink size={14} />
            </a>
          </section>
        </div>

        <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Standard Operations Manual || Authorized Use</p>
        </div>
      </div>
    </div>
  );
};
