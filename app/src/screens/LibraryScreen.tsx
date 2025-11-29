import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { colors, spacing, typography, borderRadius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { PaperCard, SearchBar } from '../components';
import type { Paper } from '../types';

type SortOption = 'recent' | 'title' | 'date';

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const { libraryPapers, loadLibrary, removeFromLibrary } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Reload library when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadLibrary();
    }, [loadLibrary])
  );

  const filteredPapers = libraryPapers.filter(
    (paper) =>
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      paper.categories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedPapers = [...filteredPapers].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'date':
        return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
      default:
        return 0; // Keep original order (most recently added)
    }
  });

  const handleRemovePaper = useCallback(
    (paper: Paper) => {
      Alert.alert(
        'Remove from Library',
        `Remove "${paper.title}" from your library?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => removeFromLibrary(paper.id),
          },
        ]
      );
    },
    [removeFromLibrary]
  );

  const renderItem = useCallback(
    ({ item }: { item: Paper }) => (
      <View style={styles.cardWrapper}>
        <PaperCard paper={item} variant="compact" />
      </View>
    ),
    []
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="library-outline"
        size={64}
        color={isDark ? colors.textTertiaryDark : colors.textTertiaryLight}
      />
      <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
        Your Library is Empty
      </Text>
      <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
        Save papers from your feed or search results to build your personal research library
      </Text>
    </View>
  );

  const renderHeader = () => {
    if (libraryPapers.length === 0) return null;

    return (
      <View style={styles.filtersContainer}>
        <View style={styles.sortButtons}>
          {(['recent', 'title', 'date'] as SortOption[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.sortButton,
                isDark && styles.sortButtonDark,
                sortBy === option && styles.sortButtonActive,
              ]}
              onPress={() => setSortBy(option)}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  isDark && styles.sortButtonTextDark,
                  sortBy === option && styles.sortButtonTextActive,
                ]}
              >
                {option === 'recent' ? 'Recent' : option === 'title' ? 'A-Z' : 'Date'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.paperCount, isDark && styles.paperCountDark]}>
          {sortedPapers.length} paper{sortedPapers.length !== 1 ? 's' : ''}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
          Library
        </Text>
        {libraryPapers.length > 0 && (
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search your library..."
          />
        )}
      </View>

      {/* Papers List */}
      <FlatList
        data={sortedPapers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
          libraryPapers.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
      />
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerLight,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '700',
    color: colors.textPrimaryLight,
    letterSpacing: -1,
  },
  headerTitleDark: {
    color: colors.textPrimaryDark,
  },
  listContent: {
    paddingTop: spacing.md,
  },
  emptyListContent: {
    flex: 1,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sortButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.cardLight,
  },
  sortButtonDark: {
    backgroundColor: colors.cardDarkAlt,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
  },
  sortButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondaryLight,
  },
  sortButtonTextDark: {
    color: colors.textSecondaryDark,
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  paperCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
  },
  paperCountDark: {
    color: colors.textSecondaryDark,
  },
  cardWrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimaryLight,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyTitleDark: {
    color: colors.textPrimaryDark,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondaryLight,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * 1.5,
  },
  emptyTextDark: {
    color: colors.textSecondaryDark,
  },
});
