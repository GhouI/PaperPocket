import { useCallback, useEffect, useRef } from 'react';
import { useCactusLM, type Message, type CactusModel } from 'cactus-react-native';
import type { Paper, ChatMessage } from '../types';
import * as storage from '../services/storage';

// Model selection: qwen3-0.6 is the default lightweight model suitable for mobile
// It supports text completion and is optimized for on-device inference
const DEFAULT_MODEL = 'qwen3-0.6';
const DEFAULT_CONTEXT_SIZE = 4096;

/**
 * Main hook for Cactus AI integration
 * Provides text completion, paper analysis, and embedding capabilities
 */
export function useCactusAI(options?: { model?: string; contextSize?: number }) {
  const { model = DEFAULT_MODEL, contextSize = DEFAULT_CONTEXT_SIZE } = options || {};

  // Use the official useCactusLM hook from the library
  const cactusLM = useCactusLM({
    model,
    contextSize,
  });

  /**
   * Download the AI model if not already downloaded
   */
  const downloadModel = useCallback(async () => {
    if (cactusLM.isDownloaded || cactusLM.isDownloading) return;

    try {
      await cactusLM.download();
    } catch (error) {
      console.error('Error downloading model:', error);
      throw error;
    }
  }, [cactusLM]);

  /**
   * Initialize the model for inference
   */
  const initModel = useCallback(async () => {
    if (!cactusLM.isDownloaded) {
      throw new Error('Model not downloaded');
    }

    try {
      await cactusLM.init();
    } catch (error) {
      console.error('Error initializing model:', error);
      throw error;
    }
  }, [cactusLM]);

  /**
   * Generate a completion with the given messages
   */
  const generateCompletion = useCallback(
    async (
      messages: Message[],
      options?: {
        temperature?: number;
        maxTokens?: number;
        topP?: number;
        topK?: number;
        onToken?: (token: string) => void;
      }
    ) => {
      const { temperature = 0.7, maxTokens = 512, topP = 0.9, topK = 40, onToken } = options || {};

      try {
        const result = await cactusLM.complete({
          messages,
          options: {
            temperature,
            maxTokens,
            topP,
            topK,
          },
          onToken,
          mode: 'local', // Use local inference only
        });

        return result;
      } catch (error) {
        console.error('Error generating completion:', error);
        throw error;
      }
    },
    [cactusLM]
  );

  /**
   * Generate text embeddings for similarity search
   */
  const generateEmbedding = useCallback(
    async (text: string) => {
      try {
        const result = await cactusLM.embed({ text });
        return result;
      } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
      }
    },
    [cactusLM]
  );

  /**
   * Stop any ongoing generation
   */
  const stopGeneration = useCallback(async () => {
    try {
      await cactusLM.stop();
    } catch (error) {
      console.error('Error stopping generation:', error);
    }
  }, [cactusLM]);

  /**
   * Reset the model state
   */
  const resetModel = useCallback(async () => {
    try {
      await cactusLM.reset();
    } catch (error) {
      console.error('Error resetting model:', error);
    }
  }, [cactusLM]);

  /**
   * Get available models
   */
  const getAvailableModels = useCallback(async (): Promise<CactusModel[]> => {
    try {
      return await cactusLM.getModels();
    } catch (error) {
      console.error('Error getting models:', error);
      return [];
    }
  }, [cactusLM]);

  /**
   * Chat about a specific paper
   */
  const chatAboutPaper = useCallback(
    async (
      paper: Paper,
      userMessage: string,
      chatHistory: ChatMessage[] = [],
      onToken?: (token: string) => void
    ) => {
      const systemPrompt = `You are a helpful AI research assistant. You are analyzing the following academic paper:

**Title:** ${paper.title}

**Authors:** ${paper.authors.join(', ')}

**Abstract:**
${paper.abstract}

**Categories:** ${paper.categories.join(', ')}

Your role is to help the user understand this paper by:
- Explaining concepts in clear, accessible language
- Highlighting key contributions and methodology
- Discussing limitations and implications
- Answering questions about the paper's content

Be concise but thorough. Use markdown formatting for clarity when appropriate.`;

      const messages: Message[] = [
        { role: 'system', content: systemPrompt },
        ...chatHistory
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
        { role: 'user', content: userMessage },
      ];

      return generateCompletion(messages, {
        maxTokens: 1024,
        temperature: 0.7,
        onToken,
      });
    },
    [generateCompletion]
  );

  /**
   * Generate a summary of a paper
   */
  const summarizePaper = useCallback(
    async (paper: Paper, onToken?: (token: string) => void) => {
      const messages: Message[] = [
        {
          role: 'system',
          content:
            'You are a research paper summarization assistant. Provide clear, concise summaries that capture the key contributions.',
        },
        {
          role: 'user',
          content: `Please provide a concise summary of this paper in 3-4 sentences:

**Title:** ${paper.title}

**Authors:** ${paper.authors.join(', ')}

**Abstract:**
${paper.abstract}

Focus on: 1) The main problem being addressed, 2) The proposed approach/solution, 3) Key results or findings.`,
        },
      ];

      return generateCompletion(messages, {
        maxTokens: 300,
        temperature: 0.5,
        onToken,
      });
    },
    [generateCompletion]
  );

  /**
   * Generate paper embedding and store it
   */
  const embedAndStorePaper = useCallback(
    async (paper: Paper) => {
      // Create text representation for embedding
      const textToEmbed = `${paper.title}. ${paper.abstract}`;

      try {
        const result = await generateEmbedding(textToEmbed);
        await storage.storePaperEmbedding(paper.id, result.embedding);
        return result.embedding;
      } catch (error) {
        console.error('Error embedding paper:', error);
        throw error;
      }
    },
    [generateEmbedding]
  );

  /**
   * Generate embedding for user interest/query
   */
  const embedQuery = useCallback(
    async (query: string) => {
      try {
        const result = await generateEmbedding(query);
        return result.embedding;
      } catch (error) {
        console.error('Error embedding query:', error);
        throw error;
      }
    },
    [generateEmbedding]
  );

  return {
    // State from useCactusLM hook
    isDownloaded: cactusLM.isDownloaded,
    isDownloading: cactusLM.isDownloading,
    downloadProgress: cactusLM.downloadProgress,
    isInitializing: cactusLM.isInitializing,
    isGenerating: cactusLM.isGenerating,
    completion: cactusLM.completion,
    error: cactusLM.error,

    // Actions
    downloadModel,
    initModel,
    generateCompletion,
    generateEmbedding,
    stopGeneration,
    resetModel,
    getAvailableModels,

    // Paper-specific helpers
    chatAboutPaper,
    summarizePaper,
    embedAndStorePaper,
    embedQuery,
  };
}

/**
 * Compute cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * Hook for paper recommendations using embeddings
 */
export function usePaperRecommendations() {
  const { embedQuery, embedAndStorePaper, isDownloaded, isGenerating } = useCactusAI();

  /**
   * Score papers based on similarity to user interests
   */
  const scorePapers = useCallback(
    async (
      papers: Paper[],
      interests: string[]
    ): Promise<Array<Paper & { score: number; matchedInterest?: string }>> => {
      if (!isDownloaded || interests.length === 0) {
        return papers.map((p) => ({ ...p, score: 0 }));
      }

      try {
        // Get stored embeddings
        const storedEmbeddings = await storage.getEmbeddings();

        // Generate embeddings for interests
        const interestEmbeddings: Array<{ interest: string; embedding: number[] }> = [];
        for (const interest of interests) {
          const embedding = await embedQuery(interest);
          interestEmbeddings.push({ interest, embedding });
        }

        // Score each paper
        const scoredPapers = await Promise.all(
          papers.map(async (paper) => {
            // Get or generate paper embedding
            let paperEmbedding = storedEmbeddings[paper.id]?.embedding;
            if (!paperEmbedding) {
              try {
                paperEmbedding = await embedAndStorePaper(paper);
              } catch {
                return { ...paper, score: 0 };
              }
            }

            // Find best matching interest
            let bestScore = 0;
            let bestInterest: string | undefined;

            for (const { interest, embedding } of interestEmbeddings) {
              const similarity = cosineSimilarity(paperEmbedding, embedding);
              if (similarity > bestScore) {
                bestScore = similarity;
                bestInterest = interest;
              }
            }

            return {
              ...paper,
              score: bestScore,
              matchedInterest: bestInterest,
            };
          })
        );

        // Sort by score descending
        return scoredPapers.sort((a, b) => b.score - a.score);
      } catch (error) {
        console.error('Error scoring papers:', error);
        return papers.map((p) => ({ ...p, score: 0 }));
      }
    },
    [isDownloaded, embedQuery, embedAndStorePaper]
  );

  return {
    scorePapers,
    isReady: isDownloaded && !isGenerating,
  };
}
