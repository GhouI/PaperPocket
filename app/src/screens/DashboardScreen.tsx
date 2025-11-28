import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../theme';
import type { RootStackParamList } from '../types';
import { useAppStore } from '../store/useAppStore';
import { usePaperRecommendations } from '../hooks/useCactusAI';
import {
  Header,
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

  const { searchQuery, setSearchQuery, agentActivities, isModelDownloaded } = useAppStore();
  const { papers, isLoading, refreshRecommendations } = usePaperRecommendations();

  useEffect(() => {
    refreshRecommendations();
  }, []);

  const handleAddInterest = () => {
    navigation.navigate('AddInterest');
  };

  const handleAddFromUrl = () => {
    // TODO: Implement URL paper import
  };

  const handleLibrary = () => {
    navigation.navigate('Library');
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.logoButton}>
            <Ionicons
              name="flask"
              size={28}
              color={isDark ? colors.textPrimaryDark : colors.textPrimaryLight}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            Dashboard
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
            refreshing={isLoading}
            onRefresh={refreshRecommendations}
            tintColor={colors.primary}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
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
          <ActionChip icon="link" label="Add from URL" onPress={handleAddFromUrl} />
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

        {/* For You Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            For You
          </Text>
          {papers.length > 0 ? (
            <PaperCard paper={papers[0]} />
          ) : (
            <View style={[styles.emptyState, isDark && styles.emptyStateDark]}>
              <Ionicons
                name="newspaper-outline"
                size={48}
                color={isDark ? colors.textTertiaryDark : colors.textTertiaryLight}
              />
              <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
                Add interests to get personalized recommendations
              </Text>
              <TouchableOpacity
                style={styles.addInterestButton}
                onPress={handleAddInterest}
              >
                <Text style={styles.addInterestButtonText}>Add Interests</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Agent Activity Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Agent Activity
          </Text>
          <AgentActivityCard
            activities={agentActivities}
            onViewAll={() => {
              // TODO: Navigate to activity log
            }}
          />
        </View>

        {/* More Recommendations */}
        {papers.length > 1 && (
          <View style={styles.section}>
            {papers.slice(1).map((paper) => (
              <View key={paper.id} style={styles.paperCardWrapper}>
                <PaperCard paper={paper} />
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
    marginBottom: spacing.lg,
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

