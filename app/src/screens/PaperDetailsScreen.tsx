import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import type { RootStackParamList } from '../types';
import { useAppStore } from '../store/useAppStore';

type PaperDetailsRouteProp = RouteProp<RootStackParamList, 'PaperDetails'>;

type TabType = 'abstract' | 'related' | 'notes';

export default function PaperDetailsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<PaperDetailsRouteProp>();

  const { recommendedPapers, libraryPapers, addToLibrary, removeFromLibrary } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('abstract');

  // Find paper from either recommended or library
  const paper = [...recommendedPapers, ...libraryPapers].find(
    (p) => p.id === route.params.paperId
  );

  const isInLibrary = libraryPapers.some((p) => p.id === paper?.id);

  const handleShare = useCallback(() => {
    if (paper) {
      // TODO: Implement share
    }
  }, [paper]);

  const handleBookmark = useCallback(() => {
    if (paper) {
      if (isInLibrary) {
        removeFromLibrary(paper.id);
      } else {
        addToLibrary(paper);
      }
    }
  }, [paper, isInLibrary, addToLibrary, removeFromLibrary]);

  const handleOpenPDF = useCallback(() => {
    if (paper?.pdfUrl) {
      Linking.openURL(paper.pdfUrl);
    }
  }, [paper]);

  const handleAskAI = useCallback(() => {
    if (paper) {
      navigation.navigate('AIChat', { paperId: paper.id });
    }
  }, [paper, navigation]);

  if (!paper) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, isDark && styles.notFoundTextDark]}>
            Paper not found
          </Text>
        </View>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'abstract':
        return (
          <Text style={[styles.abstractText, isDark && styles.abstractTextDark]}>
            {paper.abstract}
          </Text>
        );
      case 'related':
        return (
          <View style={styles.placeholderContent}>
            <Ionicons
              name="documents-outline"
              size={48}
              color={isDark ? colors.textTertiaryDark : colors.textTertiaryLight}
            />
            <Text style={[styles.placeholderText, isDark && styles.placeholderTextDark]}>
              Related papers will appear here
            </Text>
          </View>
        );
      case 'notes':
        return (
          <View style={styles.placeholderContent}>
            <Ionicons
              name="create-outline"
              size={48}
              color={isDark ? colors.textTertiaryDark : colors.textTertiaryLight}
            />
            <Text style={[styles.placeholderText, isDark && styles.placeholderTextDark]}>
              Add notes about this paper
            </Text>
            <TouchableOpacity style={styles.addNoteButton}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addNoteButtonText}>Add Note</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]} numberOfLines={1}>
          Paper Details
        </Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={[styles.title, isDark && styles.titleDark]}>{paper.title}</Text>

        {/* Authors */}
        <Text style={styles.authors}>{paper.authors.join(', ')}</Text>

        {/* Meta */}
        <Text style={[styles.meta, isDark && styles.metaDark]}>
          Published: {new Date(paper.publishedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        {/* Categories/Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsContainer}
        >
          {paper.categories.map((category) => (
            <View key={category} style={[styles.tag, isDark && styles.tagDark]}>
              <Text style={styles.tagText}>{category}</Text>
            </View>
          ))}
          {paper.matchedInterest && (
            <View style={[styles.tag, isDark && styles.tagDark]}>
              <Text style={styles.tagText}>{paper.matchedInterest}</Text>
            </View>
          )}
        </ScrollView>

        {/* Tabs */}
        <View style={[styles.tabsContainer, isDark && styles.tabsContainerDark]}>
          {(['abstract', 'related', 'notes'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  isDark && styles.tabTextDark,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>{renderTabContent()}</View>
      </ScrollView>

      {/* Footer Actions */}
      <View
        style={[
          styles.footer,
          isDark && styles.footerDark,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <TouchableOpacity style={styles.aiButton} onPress={handleAskAI}>
          <Ionicons name="sparkles" size={20} color="#fff" />
          <Text style={styles.aiButtonText}>Ask AI Assistant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pdfButton} onPress={handleOpenPDF}>
          <Ionicons name="document-text" size={20} color="#fff" />
          <Text style={styles.pdfButtonText}>View PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    backgroundColor: 'rgba(246, 247, 248, 0.8)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimaryLight,
    textAlign: 'center',
  },
  headerTitleDark: {
    color: colors.textPrimaryDark,
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimaryLight,
    lineHeight: typography.fontSize.xxl * 1.2,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  titleDark: {
    color: colors.textPrimaryDark,
  },
  authors: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  meta: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
    marginBottom: spacing.lg,
  },
  metaDark: {
    color: colors.textSecondaryDark,
  },
  tagsContainer: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
  },
  tagDark: {
    backgroundColor: colors.primaryDark,
  },
  tagText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerLight,
    marginBottom: spacing.lg,
  },
  tabsContainerDark: {
    borderBottomColor: colors.dividerDark,
  },
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondaryLight,
  },
  tabTextDark: {
    color: colors.textSecondaryDark,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    minHeight: 200,
  },
  abstractText: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.fontSize.md * 1.6,
    color: colors.textPrimaryLight,
  },
  abstractTextDark: {
    color: colors.textPrimaryDark,
  },
  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  placeholderText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondaryLight,
  },
  placeholderTextDark: {
    color: colors.textSecondaryDark,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  addNoteButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: 'rgba(246, 247, 248, 0.9)',
  },
  footerDark: {
    backgroundColor: 'rgba(16, 25, 34, 0.9)',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.accent,
  },
  aiButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: '700',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
  },
  pdfButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: '700',
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

