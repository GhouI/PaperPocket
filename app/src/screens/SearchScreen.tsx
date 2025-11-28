import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography, borderRadius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { SearchBar, PaperCard } from '../components';
import type { Paper } from '../types';

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const { searchQuery, setSearchQuery, searchResults, setSearchResults } = useAppStore();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Simulated search - in production, this would call arXiv API
    // and use embeddings for semantic search
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockResults: Paper[] = [
      {
        id: 'search-1',
        arxivId: '2312.00752',
        title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
        authors: ['Albert Gu', 'Tri Dao'],
        abstract:
          'Foundation models, now powering most of the exciting applications in deep learning, are almost universally based on the Transformer architecture and its core attention module.',
        categories: ['cs.LG', 'cs.CL'],
        publishedDate: '2023-12-01',
        updatedDate: '2023-12-01',
        pdfUrl: 'https://arxiv.org/pdf/2312.00752',
        arxivUrl: 'https://arxiv.org/abs/2312.00752',
      },
      {
        id: 'search-2',
        arxivId: '2401.04088',
        title: 'Mixtral of Experts',
        authors: ['Mistral AI'],
        abstract:
          'We introduce Mixtral 8x7B, a Sparse Mixture of Experts (SMoE) language model. Mixtral has the same architecture as Mistral 7B, with the difference that each layer is composed of 8 feedforward blocks.',
        categories: ['cs.CL', 'cs.AI'],
        publishedDate: '2024-01-08',
        updatedDate: '2024-01-08',
        pdfUrl: 'https://arxiv.org/pdf/2401.04088',
        arxivUrl: 'https://arxiv.org/abs/2401.04088',
      },
    ];

    setSearchResults(
      mockResults.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.abstract.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setIsSearching(false);
  }, [searchQuery, setSearchResults]);

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
            Searching papers...
          </Text>
        </View>
      );
    }

    if (searchQuery.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
            No results found
          </Text>
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            Try different keywords or browse categories
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
          Search arXiv Papers
        </Text>
        <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
          Find papers by title, authors, or keywords
        </Text>
        <View style={styles.suggestions}>
          <Text style={[styles.suggestionsTitle, isDark && styles.suggestionsTitleDark]}>
            Popular searches:
          </Text>
          {['Large Language Models', 'Diffusion Models', 'Vision Transformers'].map(
            (suggestion) => (
              <Text
                key={suggestion}
                style={styles.suggestionItem}
                onPress={() => setSearchQuery(suggestion)}
              >
                {suggestion}
              </Text>
            )
          )}
        </View>
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
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearch}
          autoFocus
          placeholder="Search papers, authors, topics..."
        />
      </View>

      {/* Results */}
      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
          searchResults.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmpty}
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
    paddingTop: spacing.lg,
  },
  emptyListContent: {
    flex: 1,
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
  },
  emptyTextDark: {
    color: colors.textSecondaryDark,
  },
  suggestions: {
    marginTop: spacing.xxl,
    alignItems: 'center',
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
    fontSize: typography.fontSize.md,
    color: colors.primary,
    paddingVertical: spacing.sm,
  },
});

