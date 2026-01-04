import React, { useState } from 'react';
import { simulateDocking } from '../services/geminiService';
import { Loader2, FlaskConical } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const ResearchLab: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    setLogs(prev => [...prev, "> Initializing molecular docking protocol..."]);
    try {
        const res = await simulateDocking();
        setLogs(prev => [...prev, `> ${res}`]);
    } catch(e) {
        setLogs(prev => [...prev, "> Error: Simulation aborted."]);
    } finally {
        setLoading(false);
    }
  };

  const labData = [
    { subject: 'Cytotoxicity', A: 90, fullMark: 100 },
    { subject: 'Affinity', A: 85, fullMark: 100 },
    { subject: 'Purity', A: 95, fullMark: 100 },
    { subject: 'Stability', A: 75, fullMark: 100 },
    { subject: 'Bio-activity', A: 88, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)] flex flex-col">
        <header>
            <h2 className="text-2xl font-bold text-stone-800">Research Lab</h2>
            <p className="text-stone-500 text-sm">Proteome analysis and molecular simulations.</p>
        </header>

        <div className="grid lg:grid-cols-4 gap-6 flex-1">
            <div className="lg:col-span-3 bg-white p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
                <h3 className="font-bold text-xl mb-6 text-stone-800">Batch Proteome Analysis</h3>
                <div className="flex-1 w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={labData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#57534e', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar name="Batch A" dataKey="A" stroke="#ea580c" fill="#ea580c" fillOpacity={0.2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-stone-900 text-white p-6 rounded-2xl flex flex-col">
                <h4 className="font-bold text-purple-400 mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                    <FlaskConical className="w-3 h-3"/> Molecular AI
                </h4>
                <div className="flex-1 font-mono text-[10px] overflow-y-auto text-stone-400 mb-4 p-3 border border-stone-800 rounded-lg bg-stone-950">
                    <p>{'>'} Ready for simulation...</p>
                    {logs.map((l, i) => <p key={i} className="mt-1">{l}</p>)}
                </div>
                <button 
                    onClick={runSimulation}
                    disabled={loading}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition-colors flex justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin w-3 h-3"/> : 'Simulate Docking'}
                </button>
            </div>
        </div>
    </div>
  );
};

export default ResearchLab;