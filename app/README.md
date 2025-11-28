# PaperPocket 📚🤖

A React Native mobile app combining **arXiv Sanity** paper discovery with **NotebookLM**-style AI-powered paper analysis. Uses **Cactus** for on-device AI inference.

## Features

### 📰 Smart Paper Feed
- Personalized paper recommendations based on your interests
- arXiv category and topic-based filtering
- SVM-powered recommendations using paper embeddings

### 🔍 Search & Discovery
- Full-text search across arXiv papers
- Semantic search using on-device embeddings
- Browse by category (cs.LG, cs.CV, cs.CL, etc.)

### 💬 AI Paper Assistant (Cactus-Powered)
- Chat with AI about any paper
- Get instant summaries and explanations
- Ask questions about methodology, results, implications
- **100% on-device** - works offline, private by design

### 📚 Personal Library
- Save papers to your library
- Add notes and annotations
- Track reading progress

### 🎯 Interest-Based Recommendations
- Add topics and arXiv categories
- Get daily recommendations matching your interests
- Notification digest of new relevant papers

## Tech Stack

- **React Native** + **Expo** - Cross-platform mobile development
- **Cactus React Native** - On-device LLM inference
- **Zustand** - State management
- **React Navigation** - Native navigation
- **TypeScript** - Type safety

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
npm start
```

### Running the App

```bash
# iOS
npm run ios

# Android
npm run android
```

## Cactus Integration

PaperPocket uses Cactus for on-device AI capabilities:

### Model Download
The AI model (~600MB) downloads once on first use. After download, all AI features work **completely offline**.

### Features Using Cactus

1. **Paper Chat** - Conversational Q&A about papers
2. **Summarization** - Generate paper summaries
3. **Embeddings** - Semantic paper similarity for recommendations

### Configuration

```typescript
// src/hooks/useCactusAI.ts

// Model configuration
const cactusLM = new CactusLM({
  model: 'qwen3-0.6',  // Lightweight model for mobile
  contextSize: 4096,   // Adjust based on device capability
});

// Generate completions
const result = await cactusLM.complete({
  messages: [...],
  options: {
    temperature: 0.7,
    maxTokens: 512,
  },
  onToken: (token) => {
    // Handle streaming tokens
  },
});
```

## Project Structure

```
app/
├── App.tsx                 # Root component
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── PaperCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── InterestChip.tsx
│   │   └── ...
│   ├── screens/            # App screens
│   │   ├── DashboardScreen.tsx
│   │   ├── AIChatScreen.tsx
│   │   ├── PaperDetailsScreen.tsx
│   │   └── ...
│   ├── hooks/              # Custom hooks
│   │   └── useCactusAI.ts  # Cactus integration
│   ├── store/              # State management
│   │   └── useAppStore.ts
│   ├── navigation/         # Navigation config
│   │   └── index.tsx
│   ├── theme/              # Design tokens
│   │   └── index.ts
│   └── types/              # TypeScript types
│       └── index.ts
└── package.json
```

## Screens

| Screen | Description |
|--------|-------------|
| Dashboard | Main feed with recommendations and agent activity |
| Search | Search arXiv papers by keyword |
| Library | Saved papers and reading list |
| Settings | App configuration and AI model management |
| Paper Details | Full paper view with abstract, related papers, notes |
| AI Chat | Chat with AI about a specific paper |
| Add Interest | Manage topics and categories for recommendations |

## Design System

The app follows a clean, modern design inspired by iOS Human Interface Guidelines:

- **Colors**: Primary blue (#137fec), Accent orange (#ff9500)
- **Typography**: Inter font family
- **Dark Mode**: Full support with automatic system detection
- **Spacing**: 4px base unit system

## Future Roadmap

- [ ] arXiv API integration for real-time paper fetching
- [ ] Push notifications for new papers
- [ ] PDF viewer with in-app reading
- [ ] Highlighting and annotation sync
- [ ] Export notes to Markdown/Notion
- [ ] Multi-model support (larger models for capable devices)
- [ ] Paper citation graph visualization

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [Cactus](https://cactuscompute.com) for on-device AI inference
- [arXiv](https://arxiv.org) for open access papers
- [arXiv Sanity](https://arxiv-sanity-lite.com) for recommendation inspiration

