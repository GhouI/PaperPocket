// Paper types
export interface Paper {
  id: string;
  arxivId: string;
  title: string;
  authors: string[];
  abstract: string;
  categories: string[];
  publishedDate: string;
  updatedDate: string;
  pdfUrl: string;
  arxivUrl: string;
  thumbnailUrl?: string;
  embedding?: number[];
  // Computed/UI fields
  matchedInterest?: string;
  similarityScore?: number;
}

export interface PaperNote {
  id: string;
  paperId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// User types
export interface UserInterest {
  id: string;
  name: string;
  type: 'topic' | 'category' | 'author';
  embedding?: number[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  subscription: 'free' | 'pro';
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  paperId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Agent Activity
export interface AgentActivity {
  id: string;
  type: 'paper_processed' | 'embedding_generated' | 'recommendation_updated';
  paperId?: string;
  paperTitle?: string;
  status: 'completed' | 'in_progress' | 'failed';
  timestamp: string;
}

// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  PaperDetails: { paperId: string };
  AIChat: { paperId: string };
  AddInterest: undefined;
  AddFromUrl: undefined;
  Library: undefined;
  APIKeys: undefined;
  Notifications: undefined;
  Appearance: undefined;
  DataSync: undefined;
  About: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Search: undefined;
  Library: undefined;
  Settings: undefined;
};

// App Settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  dailyDigestEnabled: boolean;
  defaultPaperSource: 'arxiv' | 'semantic_scholar';
  modelSlug: string;
}
