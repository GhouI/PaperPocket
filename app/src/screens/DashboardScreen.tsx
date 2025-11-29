import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../theme';
import type { RootStackParamList } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useCactusAI } from '../hooks/useCactusAI';
import {
  SearchBar,
  PaperCard,
  ActionChip,
  AgentActivityCard,
  ModelDownloadBanner,
} from '../components';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    isInitialized,
    initializeApp,
    searchQuery,
    setSearchQuery,
    agentActivities,
    recommendedPapers,
    isLoadingPapers,
    papersError,
    fetchRecommendedPapers,
    interests,
  } = useAppStore();

  const { isDownloaded: isModelDownloaded } = useCactusAI();
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Initialize app on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeApp();
    }
  }, [isInitialized, initializeApp]);

  // Fetch papers when initialized or interests change
  useFocusEffect(
    useCallback(() => {
      if (isInitialized) {
        fetchRecommendedPapers();
      }
    }, [isInitialized, interests.length])
  );

  const handleRefresh = useCallback(() => {
    fetchRecommendedPapers();
  }, [fetchRecommendedPapers]);

  const handleAddInterest = () => {
    navigation.navigate('AddInterest');
  };

  const handleSearch = () => {
    if (localSearchQuery.trim()) {
      setSearchQuery(localSearchQuery);
      // Navigate to search tab - this would typically be handled by tab navigation
    }
  };

  const handleLibrary = () => {
    // Navigate to library tab
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }, isDark && styles.headerDark]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.logoButton}>
            <Ionicons
              name="flask"
              size={28}
              color={isDark ? colors.textPrimaryDark : colors.textPrimaryLight}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            PaperPocket
          </Text>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons
              name="person-circle"
              size={32}
              color={isDark ? colors.textPrimaryDark : colors.textPrimaryLight}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingPapers}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={localSearchQuery}
            onChangeText={setLocalSearchQuery}
            onSubmit={handleSearch}
            placeholder="Search papers, authors, keywords..."
          />
        </View>

        {/* Action Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          <ActionChip
            icon="add-circle"
            label="Add Interest"
            onPress={handleAddInterest}
          />
          <ActionChip
            icon="bookmarks"
            label="My Library"
            onPress={handleLibrary}
          />
        </ScrollView>

        {/* Model Download Banner */}
        {!isModelDownloaded && (
          <View style={styles.section}>
            <ModelDownloadBanner />
          </View>
        )}

        {/* Interests Display */}
        {interests.length > 0 && (
          <View style={styles.interestsSection}>
            <Text style={[styles.interestsLabel, isDark && styles.interestsLabelDark]}>
              Showing papers for:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.interestTags}>
                {interests.slice(0, 5).map((interest) => (
                  <View key={interest.id} style={[styles.interestTag, isDark && styles.interestTagDark]}>
                    <Text style={styles.interestTagText}>{interest.name}</Text>
                  </View>
                ))}
                {interests.length > 5 && (
                  <Text style={[styles.moreInterests, isDark && styles.moreInterestsDark]}>
                    +{interests.length - 5} more
                  </Text>
                )}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Error State */}
        {papersError && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={20} color={colors.warning} />
            <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
              {papersError}
            </Text>
          </View>
        )}

        {/* For You Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            For You
          </Text>

          {isLoadingPapers && recommendedPapers.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
                Fetching papers from arXiv...
              </Text>
            </View>
          ) : recommendedPapers.length > 0 ? (
            <PaperCard paper={recommendedPapers[0]} />
          ) : (
            <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
              <Ionicons
                name="newspaper-outline"
                size={48}
                color={isDark ? colors.textTertiaryDark : colors.textTertiaryLight}
              />
              <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                {interests.length === 0
                  ? 'Add interests to get personalized recommendations'
                  : 'No papers found matching your interests'}
              </Text>
              <TouchableOpacity
                style={styles.addInterestButton}
                onPress={handleAddInterest}
              >
                <Text style={styles.addInterestButtonText}>
                  {interests.length === 0 ? 'Add Interests' : 'Edit Interests'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Agent Activity Section */}
        {agentActivities.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Agent Activity
            </Text>
            <AgentActivityCard activities={agentActivities} />
          </View>
        )}

        {/* More Recommendations */}
        {recommendedPapers.length > 1 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              More Papers
            </Text>
            {recommendedPapers.slice(1, 10).map((paper) => (
              <View key={paper.id} style={styles.paperCardWrapper}>
                <PaperCard paper={paper} variant="compact" />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerLight,
  },
  headerDark: {
    backgroundColor: colors.backgroundDark,
    borderBottomColor: colors.dividerDark,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    height: 56,
  },
  logoButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimaryLight,
    letterSpacing: -0.5,
  },
  headerTitleDark: {
    color: colors.textPrimaryDark,
  },
  profileButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  chipsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  interestsSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  interestsLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
    marginBottom: spacing.sm,
  },
  interestsLabelDark: {
    color: colors.textSecondaryDark,
  },
  interestTags: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  interestTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
  },
  interestTagDark: {
    backgroundColor: colors.primaryDark,
  },
  interestTagText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: '500',
  },
  moreInterests: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondaryLight,
    alignSelf: 'center',
    marginLeft: spacing.sm,
  },
  moreInterestsDark: {
    color: colors.textSecondaryDark,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.md,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: borderRadius.lg,
  },
  errorText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
  },
  errorTextDark: {
    color: colors.textSecondaryDark,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimaryLight,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  sectionTitleDark: {
    color: colors.textPrimaryDark,
  },
  paperCardWrapper: {
    marginBottom: spacing.md,
  },
  loadingContainer: {
    padding: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondaryLight,
  },
  loadingTextDark: {
    color: colors.textSecondaryDark,
  },
  emptyState: {
    backgroundColor: colors.cardLight,
    borderRadius: borderRadius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyStateDark: {
    backgroundColor: colors.cardDark,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondaryLight,
    textAlign: 'center',
  },
  emptyTextDark: {
    color: colors.textSecondaryDark,
  },
  addInterestButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  addInterestButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
});
