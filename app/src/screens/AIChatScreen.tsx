import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../theme';
import type { RootStackParamList, ChatMessage } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useCactusAI } from '../hooks/useCactusAI';

type AIChatRouteProp = RouteProp<RootStackParamList, 'AIChat'>;

const SUGGESTED_PROMPTS = [
  'Summarize the key findings',
  'Explain the methodology',
  'What are the limitations?',
  'How does this compare to prior work?',
  'What are the practical applications?',
];

export default function AIChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<AIChatRouteProp>();
  const scrollViewRef = useRef<ScrollView>(null);

  const { getPaperById, getChatSession, addMessageToSession, updateLastMessage } = useAppStore();

  const {
    isDownloaded,
    isDownloading,
    downloadProgress,
    isGenerating,
    completion,
    error: aiError,
    downloadModel,
    chatAboutPaper,
    summarizePaper,
    stopGeneration,
  } = useCactusAI();

  const [inputText, setInputText] = useState('');
  const [hasInitialSummary, setHasInitialSummary] = useState(false);

  // Find paper
  const paper = getPaperById(route.params.paperId);

  // Get chat session
  const session = getChatSession(route.params.paperId);
  const messages = session?.messages || [];

  // Initialize chat with welcome message
  useEffect(() => {
    if (paper && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm ready to help you understand **"${paper.title}"**.\n\nI can explain concepts, summarize sections, discuss methodology, or answer any questions about this paper.\n\nWhat would you like to know?`,
        timestamp: new Date().toISOString(),
      };
      addMessageToSession(paper.id, welcomeMessage);
    }
  }, [paper?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length, completion]);

  // Generate initial summary when model is ready
  useEffect(() => {
    if (paper && isDownloaded && !hasInitialSummary && messages.length <= 1) {
      generateInitialSummary();
    }
  }, [isDownloaded, paper?.id, hasInitialSummary]);

  const generateInitialSummary = async () => {
    if (!paper || !isDownloaded || isGenerating) return;

    setHasInitialSummary(true);

    // Add thinking indicator
    const thinkingMsg: ChatMessage = {
      id: `summary-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };
    await addMessageToSession(paper.id, thinkingMsg);

    try {
      const result = await summarizePaper(paper);
      updateLastMessage(paper.id, `📝 **Quick Summary:**\n\n${result.response}`);
    } catch (err) {
      updateLastMessage(
        paper.id,
        "I'm ready to help you understand this paper. Feel free to ask any questions!"
      );
    }
  };

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !paper || isGenerating || !isDownloaded) return;

    const userMessage = inputText.trim();
    setInputText('');

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    await addMessageToSession(paper.id, userMsg);

    // Add placeholder for AI response
    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };
    await addMessageToSession(paper.id, aiMsg);

    try {
      // Get recent messages for context (limit to last 10 for performance)
      const recentMessages = messages.slice(-10);

      const result = await chatAboutPaper(
        paper,
        userMessage,
        recentMessages,
        (token) => {
          // Streaming is handled by the completion state
        }
      );

      // Update with final response
      updateLastMessage(paper.id, result.response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Sorry, I encountered an error. Please try again.';
      updateLastMessage(paper.id, `⚠️ ${errorMessage}`);
    }
  }, [inputText, paper, isGenerating, isDownloaded, messages, chatAboutPaper, addMessageToSession, updateLastMessage]);

  const handleSuggestedPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  const handleStop = useCallback(() => {
    stopGeneration();
  }, [stopGeneration]);

  if (!paper) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDark ? colors.textPrimaryDark : colors.textPrimaryLight}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundContainer}>
          <Ionicons name="document-outline" size={64} color={colors.textTertiaryLight} />
          <Text style={[styles.notFoundText, isDark && styles.notFoundTextDark]}>
            Paper not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }, isDark && styles.headerDark]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={isDark ? colors.textPrimaryDark : colors.textPrimaryLight}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>AI Assistant</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={isDark ? colors.textPrimaryDark : colors.textPrimaryLight}
          />
        </TouchableOpacity>
      </View>

      {/* Paper Context */}
      <View style={[styles.paperContext, isDark && styles.paperContextDark]}>
        <Text style={[styles.paperTitle, isDark && styles.paperTitleDark]} numberOfLines={2}>
          {paper.title}
        </Text>
        <Text style={[styles.paperMeta, isDark && styles.paperMetaDark]}>
          {paper.authors.slice(0, 2).join(', ')}
          {paper.authors.length > 2 ? ' et al.' : ''} • {paper.categories[0]}
        </Text>
      </View>

      {/* Model Download Banner */}
      {!isDownloaded && (
        <View style={[styles.downloadBanner, isDark && styles.downloadBannerDark]}>
          <Ionicons name="hardware-chip" size={24} color={colors.accent} />
          <View style={styles.downloadBannerContent}>
            <Text style={[styles.downloadTitle, isDark && styles.downloadTitleDark]}>
              {isDownloading ? 'Downloading AI Model...' : 'Download AI Model'}
            </Text>
            <Text style={[styles.downloadSubtitle, isDark && styles.downloadSubtitleDark]}>
              {isDownloading
                ? `${Math.round(downloadProgress * 100)}% complete`
                : 'Required for chat (~600MB, runs offline)'}
            </Text>
            {isDownloading && (
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${downloadProgress * 100}%` }]} />
              </View>
            )}
          </View>
          {!isDownloading && (
            <TouchableOpacity style={styles.downloadButton} onPress={downloadModel}>
              <Ionicons name="download" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.role === 'user' ? styles.userMessageRow : styles.aiMessageRow,
            ]}
          >
            {message.role === 'assistant' && (
              <View style={[styles.avatarContainer, isDark && styles.avatarContainerDark]}>
                <Ionicons name="sparkles" size={16} color={colors.primary} />
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                message.role === 'user'
                  ? styles.userBubble
                  : [styles.aiBubble, isDark && styles.aiBubbleDark],
              ]}
            >
              {message.content ? (
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'user'
                      ? styles.userMessageText
                      : [styles.aiMessageText, isDark && styles.aiMessageTextDark],
                  ]}
                >
                  {message.content}
                </Text>
              ) : message.isStreaming ? (
                <View style={styles.typingIndicator}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.typingText, isDark && styles.typingTextDark]}>
                    Thinking...
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ))}

        {/* Streaming response */}
        {isGenerating && completion && (
          <View style={[styles.messageRow, styles.aiMessageRow]}>
            <View style={[styles.avatarContainer, isDark && styles.avatarContainerDark]}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
            </View>
            <View style={[styles.messageBubble, styles.aiBubble, isDark && styles.aiBubbleDark]}>
              <Text
                style={[styles.messageText, styles.aiMessageText, isDark && styles.aiMessageTextDark]}
              >
                {completion}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
        {/* Suggested Prompts */}
        {messages.length <= 2 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestedContainer}
          >
            {SUGGESTED_PROMPTS.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                style={[styles.suggestedChip, isDark && styles.suggestedChipDark]}
                onPress={() => handleSuggestedPrompt(prompt)}
              >
                <Text style={[styles.suggestedText, isDark && styles.suggestedTextDark]}>
                  {prompt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Text Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.textInput, isDark && styles.textInputDark]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={isDownloaded ? 'Ask about this paper...' : 'Download model to chat...'}
            placeholderTextColor={isDark ? colors.textTertiaryDark : colors.textTertiaryLight}
            multiline
            maxLength={2000}
            editable={isDownloaded && !isGenerating}
            onSubmitEditing={handleSend}
          />
          {isGenerating ? (
            <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
              <Ionicons name="stop" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || !isDownloaded) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || !isDownloaded}
            >
              <Ionicons name="arrow-up" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Safe area padding */}
      <View
        style={{
          height: insets.bottom,
          backgroundColor: isDark ? colors.backgroundDark : colors.backgroundLight,
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerLight,
  },
  headerDark: {
    borderBottomColor: colors.dividerDark,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimaryLight,
  },
  headerTitleDark: {
    color: colors.textPrimaryDark,
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  paperContext: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerLight,
  },
  paperContextDark: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderBottomColor: colors.dividerDark,
  },
  paperTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.textPrimaryLight,
    marginBottom: spacing.xs,
  },
  paperTitleDark: {
    color: colors.textPrimaryDark,
  },
  paperMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
  },
  paperMetaDark: {
    color: colors.textSecondaryDark,
  },
  downloadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.cardLight,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  downloadBannerDark: {
    backgroundColor: colors.cardDark,
  },
  downloadBannerContent: {
    flex: 1,
  },
  downloadTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimaryLight,
  },
  downloadTitleDark: {
    color: colors.textPrimaryDark,
  },
  downloadSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondaryLight,
    marginTop: 2,
  },
  downloadSubtitleDark: {
    color: colors.textSecondaryDark,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.dividerLight,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainerDark: {
    backgroundColor: colors.primaryDark,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.cardLight,
    borderBottomLeftRadius: 4,
  },
  aiBubbleDark: {
    backgroundColor: colors.cardDarkAlt,
  },
  messageText: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: colors.textPrimaryLight,
  },
  aiMessageTextDark: {
    color: colors.textPrimaryDark,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  typingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
  },
  typingTextDark: {
    color: colors.textSecondaryDark,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.dividerLight,
    backgroundColor: colors.backgroundLight,
  },
  inputContainerDark: {
    borderTopColor: colors.dividerDark,
    backgroundColor: colors.backgroundDark,
  },
  suggestedContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  suggestedChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.dividerLight,
    marginRight: spacing.sm,
  },
  suggestedChipDark: {
    borderColor: colors.dividerDark,
  },
  suggestedText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
    color: colors.textSecondaryLight,
  },
  suggestedTextDark: {
    color: colors.textSecondaryDark,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.dividerLight,
    backgroundColor: colors.cardLight,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimaryLight,
  },
  textInputDark: {
    borderColor: colors.dividerDark,
    backgroundColor: colors.cardDarkAlt,
    color: colors.textPrimaryDark,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  notFoundText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondaryLight,
  },
  notFoundTextDark: {
    color: colors.textSecondaryDark,
  },
});
