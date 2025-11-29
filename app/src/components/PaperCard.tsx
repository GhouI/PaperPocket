import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Image,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import type { Paper, RootStackParamList } from '../types';
import { useAppStore } from '../store/useAppStore';

interface PaperCardProps {
  paper: Paper;
  variant?: 'full' | 'compact';
}

// Category-based placeholder images
const CATEGORY_IMAGES: Record<string, string> = {
  'cs.LG': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop',
  'cs.CV': 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=400&fit=crop',
  'cs.CL': 'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=800&h=400&fit=crop',
  'cs.AI': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
  'cs.NE': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
  'stat.ML': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
  default: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&h=400&fit=crop',
};

export default function PaperCard({ paper, variant = 'full' }: PaperCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isInLibrary, addToLibrary, removeFromLibrary } = useAppStore();

  const inLibrary = isInLibrary(paper.id);

  const handlePress = useCallback(() => {
    navigation.navigate('PaperDetails', { paperId: paper.id });
  }, [paper.id, navigation]);

  const handleBookmark = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (inLibrary) {
      removeFromLibrary(paper.id);
    } else {
      addToLibrary(paper);
    }
  }, [paper, inLibrary, addToLibrary, removeFromLibrary]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        title: paper.title,
        message: `${paper.title}\n\n${paper.arxivUrl}`,
        url: paper.arxivUrl,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [paper]);

  const handleViewPDF = useCallback(() => {
    Linking.openURL(paper.pdfUrl);
  }, [paper.pdfUrl]);

  const getHeaderImage = useCallback(() => {
    if (paper.thumbnailUrl) return paper.thumbnailUrl;
    const category = paper.categories[0] || 'default';
    return CATEGORY_IMAGES[category] || CATEGORY_IMAGES.default;
  }, [paper]);

  const formatAuthors = useCallback(() => {
    const authors = paper.authors;
    if (authors.length <= 2) {
      return authors.join(', ');
    }
    return `${authors.slice(0, 2).join(', ')} et al.`;
  }, [paper.authors]);

  const formatDate = useCallback(() => {
    return new Date(paper.publishedDate).getFullYear();
  }, [paper.publishedDate]);

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, isDark && styles.compactContainerDark]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          <Text
            style={[styles.compactCategories, isDark && styles.textSecondaryDark]}
            numberOfLines={1}
          >
            {paper.categories.slice(0, 2).join(', ')}
          </Text>
          <Text
            style={[styles.compactTitle, isDark && styles.textPrimaryDark]}
            numberOfLines={2}
          >
            {paper.title}
          </Text>
          <Text
            style={[styles.compactAuthors, isDark && styles.textSecondaryDark]}
            numberOfLines={1}
          >
            {formatAuthors()} ({formatDate()})
          </Text>
        </View>
        <TouchableOpacity onPress={handleBookmark} style={styles.compactBookmark}>
          <Ionicons
            name={inLibrary ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, isDark && styles.containerDark]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Header Image */}
      <Image
        source={{ uri: getHeaderImage() }}
        style={styles.headerImage}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Categories */}
        <Text style={[styles.categories, isDark && styles.textSecondaryDark]}>
          {paper.categories.slice(0, 3).join(', ')}
        </Text>

        {/* Title */}
        <Text style={[styles.title, isDark && styles.textPrimaryDark]} numberOfLines={3}>
          {paper.title}
        </Text>

        {/* Authors & Meta */}
        <View style={styles.meta}>
          <Text style={[styles.authors, isDark && styles.textSecondaryDark]}>
            {formatAuthors()} ({formatDate()})
          </Text>
          <Text
            style={[styles.abstract, isDark && styles.textSecondaryDark]}
            numberOfLines={2}
          >
            {paper.abstract}
            {paper.matchedInterest && (
              <Text style={styles.matchedInterest}>
                {' '}• Matches "{paper.matchedInterest}"
              </Text>
            )}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.iconButton, isDark && styles.iconButtonDark]}
            onPress={handleBookmark}
          >
            <Ionicons
              name={inLibrary ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, isDark && styles.iconButtonDark]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.pdfButton} onPress={handleViewPDF}>
            <Text style={styles.pdfButtonText}>View PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardLight,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  containerDark: {
    backgroundColor: colors.cardDark,
  },
  headerImage: {
    width: '100%',
    aspectRatio: 2,
    backgroundColor: colors.dividerLight,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  categories: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimaryLight,
    lineHeight: typography.fontSize.lg * 1.3,
  },
  meta: {
    gap: spacing.sm,
  },
  authors: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
  },
  abstract: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  matchedInterest: {
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonDark: {
    backgroundColor: colors.primaryDark,
  },
  pdfButton: {
    flex: 1,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  pdfButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  textPrimaryDark: {
    color: colors.textPrimaryDark,
  },
  textSecondaryDark: {
    color: colors.textSecondaryDark,
  },
  // Compact variant styles
  compactContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  compactContainerDark: {
    backgroundColor: colors.cardDark,
  },
  compactContent: {
    flex: 1,
    gap: spacing.xs,
  },
  compactCategories: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondaryLight,
  },
  compactTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimaryLight,
    lineHeight: typography.fontSize.md * 1.3,
  },
  compactAuthors: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
  },
  compactBookmark: {
    justifyContent: 'center',
    paddingLeft: spacing.md,
  },
});
