import React, { useState, useEffect } from 'react';
import { generateProductionStrategy } from '../services/geminiService';
import { Sparkles, Loader2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const Operations: React.FC = () => {
  const [pop, setPop] = useState(5000);
  const [temp, setTemp] = useState(80);
  const [humid, setHumid] = useState(50);
  const [yieldVal, setYieldVal] = useState(0);
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simple yield calculation: Population * 4mg * 1/1000
    setYieldVal(parseFloat((pop * 4 * 1 / 1000).toFixed(2)));
  }, [pop]);

  const runStrategy = async () => {
    setLoading(true);
    try {
        const res = await generateProductionStrategy({ population: pop, temp, humidity: humid, yield: yieldVal });
        setAiInsight(res);
    } catch(e) {
        setAiInsight("AI Service temporarily unavailable.");
    } finally {
        setLoading(false);
    }
  };

  const habData = [
    { name: 'Stable', value: Math.max(0, 100 - (Math.abs(temp-80)*4 + Math.abs(humid-50)*3)) },
    { name: 'Stress', value: 100 - Math.max(0, 100 - (Math.abs(temp-80)*4 + Math.abs(humid-50)*3)) }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
        <header className="mb-8">
            <h2 className="text-2xl font-bold text-stone-800">Operations</h2>
            <p className="text-stone-500 text-sm">Real-time habitat control and production metrics.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                <h3 className="font-bold text-lg text-stone-800">Batch Parameters</h3>
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Current Population</label>
                        <input 
                            type="number" 
                            value={pop} 
                            onChange={(e) => setPop(Number(e.target.value))}
                            className="w-full text-3xl font-bold bg-transparent border-none text-orange-600 focus:ring-0 outline-none"
                        />
                    </div>
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase">Yield/Yr</span>
                            <p className="font-bold text-stone-800">{yieldVal}g</p>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase">ROI</span>
                            <p className="font-bold text-emerald-600">$3.4M</p>
                        </div>
                    </div>
                    <button 
                        onClick={runStrategy}
                        disabled={loading}
                        className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4"/> : <Sparkles className="w-4 h-4"/>} 
                        AI Production Strategy
                    </button>
                </div>
            </div>

            {/* Environment */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="font-bold text-lg mb-6 text-stone-800">Climate Stability</h3>
                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-8 flex flex-col justify-center">
                        <div>
                            <label className="flex justify-between text-xs font-bold mb-2 text-stone-500">Target Temp: <span className="text-orange-600">{temp}°F</span></label>
                            <input type="range" min="60" max="100" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full accent-orange-600 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"/>
                        </div>
                        <div>
                            <label className="flex justify-between text-xs font-bold mb-2 text-stone-500">Target Humidity: <span className="text-blue-600">{humid}%</span></label>
                            <input type="range" min="10" max="90" value={humid} onChange={(e) => setHumid(Number(e.target.value))} className="w-full accent-blue-600 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"/>
                        </div>
                    </div>
                    <div className="h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={habData} innerRadius={60} outerRadius={80} startAngle={180} endAngle={0} paddingAngle={5} dataKey="value">
                                    <Cell fill="#ea580c" />
                                    <Cell fill="#f1f5f9" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className="text-2xl font-bold text-stone-800">{Math.round(habData[0].value)}%</span>
                            <p className="text-[10px] text-stone-400 uppercase">Stability</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* AI Insight Panel */}
        {aiInsight && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm animate-fade-in">
                <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="w-4 h-4 text-orange-500"/>
                    <h4 className="font-bold text-stone-800 uppercase text-xs tracking-wider">AI Insight Feed</h4>
                </div>
                <div className="text-sm text-stone-600 leading-relaxed prose prose-stone">
                    <pre className="whitespace-pre-wrap font-sans">{aiInsight}</pre>
                </div>
            </div>
        )}
    </div>
  );
};

export default Operations;