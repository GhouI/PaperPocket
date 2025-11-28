import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import type { Paper, RootStackParamList } from '../types';
import { useAppStore } from '../store/useAppStore';

interface PaperCardProps {
  paper: Paper;
  variant?: 'full' | 'compact';
}

export default function PaperCard({ paper, variant = 'full' }: PaperCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { libraryPapers, addToLibrary, removeFromLibrary } = useAppStore();

  const isInLibrary = libraryPapers.some((p) => p.id === paper.id);

  const handlePress = () => {
    navigation.navigate('PaperDetails', { paperId: paper.id });
  };

  const handleBookmark = () => {
    if (isInLibrary) {
      removeFromLibrary(paper.id);
    } else {
      addToLibrary(paper);
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  const handleViewPDF = () => {
    // TODO: Open PDF viewer or browser
  };

  // Generate a gradient background based on paper categories
  const getGradientImage = () => {
    const categoryImages: Record<string, string> = {
      'cs.LG': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop',
      'cs.CV': 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=400&fit=crop',
      'cs.CL': 'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=800&h=400&fit=crop',
      'cs.AI': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    };
    const category = paper.categories[0] || 'cs.LG';
    return categoryImages[category] || categoryImages['cs.LG'];
  };

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
            {paper.categories.join(', ')}
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
            {paper.authors.slice(0, 3).join(', ')}
            {paper.authors.length > 3 ? ' et al.' : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={handleBookmark} style={styles.compactBookmark}>
          <Ionicons
            name={isInLibrary ? 'bookmark' : 'bookmark-outline'}
            size={20}
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
        source={{ uri: paper.thumbnailUrl || getGradientImage() }}
        style={styles.headerImage}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Categories */}
        <Text style={[styles.categories, isDark && styles.textSecondaryDark]}>
          {paper.categories.join(', ')}
        </Text>

        {/* Title */}
        <Text style={[styles.title, isDark && styles.textPrimaryDark]}>
          {paper.title}
        </Text>

        {/* Authors & Meta */}
        <View style={styles.meta}>
          <Text style={[styles.authors, isDark && styles.textSecondaryDark]}>
            {paper.authors.slice(0, 3).join(', ')}
            {paper.authors.length > 3 ? ' et al.' : ''} ({new Date(paper.publishedDate).getFullYear()})
          </Text>
          <Text
            style={[styles.abstract, isDark && styles.textSecondaryDark]}
            numberOfLines={2}
          >
            {paper.abstract}{' '}
            {paper.matchedInterest && (
              <Text style={styles.matchedInterest}>
                Because you like '{paper.matchedInterest}'
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
              name={isInLibrary ? 'bookmark' : 'bookmark-outline'}
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
    lineHeight: typography.fontSize.lg * typography.lineHeight.tight,
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
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  matchedInterest: {
    color: colors.primary,
    fontWeight: '600',
    opacity: 0.8,
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
    fontWeight: '500',
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

