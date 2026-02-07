export enum ViewState {
  OPERATIONS = 'OPERATIONS',
  LAB = 'LAB',
  MARKET = 'MARKET',
  SAFETY = 'SAFETY',
  HUB = 'HUB',
  CHAT = 'CHAT',
}

export interface OperationsData {
  population: number;
  temp: number;
  humidity: number;
  yield: number;
}

export interface ProteomeData {
  name: string;
  toxicity: number;
  purity: number;
  stability: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
