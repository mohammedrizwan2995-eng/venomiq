import React, { useState } from 'react';
import { analyzeSafetyIncident } from '../services/geminiService';
import { ShieldAlert, Loader2, Ambulance } from 'lucide-react';

const Safety: React.FC = () => {
    const [incident, setIncident] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTriage = async () => {
        if(!incident) return;
        setLoading(true);
        try {
            const res = await analyzeSafetyIncident(incident);
            setAnalysis(res);
        } catch(e) {
            setAnalysis("Error analyzing incident.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            <header>
                <h2 className="text-2xl font-bold text-stone-800">Safety Log</h2>
                <p className="text-stone-500 text-sm">Biohazard containment and incident triage.</p>
            </header>

            <div className="bg-red-50 p-6 rounded-2xl border border-red-200 flex items-center gap-4 shadow-sm">
                <ShieldAlert className="w-12 h-12 text-red-600"/>
                <div>
                    <h4 className="font-bold text-red-900">Quarantine Protocol Active</h4>
                    <p className="text-sm text-red-700">Sector-7 BSL-3 check required. Verify airlocks.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-stone-800 flex items-center gap-2"><Ambulance className="w-5 h-5"/> Triage Assistant</h3>
                <textarea 
                    value={incident}
                    onChange={(e) => setIncident(e.target.value)}
                    className="w-full h-32 p-4 bg-stone-50 border border-stone-200 rounded-xl outline-none text-sm mb-4 focus:ring-2 focus:ring-red-200 transition-all"
                    placeholder="Describe exposure incident or breach..."
                />
                <button 
                    onClick={handleTriage}
                    disabled={loading || !incident}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4"/> : 'Emergency AI Analysis'}
                </button>
            </div>

            {analysis && (
                <div className="bg-white p-6 rounded-2xl border-l-4 border-red-500 shadow-sm animate-fade-in">
                    <h4 className="font-bold text-stone-800 uppercase text-xs tracking-wider mb-2">Triage Protocol</h4>
                    <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">{analysis}</p>
                </div>
            )}
        </div>
    )
};

export default Safety;