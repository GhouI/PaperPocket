# PaperPocket 📚🤖

A React Native mobile app combining **arXiv Sanity** paper discovery with **NotebookLM**-style AI-powered paper analysis. Uses **Cactus** for on-device AI inference.

## Features

### 📰 Smart Paper Feed
- **Real arXiv Integration**: Fetches papers directly from arXiv API
- Personalized recommendations based on your interests
- Support for arXiv categories (cs.LG, cs.CV, cs.CL, etc.) and topics
- Pull-to-refresh for latest papers

### 🔍 Search & Discovery
- Full-text search across arXiv papers
- Search by title, author, abstract, or keywords
- Sort by relevance or date
- Popular search suggestions

### 💬 AI Paper Assistant (Cactus-Powered)
- **100% On-Device AI** - works completely offline after model download
- Chat with AI about any paper
- Get instant summaries and explanations
- Ask questions about methodology, results, implications
- Streaming responses for real-time feedback
- Uses **Qwen 0.6B** model (~600MB) optimized for mobile

### 📚 Personal Library
- Save papers to your library
- Persistent storage using Expo FileSystem
- Search within your library
- Sort by date added, title, or publication date

### 🎯 Interest-Based Recommendations
- Add topics (e.g., "transformers", "diffusion models")
- Add arXiv categories (e.g., cs.LG, cs.CV)
- Papers are fetched based on your interests
- Easy interest management

## Tech Stack

- **React Native** + **Expo** (~v50) - Cross-platform mobile development
- **Cactus React Native** (latest) - On-device LLM inference
- **Zustand** - State management
- **React Navigation** - Native navigation
- **TypeScript** - Type safety
- **fast-xml-parser** - arXiv API XML parsing
- **Expo FileSystem** - Persistent local storage

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- iOS: Xcode 15+ and CocoaPods
- Android: Android Studio with SDK 24+

### Installation

```bash
# Navigate to app directory
cd app

# Install dependencies
npm install

# iOS only: Install pods
cd ios && npx pod-install && cd ..

# Start development server
npx expo start
```

### Running the App

```bash
# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android

# Development build with Expo Go
npx expo start
```

## Project Structure

```
app/
├── App.tsx                    # Root component with font loading
├── package.json               # Dependencies
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── PaperCard.tsx      # Paper display (full & compact)
│   │   ├── SearchBar.tsx      # Search input
│   │   ├── InterestChip.tsx   # Tag chips
│   │   ├── AgentActivityCard  # AI activity display
│   │   ├── Header.tsx         # Navigation header
│   │   ├── SettingsRow.tsx    # Settings list items
│   │   └── ModelDownloadBanner# Cactus model download UI
│   ├── screens/               # App screens
│   │   ├── DashboardScreen    # Main feed with recommendations
│   │   ├── SearchScreen       # arXiv paper search
│   │   ├── LibraryScreen      # Saved papers
│   │   ├── PaperDetailsScreen # Full paper view
│   │   ├── AIChatScreen       # Cactus-powered chat
│   │   ├── AddInterestScreen  # Interest management
│   │   └── SettingsScreen     # App settings
│   ├── hooks/
│   │   └── useCactusAI.ts     # Cactus integration hook
│   ├── services/
│   │   ├── arxivApi.ts        # arXiv API client
│   │   └── storage.ts         # Local file storage
│   ├── store/
│   │   └── useAppStore.ts     # Zustand state management
│   ├── navigation/
│   │   └── index.tsx          # Tab + stack navigation
│   ├── theme/
│   │   └── index.ts           # Design tokens
│   └── types/
│       └── index.ts           # TypeScript definitions
```

## Cactus Integration

PaperPocket uses the official `cactus-react-native` library with the `useCactusLM` hook:

### Model Selection
- **Default Model**: `qwen3-0.6` (~600MB)
- Lightweight and optimized for mobile devices
- Supports text completion with streaming
- Context size: 4096 tokens

### Key Features

```typescript
import { useCactusLM } from 'cactus-react-native';

// Initialize the hook
const cactusLM = useCactusLM({
  model: 'qwen3-0.6',
  contextSize: 4096,
});

// Download model (one-time)
await cactusLM.download();

// Generate completion with streaming
const result = await cactusLM.complete({
  messages: [
    { role: 'system', content: 'You are a research assistant.' },
    { role: 'user', content: 'Summarize this paper...' }
  ],
  options: {
    temperature: 0.7,
    maxTokens: 512,
  },
  onToken: (token) => console.log(token),
});
```

### Available State

```typescript
cactusLM.isDownloaded      // Model ready for use
cactusLM.isDownloading     // Download in progress
cactusLM.downloadProgress  // 0-1 progress value
cactusLM.isGenerating      // Completion in progress
cactusLM.completion        // Accumulated response text
cactusLM.error             // Any error message
```

## arXiv API Integration

The app fetches papers directly from the arXiv API:

```typescript
import { searchPapers, getPapersForInterests } from './services/arxivApi';

// Search papers
const { papers, totalResults } = await searchPapers('transformers', {
  maxResults: 30,
  sortBy: 'relevance',
});

// Get papers for user interests
const papers = await getPapersForInterests([
  { name: 'cs.LG', type: 'category' },
  { name: 'transformers', type: 'topic' },
]);
```

## Data Persistence

All user data is stored locally using Expo FileSystem:

- **Library**: Saved papers (`papers.json`)
- **Interests**: User topics & categories (`interests.json`)
- **Chat Sessions**: Conversation history (`chat_sessions.json`)
- **Notes**: Paper annotations (`notes.json`)
- **Paper Cache**: Recently fetched papers (`papers_cache.json`)

## Design System

- **Colors**: Primary blue (#137fec), Accent orange (#ff9500)
- **Typography**: Inter font family (400, 500, 700 weights)
- **Dark Mode**: Full support with automatic system detection
- **Spacing**: 4px base unit system (xs: 4, sm: 8, md: 12, lg: 16, xl: 20)

## Screens

| Screen | Description |
|--------|-------------|
| Dashboard | Main feed with personalized paper recommendations |
| Search | Search arXiv by keyword, author, or topic |
| Library | Saved papers with search and sort |
| Settings | App settings, model management, data controls |
| Paper Details | Full paper view with abstract, tabs for related/notes |
| AI Chat | Cactus-powered conversational AI about papers |
| Add Interest | Manage topics and arXiv categories |

## License

MIT License

## Acknowledgments

- [Cactus](https://cactuscompute.com) - On-device AI inference
- [arXiv](https://arxiv.org) - Open access research papers
- [arXiv Sanity](https://arxiv-sanity-lite.com) - Recommendation inspiration
