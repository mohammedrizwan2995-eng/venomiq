import React, { useEffect, useRef, useState } from 'react';
import { getLiveClient, base64ToUint8Array, arrayBufferToBase64, floatTo16BitPCM } from '../services/geminiService';
import { Mic, Video, PhoneOff, Radio, MonitorSmartphone, VideoOff } from 'lucide-react';
import { Modality, LiveServerMessage } from '@google/genai';

const GlobalHub: React.FC = () => {
  const [active, setActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [volume, setVolume] = useState(0);

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoIntervalRef = useRef<number | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const addLog = (msg: string) => setLogs(prev => [...prev.slice(-4), msg]);

  const stopSession = async () => {
    setActive(false);
    setCameraActive(false);
    if (videoIntervalRef.current) {
        clearInterval(videoIntervalRef.current);
        videoIntervalRef.current = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    if (inputSourceRef.current) inputSourceRef.current.disconnect();
    if (processorRef.current) processorRef.current.disconnect();
    if (audioContextRef.current) await audioContextRef.current.close();
    if (outputContextRef.current) await outputContextRef.current.close();
    
    audioContextRef.current = null;
    outputContextRef.current = null;
    addLog("Hub disconnected.");
  };

  const startSession = async () => {
    if (active) return;
    try {
        setActive(true);
        addLog("Connecting to Global Research Network...");
        
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        const outputNode = outputContextRef.current.createGain();
        outputNode.connect(outputContextRef.current.destination);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        streamRef.current = stream;

        if (videoElRef.current) {
            videoElRef.current.srcObject = stream;
            videoElRef.current.play();
            videoElRef.current.muted = true;
        }

        const ai = getLiveClient();
        const sessionPromise = ai.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } },
                systemInstruction: "You are the central AI coordinator for VenomIQ. You manage global research data and coordinate with labs. You can see the user's lab feed.",
            },
            callbacks: {
                onopen: async () => {
                    addLog("Network synced. Live feed active.");
                    if (!audioContextRef.current || !streamRef.current) return;
                    inputSourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
                    processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                    
                    processorRef.current.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        let sum = 0; 
                        for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
                        setVolume(Math.min(Math.sqrt(sum / inputData.length) * 10, 1));

                        const pcmData = floatTo16BitPCM(inputData);
                        sessionPromise.then(session => session.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: arrayBufferToBase64(pcmData) } }));
                    };
                    inputSourceRef.current.connect(processorRef.current);
                    processorRef.current.connect(audioContextRef.current.destination);
                    
                    setCameraActive(true);
                    startVideoProcessing(sessionPromise);
                },
                onmessage: async (msg: LiveServerMessage) => {
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData && outputContextRef.current) {
                         const bytes = base64ToUint8Array(audioData);
                         const dataInt16 = new Int16Array(bytes.buffer);
                         const audioBuffer = outputContextRef.current.createBuffer(1, dataInt16.length, 24000);
                         const channelData = audioBuffer.getChannelData(0);
                         for(let i=0; i<dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;

                         const source = outputContextRef.current.createBufferSource();
                         source.buffer = audioBuffer;
                         source.connect(outputContextRef.current.destination);
                         const time = Math.max(outputContextRef.current.currentTime, nextStartTimeRef.current);
                         source.start(time);
                         nextStartTimeRef.current = time + audioBuffer.duration;
                    }
                },
                onclose: () => stopSession(),
                onerror: () => stopSession()
            }
        });
        sessionPromiseRef.current = sessionPromise;
    } catch (e) {
        console.error(e);
        stopSession();
    }
  };

  const startVideoProcessing = (sessionPromise: Promise<any>) => {
      videoIntervalRef.current = window.setInterval(() => {
          if (!videoElRef.current || !canvasElRef.current) return;
          const canvas = canvasElRef.current;
          const video = videoElRef.current;
          canvas.width = video.videoWidth * 0.5; 
          canvas.height = video.videoHeight * 0.5;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
          sessionPromise.then(session => session.sendRealtimeInput({ media: { mimeType: 'image/jpeg', data: base64 } }));
      }, 500);
  };

  useEffect(() => { return () => { stopSession(); }; }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] justify-center items-center">
        <div className="w-full max-w-4xl bg-white border border-stone-200 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative min-h-[300px] bg-stone-900 rounded-2xl overflow-hidden shadow-inner">
                 <video ref={videoElRef} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${cameraActive && active ? 'opacity-100' : 'opacity-0'}`} autoPlay playsInline muted />
                 <canvas ref={canvasElRef} className="hidden" />
                 
                 <div className={`absolute inset-0 flex items-center justify-center bg-stone-900 transition-opacity duration-500 ${cameraActive && active ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${active ? 'bg-orange-500/20' : 'bg-stone-800'}`}>
                         {active ? (
                            <div className="flex gap-1 h-12">
                                {[1,2,3,4,5].map(i => <div key={i} className="w-2 bg-orange-500 rounded-full transition-all" style={{ height: `${Math.max(10, Math.random() * 50 * (volume + 0.2))}px` }}></div>)}
                            </div>
                         ) : <MonitorSmartphone className="w-12 h-12 text-stone-600" />}
                    </div>
                 </div>
                 
                 {active && (
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div className="bg-black/40 backdrop-blur px-2 py-1 rounded text-[10px] text-orange-400 font-bold tracking-widest">● LIVE FEED</div>
                        <button onClick={() => setCameraActive(!cameraActive)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white">{cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}</button>
                    </div>
                 )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-stone-800 mb-2">Global Hub</h2>
                    <p className="text-stone-500 text-sm mb-6">Connect with central AI command to coordinate research, share visual samples, and sync inventory data globally.</p>
                </div>

                <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 flex-1 mb-6 font-mono text-[10px] text-stone-600 overflow-y-auto custom-scrollbar">
                    {logs.length === 0 && <span className="italic text-stone-400">Hub standby...</span>}
                    {logs.map((log, i) => (
                        <div key={i} className="mb-2 border-l-2 border-orange-400 pl-2">
                             <span className="text-stone-400">{new Date().toLocaleTimeString()}</span> <br/>{log}
                        </div>
                    ))}
                </div>

                {active ? (
                    <button onClick={stopSession} className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                        <PhoneOff className="w-5 h-5" /> Disconnect
                    </button>
                ) : (
                    <button onClick={startSession} className="w-full bg-stone-900 hover:bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95">
                        <Radio className="w-5 h-5" /> Connect Hub
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default GlobalHub;