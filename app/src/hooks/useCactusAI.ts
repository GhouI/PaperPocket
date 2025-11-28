import { useState, useCallback, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { ChatMessage, Paper } from '../types';

// Mock Cactus types for development (replace with actual imports in production)
// import { CactusLM, useCactusLM, type Message } from 'cactus-react-native';

interface CactusMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

interface CompletionResult {
  response: string;
  tokensPerSecond: number;
  totalTimeMs: number;
}

interface EmbeddingResult {
  embedding: number[];
}

// This hook provides AI capabilities using Cactus for on-device inference
export function useCactusAI() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);
  
  const {
    isModelDownloaded,
    isModelLoading,
    modelDownloadProgress,
    setModelDownloaded,
    setModelLoading,
    setModelDownloadProgress,
    settings,
  } = useAppStore();

  // In production, this would be the actual CactusLM instance
  // const cactusLMRef = useRef<CactusLM | null>(null);

  const downloadModel = useCallback(async () => {
    if (isModelDownloaded || isModelLoading) return;
    
    setModelLoading(true);
    setError(null);
    
    try {
      // Simulated download for development
      // In production, use:
      // const cactusLM = new CactusLM({ model: settings.modelSlug });
      // await cactusLM.download({
      //   onProgress: (progress) => setModelDownloadProgress(progress)
      // });
      // await cactusLM.init();
      // cactusLMRef.current = cactusLM;
      
      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setModelDownloadProgress(i / 100);
      }
      
      setModelDownloaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download model');
    } finally {
      setModelLoading(false);
    }
  }, [isModelDownloaded, isModelLoading, settings.modelSlug]);

  const generateCompletion = useCallback(
    async (
      messages: CactusMessage[],
      options?: CompletionOptions,
      onToken?: (token: string) => void
    ): Promise<CompletionResult> => {
      if (!isModelDownloaded) {
        throw new Error('Model not downloaded');
      }
      
      setIsGenerating(true);
      setCurrentResponse('');
      setError(null);
      abortRef.current = false;
      
      try {
        // In production, use actual Cactus completion:
        // const result = await cactusLMRef.current?.complete({
        //   messages,
        //   options: {
        //     temperature: options?.temperature ?? 0.7,
        //     maxTokens: options?.maxTokens ?? 512,
        //     topP: options?.topP ?? 0.9,
        //     topK: options?.topK ?? 40,
        //   },
        //   onToken: (token) => {
        //     if (abortRef.current) return;
        //     setCurrentResponse((prev) => prev + token);
        //     onToken?.(token);
        //   },
        // });
        
        // Simulated response for development
        const mockResponses: Record<string, string> = {
          default: `Based on my analysis of this paper, here are the key points:

**Main Contribution:**
The paper introduces a novel architecture that significantly improves upon existing methods in the field.

**Methodology:**
The authors propose a new approach that combines attention mechanisms with efficient computation strategies.

**Results:**
The experimental results demonstrate state-of-the-art performance on standard benchmarks.

**Implications:**
This work opens up new possibilities for applying these techniques to real-world applications.`,
          methodology: `Let me explain the methodology in simpler terms:

**The Core Idea:**
Instead of processing information sequentially (one piece at a time), the Transformer looks at all parts of the input simultaneously using "attention."

**How Attention Works:**
Think of it like reading a sentence where you can instantly see how each word relates to every other word, rather than reading left-to-right.

**Key Components:**
1. **Self-Attention**: Each word "asks" all other words how relevant they are
2. **Multi-Head Attention**: Multiple attention patterns are learned in parallel
3. **Feed-Forward Networks**: Process the attended information

**Why It Works:**
This parallel processing is much faster than sequential methods and captures long-range dependencies better.`,
        };
        
        const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || '';
        const response = lastUserMessage.includes('methodology') || lastUserMessage.includes('simple')
          ? mockResponses.methodology
          : mockResponses.default;
        
        // Simulate streaming
        const words = response.split(' ');
        let accumulated = '';
        
        for (const word of words) {
          if (abortRef.current) break;
          await new Promise((resolve) => setTimeout(resolve, 30));
          accumulated += (accumulated ? ' ' : '') + word;
          setCurrentResponse(accumulated);
          onToken?.(word + ' ');
        }
        
        return {
          response: accumulated,
          tokensPerSecond: 25.5,
          totalTimeMs: words.length * 30,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Generation failed';
        setError(errorMessage);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [isModelDownloaded]
  );

  const generateEmbedding = useCallback(
    async (text: string): Promise<EmbeddingResult> => {
      if (!isModelDownloaded) {
        throw new Error('Model not downloaded');
      }
      
      // In production, use actual Cactus embedding:
      // return await cactusLMRef.current?.embed({ text });
      
      // Simulated embedding for development
      const embedding = Array.from({ length: 384 }, () => Math.random() * 2 - 1);
      return { embedding };
    },
    [isModelDownloaded]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current = true;
    // In production: await cactusLMRef.current?.stop();
  }, []);

  const chatAboutPaper = useCallback(
    async (
      paper: Paper,
      userMessage: string,
      chatHistory: ChatMessage[],
      onToken?: (token: string) => void
    ): Promise<CompletionResult> => {
      const systemPrompt = `You are a helpful AI research assistant analyzing the paper "${paper.title}" by ${paper.authors.join(', ')}.

Paper Abstract:
${paper.abstract}

Your role is to help the user understand this paper by:
- Explaining concepts in clear, accessible language
- Highlighting key contributions and methodology
- Discussing limitations and implications
- Comparing to related work when relevant

Be concise but thorough. Use markdown formatting for clarity.`;

      const messages: CactusMessage[] = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: userMessage },
      ];

      return generateCompletion(messages, { maxTokens: 1024 }, onToken);
    },
    [generateCompletion]
  );

  const summarizePaper = useCallback(
    async (paper: Paper, onToken?: (token: string) => void): Promise<CompletionResult> => {
      const messages: CactusMessage[] = [
        {
          role: 'system',
          content: 'You are a research paper summarization assistant. Provide clear, concise summaries.',
        },
        {
          role: 'user',
          content: `Please provide a concise summary of this paper:

Title: ${paper.title}
Authors: ${paper.authors.join(', ')}

Abstract:
${paper.abstract}

Provide a 2-3 sentence summary highlighting the main contribution and key findings.`,
        },
      ];

      return generateCompletion(messages, { maxTokens: 256 }, onToken);
    },
    [generateCompletion]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // In production: cactusLMRef.current?.destroy();
    };
  }, []);

  return {
    // State
    isModelDownloaded,
    isModelLoading,
    modelDownloadProgress,
    isGenerating,
    currentResponse,
    error,
    
    // Actions
    downloadModel,
    generateCompletion,
    generateEmbedding,
    stopGeneration,
    chatAboutPaper,
    summarizePaper,
  };
}

// Hook for paper recommendations using embeddings
export function usePaperRecommendations() {
  const { interests, recommendedPapers, setRecommendedPapers } = useAppStore();
  const { generateEmbedding, isModelDownloaded } = useCactusAI();
  const [isLoading, setIsLoading] = useState(false);

  const computeSimilarity = (a: number[], b: number[]): number => {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magA * magB);
  };

  const refreshRecommendations = useCallback(async () => {
    if (!isModelDownloaded || interests.length === 0) return;
    
    setIsLoading(true);
    
    try {
      // In production, this would:
      // 1. Fetch recent papers from arXiv API
      // 2. Generate embeddings for paper abstracts
      // 3. Generate embeddings for user interests
      // 4. Compute similarity scores
      // 5. Rank and filter papers
      
      // For now, return mock data with simulated scores
      const mockPapers: Paper[] = [
        {
          id: '1',
          arxivId: '1706.03762',
          title: 'Attention Is All You Need',
          authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
          abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
          categories: ['cs.CL', 'cs.LG'],
          publishedDate: '2017-06-12',
          updatedDate: '2017-06-12',
          pdfUrl: 'https://arxiv.org/pdf/1706.03762',
          arxivUrl: 'https://arxiv.org/abs/1706.03762',
          matchedInterest: 'Transformers',
          similarityScore: 0.95,
        },
        {
          id: '2',
          arxivId: '2010.11929',
          title: 'An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale',
          authors: ['Alexey Dosovitskiy', 'Lucas Beyer', 'Alexander Kolesnikov', 'Dirk Weissenborn', 'Xiaohua Zhai', 'Thomas Unterthiner', 'Mostafa Dehghani', 'Matthias Minderer', 'Georg Heigold', 'Sylvain Gelly', 'Jakob Uszkoreit', 'Neil Houlsby'],
          abstract: 'While the Transformer architecture has become the de-facto standard for natural language processing tasks, its applications to computer vision remain limited. In vision, attention is either applied in conjunction with convolutional networks, or used to replace certain components of convolutional networks.',
          categories: ['cs.CV', 'cs.LG'],
          publishedDate: '2020-10-22',
          updatedDate: '2020-10-22',
          pdfUrl: 'https://arxiv.org/pdf/2010.11929',
          arxivUrl: 'https://arxiv.org/abs/2010.11929',
          matchedInterest: 'Deep Learning',
          similarityScore: 0.89,
        },
        {
          id: '3',
          arxivId: '2303.08774',
          title: 'GPT-4 Technical Report',
          authors: ['OpenAI'],
          abstract: 'We report the development of GPT-4, a large-scale, multimodal model which can accept image and text inputs and produce text outputs. While less capable than humans in many real-world scenarios, GPT-4 exhibits human-level performance on various professional and academic benchmarks.',
          categories: ['cs.CL', 'cs.AI'],
          publishedDate: '2023-03-15',
          updatedDate: '2023-03-15',
          pdfUrl: 'https://arxiv.org/pdf/2303.08774',
          arxivUrl: 'https://arxiv.org/abs/2303.08774',
          matchedInterest: 'NLP',
          similarityScore: 0.87,
        },
      ];
      
      setRecommendedPapers(mockPapers);
    } catch (err) {
      console.error('Failed to refresh recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isModelDownloaded, interests, generateEmbedding, setRecommendedPapers]);

  return {
    papers: recommendedPapers,
    isLoading,
    refreshRecommendations,
  };
}

