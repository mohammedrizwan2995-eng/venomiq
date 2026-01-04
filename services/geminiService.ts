import { GoogleGenAI, Type } from "@google/genai";
import { OperationsData, GroundingChunk } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateProductionStrategy = async (data: OperationsData): Promise<string> => {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: `Generate a concise strategic production roadmap for a scorpion farm with:
    - Population: ${data.population} arachnids
    - Temperature: ${data.temp}°F
    - Humidity: ${data.humidity}%
    
    Focus on maximizing venom yield and minimizing stress. Keep it professional and brief (max 3 bullet points).`
  });
  return response.text || "No strategy generated.";
};

export const simulateDocking = async (): Promise<string> => {
    const model = "gemini-3-flash-preview";
    const response = await ai.models.generateContent({
        model,
        contents: "Run a text-based simulation of peptide binding energy for Alpha-Toxin batch #773 against human voltage-gated sodium channels. Output clinical probability.",
        config: {
            systemInstruction: "You are a biochemical simulation AI. Output technical data."
        }
    });
    return response.text || "Simulation failed.";
}

export const analyzeSafetyIncident = async (incident: string): Promise<string> => {
    const model = "gemini-3-flash-preview";
    const response = await ai.models.generateContent({
        model,
        contents: `Analyze this biohazard incident and provide immediate triage steps: "${incident}".`,
        config: { systemInstruction: "You are a Biohazard Safety Officer. Be urgent and precise." }
    });
    return response.text || "No analysis generated.";
}

export const analyzeMarketTrends = async (): Promise<{text: string, sources?: GroundingChunk[]}> => {
    const model = "gemini-3-pro-preview";
    const response = await ai.models.generateContent({
        model,
        contents: "Analyze current global pharmaceutical demand for scorpion venom derived peptides (chlorotoxin, etc). Provide price forecasts.",
        config: {
            tools: [{ googleSearch: {} }]
        }
    });
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
    return { text: response.text || "No market data.", sources };
}

// --- Live API Utils ---
export const getLiveClient = () => {
    return ai.live;
}

export function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output.buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}