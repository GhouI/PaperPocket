import { create } from 'zustand';
import type {
  Paper,
  UserInterest,
  UserProfile,
  ChatSession,
  AgentActivity,
  AppSettings,
  PaperNote,
} from '../types';

interface AppState {
  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  
  // Interests
  interests: UserInterest[];
  addInterest: (interest: UserInterest) => void;
  removeInterest: (id: string) => void;
  setInterests: (interests: UserInterest[]) => void;
  
  // Papers
  recommendedPapers: Paper[];
  setRecommendedPapers: (papers: Paper[]) => void;
  libraryPapers: Paper[];
  addToLibrary: (paper: Paper) => void;
  removeFromLibrary: (id: string) => void;
  setLibraryPapers: (papers: Paper[]) => void;
  
  // Notes
  notes: Record<string, PaperNote[]>;
  addNote: (paperId: string, note: PaperNote) => void;
  updateNote: (paperId: string, noteId: string, content: string) => void;
  deleteNote: (paperId: string, noteId: string) => void;
  
  // Chat Sessions
  chatSessions: Record<string, ChatSession>;
  setChatSession: (paperId: string, session: ChatSession) => void;
  addMessageToSession: (paperId: string, message: ChatSession['messages'][0]) => void;
  updateLastMessage: (paperId: string, content: string) => void;
  
  // Agent Activity
  agentActivities: AgentActivity[];
  addActivity: (activity: AgentActivity) => void;
  setActivities: (activities: AgentActivity[]) => void;
  
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // AI Model State
  isModelDownloaded: boolean;
  isModelLoading: boolean;
  modelDownloadProgress: number;
  setModelDownloaded: (downloaded: boolean) => void;
  setModelLoading: (loading: boolean) => void;
  setModelDownloadProgress: (progress: number) => void;
  
  // Search
  searchQuery: string;
  searchResults: Paper[];
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: Paper[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // User
  user: {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    subscription: 'pro',
  },
  setUser: (user) => set({ user }),
  
  // Interests
  interests: [
    { id: '1', name: 'Deep Learning', type: 'topic', createdAt: new Date().toISOString() },
    { id: '2', name: 'cs.LG', type: 'category', createdAt: new Date().toISOString() },
    { id: '3', name: 'Transformers', type: 'topic', createdAt: new Date().toISOString() },
    { id: '4', name: 'NLP', type: 'topic', createdAt: new Date().toISOString() },
  ],
  addInterest: (interest) =>
    set((state) => ({ interests: [...state.interests, interest] })),
  removeInterest: (id) =>
    set((state) => ({ interests: state.interests.filter((i) => i.id !== id) })),
  setInterests: (interests) => set({ interests }),
  
  // Papers
  recommendedPapers: [],
  setRecommendedPapers: (papers) => set({ recommendedPapers: papers }),
  libraryPapers: [],
  addToLibrary: (paper) =>
    set((state) => ({
      libraryPapers: state.libraryPapers.some((p) => p.id === paper.id)
        ? state.libraryPapers
        : [...state.libraryPapers, paper],
    })),
  removeFromLibrary: (id) =>
    set((state) => ({
      libraryPapers: state.libraryPapers.filter((p) => p.id !== id),
    })),
  setLibraryPapers: (papers) => set({ libraryPapers: papers }),
  
  // Notes
  notes: {},
  addNote: (paperId, note) =>
    set((state) => ({
      notes: {
        ...state.notes,
        [paperId]: [...(state.notes[paperId] || []), note],
      },
    })),
  updateNote: (paperId, noteId, content) =>
    set((state) => ({
      notes: {
        ...state.notes,
        [paperId]: (state.notes[paperId] || []).map((n) =>
          n.id === noteId ? { ...n, content, updatedAt: new Date().toISOString() } : n
        ),
      },
    })),
  deleteNote: (paperId, noteId) =>
    set((state) => ({
      notes: {
        ...state.notes,
        [paperId]: (state.notes[paperId] || []).filter((n) => n.id !== noteId),
      },
    })),
  
  // Chat Sessions
  chatSessions: {},
  setChatSession: (paperId, session) =>
    set((state) => ({
      chatSessions: { ...state.chatSessions, [paperId]: session },
    })),
  addMessageToSession: (paperId, message) =>
    set((state) => {
      const existingSession = state.chatSessions[paperId];
      if (existingSession) {
        return {
          chatSessions: {
            ...state.chatSessions,
            [paperId]: {
              ...existingSession,
              messages: [...existingSession.messages, message],
              updatedAt: new Date().toISOString(),
            },
          },
        };
      }
      return {
        chatSessions: {
          ...state.chatSessions,
          [paperId]: {
            id: paperId,
            paperId,
            messages: [message],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
      };
    }),
  updateLastMessage: (paperId, content) =>
    set((state) => {
      const session = state.chatSessions[paperId];
      if (!session || session.messages.length === 0) return state;
      const messages = [...session.messages];
      messages[messages.length - 1] = {
        ...messages[messages.length - 1],
        content,
      };
      return {
        chatSessions: {
          ...state.chatSessions,
          [paperId]: { ...session, messages },
        },
      };
    }),
  
  // Agent Activity
  agentActivities: [
    {
      id: '1',
      type: 'paper_processed',
      paperTitle: 'Self-Consuming Generative Models Go To The Tail',
      status: 'completed',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'paper_processed',
      paperTitle: 'Scaling Monosemanticity in Superposition',
      status: 'completed',
      timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    },
  ],
  addActivity: (activity) =>
    set((state) => ({ agentActivities: [activity, ...state.agentActivities] })),
  setActivities: (activities) => set({ agentActivities: activities }),
  
  // Settings
  settings: {
    theme: 'system',
    notificationsEnabled: true,
    dailyDigestEnabled: true,
    defaultPaperSource: 'arxiv',
    modelSlug: 'qwen3-0.6',
  },
  updateSettings: (newSettings) =>
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),
  
  // AI Model State
  isModelDownloaded: false,
  isModelLoading: false,
  modelDownloadProgress: 0,
  setModelDownloaded: (downloaded) => set({ isModelDownloaded: downloaded }),
  setModelLoading: (loading) => set({ isModelLoading: loading }),
  setModelDownloadProgress: (progress) => set({ modelDownloadProgress: progress }),
  
  // Search
  searchQuery: '',
  searchResults: [],
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
}));

