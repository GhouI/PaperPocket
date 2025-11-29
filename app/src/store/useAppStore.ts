import { create } from 'zustand';
import type {
  Paper,
  UserInterest,
  UserProfile,
  ChatSession,
  AgentActivity,
  AppSettings,
  PaperNote,
  ChatMessage,
} from '../types';
import * as storage from '../services/storage';
import * as arxivApi from '../services/arxivApi';

interface AppState {
  // Initialization
  isInitialized: boolean;
  initializeApp: () => Promise<void>;

  // User
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // Interests
  interests: UserInterest[];
  addInterest: (interest: UserInterest) => Promise<void>;
  removeInterest: (id: string) => Promise<void>;
  setInterests: (interests: UserInterest[]) => void;
  loadInterests: () => Promise<void>;

  // Papers - Recommended Feed
  recommendedPapers: Paper[];
  isLoadingPapers: boolean;
  papersError: string | null;
  fetchRecommendedPapers: () => Promise<void>;
  setRecommendedPapers: (papers: Paper[]) => void;

  // Papers - Library (saved)
  libraryPapers: Paper[];
  addToLibrary: (paper: Paper) => Promise<void>;
  removeFromLibrary: (id: string) => Promise<void>;
  loadLibrary: () => Promise<void>;
  isInLibrary: (paperId: string) => boolean;

  // Search
  searchQuery: string;
  searchResults: Paper[];
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  searchPapers: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Notes
  notes: Record<string, PaperNote[]>;
  addNote: (paperId: string, note: PaperNote) => Promise<void>;
  updateNote: (paperId: string, noteId: string, content: string) => Promise<void>;
  deleteNote: (paperId: string, noteId: string) => Promise<void>;
  loadNotes: () => Promise<void>;

  // Chat Sessions
  chatSessions: Record<string, ChatSession>;
  getChatSession: (paperId: string) => ChatSession | undefined;
  addMessageToSession: (paperId: string, message: ChatMessage) => Promise<void>;
  updateLastMessage: (paperId: string, content: string) => void;
  loadChatSessions: () => Promise<void>;

  // Agent Activity
  agentActivities: AgentActivity[];
  addActivity: (activity: AgentActivity) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Paper lookup helper
  getPaperById: (paperId: string) => Paper | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  // ==================== Initialization ====================
  isInitialized: false,

  initializeApp: async () => {
    try {
      await Promise.all([
        get().loadInterests(),
        get().loadLibrary(),
        get().loadNotes(),
        get().loadChatSessions(),
      ]);
      set({ isInitialized: true });
    } catch (error) {
      console.error('Error initializing app:', error);
      set({ isInitialized: true }); // Still mark as initialized to show UI
    }
  },

  // ==================== User ====================
  user: {
    id: '1',
    name: 'Researcher',
    email: 'researcher@example.com',
    subscription: 'free',
  },
  setUser: (user) => set({ user }),

  // ==================== Interests ====================
  interests: [],

  loadInterests: async () => {
    try {
      const interests = await storage.getInterests();
      set({ interests });
    } catch (error) {
      console.error('Error loading interests:', error);
    }
  },

  addInterest: async (interest) => {
    const { interests } = get();
    const newInterests = [...interests, interest];
    set({ interests: newInterests });
    await storage.saveInterests(newInterests);
  },

  removeInterest: async (id) => {
    const { interests } = get();
    const newInterests = interests.filter((i) => i.id !== id);
    set({ interests: newInterests });
    await storage.saveInterests(newInterests);
  },

  setInterests: (interests) => set({ interests }),

  // ==================== Recommended Papers ====================
  recommendedPapers: [],
  isLoadingPapers: false,
  papersError: null,

  fetchRecommendedPapers: async () => {
    const { interests } = get();
    set({ isLoadingPapers: true, papersError: null });

    try {
      let papers: Paper[];

      if (interests.length > 0) {
        // Fetch papers based on user interests
        papers = await arxivApi.getPapersForInterests(interests);
      } else {
        // Default: fetch recent ML/AI papers
        papers = await arxivApi.getRecentPapers(['cs.LG', 'cs.CL', 'cs.AI', 'cs.CV'], 30);
      }

      // Cache the papers
      await storage.savePapersCache(papers);

      // Add activity for paper processing
      const activity: AgentActivity = {
        id: Date.now().toString(),
        type: 'paper_processed',
        paperTitle: `Fetched ${papers.length} papers`,
        status: 'completed',
        timestamp: new Date().toISOString(),
      };

      set({
        recommendedPapers: papers,
        isLoadingPapers: false,
        agentActivities: [activity, ...get().agentActivities].slice(0, 20),
      });
    } catch (error) {
      console.error('Error fetching papers:', error);
      
      // Try to load from cache
      const cached = await storage.getPapersCache();
      if (cached) {
        set({
          recommendedPapers: cached.papers,
          isLoadingPapers: false,
          papersError: 'Using cached data (network error)',
        });
      } else {
        set({
          isLoadingPapers: false,
          papersError: error instanceof Error ? error.message : 'Failed to fetch papers',
        });
      }
    }
  },

  setRecommendedPapers: (papers) => set({ recommendedPapers: papers }),

  // ==================== Library ====================
  libraryPapers: [],

  loadLibrary: async () => {
    try {
      const papers = await storage.getLibraryPapers();
      set({ libraryPapers: papers });
    } catch (error) {
      console.error('Error loading library:', error);
    }
  },

  addToLibrary: async (paper) => {
    const { libraryPapers } = get();
    if (libraryPapers.some((p) => p.id === paper.id)) return;

    const newLibrary = [paper, ...libraryPapers];
    set({ libraryPapers: newLibrary });
    await storage.saveLibraryPapers(newLibrary);
  },

  removeFromLibrary: async (id) => {
    const { libraryPapers } = get();
    const newLibrary = libraryPapers.filter((p) => p.id !== id);
    set({ libraryPapers: newLibrary });
    await storage.saveLibraryPapers(newLibrary);
  },

  isInLibrary: (paperId) => {
    return get().libraryPapers.some((p) => p.id === paperId);
  },

  // ==================== Search ====================
  searchQuery: '',
  searchResults: [],
  isSearching: false,

  setSearchQuery: (query) => set({ searchQuery: query }),

  searchPapers: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }

    set({ isSearching: true, searchQuery: query });

    try {
      const { papers } = await arxivApi.searchPapers(query, {
        maxResults: 30,
        sortBy: 'relevance',
      });
      set({ searchResults: papers, isSearching: false });
    } catch (error) {
      console.error('Error searching papers:', error);
      set({ isSearching: false });
    }
  },

  clearSearch: () => set({ searchQuery: '', searchResults: [] }),

  // ==================== Notes ====================
  notes: {},

  loadNotes: async () => {
    try {
      const notes = await storage.getAllNotes();
      set({ notes });
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  },

  addNote: async (paperId, note) => {
    const { notes } = get();
    const paperNotes = notes[paperId] || [];
    const newNotes = {
      ...notes,
      [paperId]: [...paperNotes, note],
    };
    set({ notes: newNotes });
    await storage.saveAllNotes(newNotes);
  },

  updateNote: async (paperId, noteId, content) => {
    const { notes } = get();
    const paperNotes = notes[paperId] || [];
    const updatedNotes = paperNotes.map((n) =>
      n.id === noteId ? { ...n, content, updatedAt: new Date().toISOString() } : n
    );
    const newNotes = { ...notes, [paperId]: updatedNotes };
    set({ notes: newNotes });
    await storage.saveAllNotes(newNotes);
  },

  deleteNote: async (paperId, noteId) => {
    const { notes } = get();
    const paperNotes = notes[paperId] || [];
    const filteredNotes = paperNotes.filter((n) => n.id !== noteId);
    const newNotes = { ...notes, [paperId]: filteredNotes };
    set({ notes: newNotes });
    await storage.saveAllNotes(newNotes);
  },

  // ==================== Chat Sessions ====================
  chatSessions: {},

  loadChatSessions: async () => {
    try {
      const sessions = await storage.getChatSessions();
      set({ chatSessions: sessions });
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  },

  getChatSession: (paperId) => {
    return get().chatSessions[paperId];
  },

  addMessageToSession: async (paperId, message) => {
    const { chatSessions } = get();
    const existingSession = chatSessions[paperId];

    const updatedSession: ChatSession = existingSession
      ? {
          ...existingSession,
          messages: [...existingSession.messages, message],
          updatedAt: new Date().toISOString(),
        }
      : {
          id: paperId,
          paperId,
          messages: [message],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

    const newSessions = { ...chatSessions, [paperId]: updatedSession };
    set({ chatSessions: newSessions });
    await storage.saveChatSessions(newSessions);
  },

  updateLastMessage: (paperId, content) => {
    const { chatSessions } = get();
    const session = chatSessions[paperId];
    if (!session || session.messages.length === 0) return;

    const messages = [...session.messages];
    messages[messages.length - 1] = {
      ...messages[messages.length - 1],
      content,
      isStreaming: false,
    };

    set({
      chatSessions: {
        ...chatSessions,
        [paperId]: { ...session, messages },
      },
    });
  },

  // ==================== Agent Activity ====================
  agentActivities: [],

  addActivity: (activity) => {
    set((state) => ({
      agentActivities: [activity, ...state.agentActivities].slice(0, 50),
    }));
  },

  // ==================== Settings ====================
  settings: {
    theme: 'system',
    notificationsEnabled: true,
    dailyDigestEnabled: false,
    defaultPaperSource: 'arxiv',
    modelSlug: 'qwen3-0.6',
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  // ==================== Helpers ====================
  getPaperById: (paperId) => {
    const { recommendedPapers, libraryPapers, searchResults } = get();
    return (
      recommendedPapers.find((p) => p.id === paperId) ||
      libraryPapers.find((p) => p.id === paperId) ||
      searchResults.find((p) => p.id === paperId)
    );
  },
}));
