import React, { useState } from 'react';
import { analyzeMarketTrends } from '../services/geminiService';
import { TrendingUp, TrendingDown, Globe, Loader2, Link } from 'lucide-react';
import { GroundingChunk } from '../types';

const MarketPulse: React.FC = () => {
  const [insight, setInsight] = useState('');
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [loading, setLoading] = useState(false);

  const runForecast = async () => {
    setLoading(true);
    try {
        const res = await analyzeMarketTrends();
        setInsight(res.text);
        setSources(res.sources || []);
    } catch(e) {
        setInsight("Forecast data unavailable.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <header>
            <h2 className="text-2xl font-bold text-stone-800">Market Pulse</h2>
            <p className="text-stone-500 text-sm">Global pharmaceutical trade indices and forecasts.</p>
        </header>

        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
            <h3 className="font-bold text-xl mb-6 text-stone-800">Global Trade Indices</h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="font-bold text-stone-700">Lyophilized 99% Pure</span>
                    <div className="text-right font-mono font-bold">
                        <p className="text-stone-800">$18,400/g</p>
                        <p className="text-xs text-green-500 flex items-center justify-end gap-1"><TrendingUp className="w-3 h-3"/> 2.1%</p>
                    </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="font-bold text-stone-700">Crude Alpha-Toxin</span>
                    <div className="text-right font-mono font-bold">
                        <p className="text-stone-800">$9,150/g</p>
                        <p className="text-xs text-red-500 flex items-center justify-end gap-1"><TrendingDown className="w-3 h-3"/> 0.8%</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-orange-50 p-8 rounded-2xl border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-md">
                <h4 className="font-bold text-orange-900 flex items-center gap-2">
                    <Globe className="w-4 h-4"/> Market Prediction AI
                </h4>
                <p className="text-xs text-orange-800 mt-2 leading-relaxed">
                    Uses Google Search Grounding to analyze global pharmaceutical trials and predict pricing volatility in real-time.
                </p>
            </div>
            <button 
                onClick={runForecast}
                disabled={loading}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors whitespace-nowrap flex items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin w-4 h-4"/> : 'Run Forecast'}
            </button>
        </div>

        {insight && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm animate-fade-in">
                <h4 className="font-bold text-stone-800 uppercase text-xs tracking-wider mb-3">Forecast Report</h4>
                <div className="text-sm text-stone-600 leading-relaxed mb-4">
                     {insight}
                </div>
                {sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-stone-100">
                        {sources.map((s, i) => (
                             s.web?.uri && (
                                <a key={i} href={s.web.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1 bg-stone-100 rounded-full text-[10px] text-stone-500 hover:bg-stone-200 transition-colors">
                                    <Link className="w-3 h-3"/> {s.web.title}
                                </a>
                             )
                        ))}
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default MarketPulse;