import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { SearchBar, PaperCard } from '../components';
import type { Paper } from '../types';

const RECENT_SEARCHES = [
  'Large Language Models',
  'Diffusion Models',
  'Vision Transformers',
  'Reinforcement Learning',
  'Neural Architecture Search',
];

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchPapers,
    clearSearch,
  } = useAppStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSearch = useCallback(() => {
    if (localQuery.trim()) {
      searchPapers(localQuery.trim());
    }
  }, [localQuery, searchPapers]);

  const handleClear = useCallback(() => {
    setLocalQuery('');
    clearSearch();
  }, [clearSearch]);

  const handleSuggestionPress = useCallback(
    (suggestion: string) => {
      setLocalQuery(suggestion);
      searchPapers(suggestion);
    },
    [searchPapers]
  );

  const renderItem = useCallback(
    ({ item }: { item: Paper }) => (
      <View style={styles.cardWrapper}>
        <PaperCard paper={item} variant="compact" />
      </View>
    ),
    []
  );

  const renderEmpty = () => {
    if (isSearching) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            Searching arXiv...
          </Text>
        </View>
      );
    }

    if (searchQuery.trim() && searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="search-outline"
            size={64}
            color={isDark ? colors.textTertiaryDark : colors.textTertiaryLight}
          />
          <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
            No results found
          </Text>
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            Try different keywords or check your spelling
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="telescope-outline"
          size={64}
          color={isDark ? colors.textTertiaryDark : colors.textTertiaryLight}
        />
        <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
          Explore Research
        </Text>
        <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
          Search millions of papers on arXiv by title, author, or topic
        </Text>

        <View style={styles.suggestionsContainer}>
          <Text style={[styles.suggestionsTitle, isDark && styles.suggestionsTitleDark]}>
            Popular searches
          </Text>
          {RECENT_SEARCHES.map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              style={[styles.suggestionItem, isDark && styles.suggestionItemDark]}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Ionicons
                name="search"
                size={18}
                color={isDark ? colors.textSecondaryDark : colors.textSecondaryLight}
              />
              <Text style={[styles.suggestionText, isDark && styles.suggestionTextDark]}>
                {suggestion}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={isDark ? colors.textTertiaryDark : colors.textTertiaryLight}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    if (searchResults.length === 0) return null;

    return (
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, isDark && styles.resultsCountDark]}>
          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
          Search
        </Text>
        <SearchBar
          value={localQuery}
          onChangeText={setLocalQuery}
          onSubmit={handleSearch}
          onClear={handleClear}
          placeholder="Search papers, authors, topics..."
        />
      </View>

      {/* Results */}
      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
          searchResults.length === 0 && styles.emptyListContent,
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
  resultsHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  resultsCount: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
  },
  resultsCountDark: {
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
    textAlign: 'center',
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
  suggestionsContainer: {
    width: '100%',
    marginTop: spacing.xxl,
  },
  suggestionsTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondaryLight,
    marginBottom: spacing.md,
  },
  suggestionsTitleDark: {
    color: colors.textSecondaryDark,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cardLight,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  suggestionItemDark: {
    backgroundColor: colors.cardDark,
  },
  suggestionText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimaryLight,
  },
  suggestionTextDark: {
    color: colors.textPrimaryDark,
  },
});
