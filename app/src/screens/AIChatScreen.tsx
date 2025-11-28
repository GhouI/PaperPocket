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
  Image,
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
  'Key Contributions?',
  'Limitations?',
  'Compare to other work',
  'Explain the abstract',
];

export default function AIChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<AIChatRouteProp>();
  const scrollViewRef = useRef<ScrollView>(null);

  const { recommendedPapers, libraryPapers, chatSessions, addMessageToSession, updateLastMessage } =
    useAppStore();

  const {
    isModelDownloaded,
    isGenerating,
    currentResponse,
    chatAboutPaper,
    summarizePaper,
    downloadModel,
    isModelLoading,
    modelDownloadProgress,
  } = useCactusAI();

  const [inputText, setInputText] = useState('');

  // Find paper
  const paper = [...recommendedPapers, ...libraryPapers].find(
    (p) => p.id === route.params.paperId
  );

  // Get or initialize chat session
  const session = chatSessions[route.params.paperId];
  const messages = session?.messages || [];

  // Initialize with welcome message
  useEffect(() => {
    if (paper && !session) {
      addMessageToSession(paper.id, {
        id: 'welcome',
        role: 'assistant',
        content:
          "Hello! I've read this paper. I can help you understand it better. What would you like to know?",
        timestamp: new Date().toISOString(),
      });

      // Generate initial summary if model is ready
      if (isModelDownloaded) {
        generateSummary();
      }
    }
  }, [paper, session, isModelDownloaded]);

  // Auto-scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, currentResponse]);

  const generateSummary = async () => {
    if (!paper) return;

    try {
      const result = await summarizePaper(paper);
      addMessageToSession(paper.id, {
        id: `summary-${Date.now()}`,
        role: 'assistant',
        content: `**Summary:**\n${result.response}`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to generate summary:', err);
    }
  };

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !paper || isGenerating) return;

    const userMessage = inputText.trim();
    setInputText('');

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    addMessageToSession(paper.id, userMsg);

    // Add placeholder for AI response
    const aiMsgId = `ai-${Date.now()}`;
    addMessageToSession(paper.id, {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    });

    try {
      const result = await chatAboutPaper(
        paper,
        userMessage,
        messages.filter((m) => m.role !== 'system'),
        (token) => {
          // Update the last message with streaming content
          updateLastMessage(paper.id, currentResponse + token);
        }
      );

      // Update with final response
      updateLastMessage(paper.id, result.response);
    } catch (err) {
      updateLastMessage(paper.id, 'Sorry, I encountered an error. Please try again.');
    }
  }, [inputText, paper, isGenerating, messages, chatAboutPaper, addMessageToSession, updateLastMessage]);

  const handleSuggestedPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  if (!paper) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={isDark ? colors.textPrimaryDark : colors.textPrimaryLight} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, isDark && styles.notFoundTextDark]}>Paper not found</Text>
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
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={isDark ? colors.textPrimaryDark : colors.textPrimaryLight} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>AI Chat</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={isDark ? colors.textPrimaryDark : colors.textPrimaryLight} />
        </TouchableOpacity>
      </View>

      {/* Paper Context */}
      <View style={[styles.paperContext, isDark && styles.paperContextDark]}>
        <Text style={[styles.paperTitle, isDark && styles.paperTitleDark]} numberOfLines={2}>
          {paper.title}
        </Text>
        <Text style={[styles.paperMeta, isDark && styles.paperMetaDark]}>
          {paper.authors.slice(0, 2).join(', ')}
          {paper.authors.length > 2 ? ' et al.' : ''}, {new Date(paper.publishedDate).getFullYear()}
        </Text>
      </View>

      {/* Model Download Prompt */}
      {!isModelDownloaded && (
        <View style={[styles.downloadBanner, isDark && styles.downloadBannerDark]}>
          <Ionicons name="hardware-chip" size={24} color={colors.accent} />
          <View style={styles.downloadBannerText}>
            <Text style={[styles.downloadTitle, isDark && styles.downloadTitleDark]}>
              {isModelLoading ? 'Downloading AI Model...' : 'Enable On-Device AI'}
            </Text>
            <Text style={[styles.downloadSubtitle, isDark && styles.downloadSubtitleDark]}>
              {isModelLoading
                ? `${Math.round(modelDownloadProgress * 100)}%`
                : 'Required for chat functionality'}
            </Text>
          </View>
          {!isModelLoading && (
            <TouchableOpacity style={styles.downloadButton} onPress={downloadModel}>
              <Text style={styles.downloadButtonText}>Download</Text>
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
        {messages.map((message, index) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.role === 'user' ? styles.userMessageRow : styles.aiMessageRow,
            ]}
          >
            {message.role === 'assistant' && (
              <View style={styles.avatarContainer}>
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
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              ) : null}
            </View>
          </View>
        ))}

        {/* Streaming response */}
        {isGenerating && currentResponse && (
          <View style={[styles.messageRow, styles.aiMessageRow]}>
            <View style={styles.avatarContainer}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
            </View>
            <View style={[styles.messageBubble, styles.aiBubble, isDark && styles.aiBubbleDark]}>
              <Text style={[styles.messageText, styles.aiMessageText, isDark && styles.aiMessageTextDark]}>
                {currentResponse}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
        {/* Suggested Prompts */}
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

        {/* Text Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.textInput, isDark && styles.textInputDark]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about this paper..."
            placeholderTextColor={isDark ? colors.textTertiaryDark : colors.textTertiaryLight}
            multiline
            maxLength={1000}
            editable={isModelDownloaded}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isGenerating || !isModelDownloaded) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isGenerating || !isModelDownloaded}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="arrow-up" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Safe area padding */}
      <View style={{ height: insets.bottom, backgroundColor: isDark ? colors.backgroundDark : colors.backgroundLight }} />
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
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
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  paperContextDark: {
    backgroundColor: 'rgba(255,255,255,0.03)',
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
  downloadBannerText: {
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
  },
  downloadSubtitleDark: {
    color: colors.textSecondaryDark,
  },
  downloadButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
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
    gap: 4,
    paddingVertical: spacing.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textTertiaryLight,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.6,
  },
  typingDot3: {
    opacity: 0.8,
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
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  suggestedChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.dividerLight,
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
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
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
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: typography.fontSize.lg,
    color: colors.textSecondaryLight,
  },
  notFoundTextDark: {
    color: colors.textSecondaryDark,
  },
});

