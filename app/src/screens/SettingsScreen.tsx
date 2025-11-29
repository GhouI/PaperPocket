import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { useCactusAI } from '../hooks/useCactusAI';
import { SettingsRow, SettingsSection } from '../components';
import * as storage from '../services/storage';
import type { CactusModel } from 'cactus-react-native';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const { user, settings, updateSettings, interests, libraryPapers } = useAppStore();

  const {
    isDownloaded,
    isDownloading,
    downloadProgress,
    downloadModel,
    getAvailableModels,
  } = useCactusAI();

  const [availableModels, setAvailableModels] = useState<CactusModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Load available models
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      const models = await getAvailableModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleDownloadModel = async () => {
    if (isDownloading) return;

    Alert.alert(
      'Download AI Model',
      'This will download a ~600MB model for on-device AI. The model runs completely offline after download.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: downloadModel },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your saved papers, notes, chat history, and interests. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await storage.clearAllData();
            Alert.alert('Done', 'All data has been cleared. Please restart the app.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => {} },
    ]);
  };

  const getModelSizeText = () => {
    const currentModel = availableModels.find((m) => m.slug === settings.modelSlug);
    if (currentModel) {
      return `${currentModel.name} (${Math.round(currentModel.sizeMb)}MB)`;
    }
    return settings.modelSlug;
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <View style={styles.section}>
          <TouchableOpacity style={[styles.profileCard, isDark && styles.profileCardDark]}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={56} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, isDark && styles.profileNameDark]}>
                {user?.name || 'Researcher'}
              </Text>
              <Text style={[styles.profileEmail, isDark && styles.profileEmailDark]}>
                {user?.email || 'Not signed in'}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? colors.textTertiaryDark : colors.textTertiaryLight}
            />
          </TouchableOpacity>

          {/* Stats */}
          <View style={[styles.statsContainer, isDark && styles.statsContainerDark]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                {libraryPapers.length}
              </Text>
              <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>Saved Papers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, isDark && styles.statValueDark]}>
                {interests.length}
              </Text>
              <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>Interests</Text>
            </View>
          </View>
        </View>

        {/* AI Model Section */}
        <SettingsSection title="AI Model">
          <View style={styles.modelSection}>
            <View style={styles.modelInfo}>
              <View style={styles.modelHeader}>
                <Ionicons name="hardware-chip" size={24} color={colors.primary} />
                <View style={styles.modelText}>
                  <Text style={[styles.modelName, isDark && styles.modelNameDark]}>
                    On-Device AI (Qwen 0.6B)
                  </Text>
                  <Text style={[styles.modelDesc, isDark && styles.modelDescDark]}>
                    {isDownloaded
                      ? 'Ready for offline use'
                      : isDownloading
                      ? `Downloading... ${Math.round(downloadProgress * 100)}%`
                      : 'Not downloaded'}
                  </Text>
                </View>
              </View>

              {isDownloading && (
                <View style={styles.downloadProgressContainer}>
                  <View style={[styles.downloadProgressBar, { width: `${downloadProgress * 100}%` }]} />
                </View>
              )}
            </View>

            {!isDownloaded && !isDownloading && (
              <TouchableOpacity style={styles.downloadModelButton} onPress={handleDownloadModel}>
                <Ionicons name="download" size={18} color="#fff" />
                <Text style={styles.downloadModelText}>Download (~600MB)</Text>
              </TouchableOpacity>
            )}

            {isDownloaded && (
              <View style={styles.modelReadyBadge}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.modelReadyText}>Ready</Text>
              </View>
            )}
          </View>
        </SettingsSection>

        {/* Data & Storage Section */}
        <SettingsSection title="Data & Storage">
          <SettingsRow
            icon="document-text"
            iconColor={colors.teal}
            label="Default Paper Source"
            value="arXiv"
            onPress={() => {}}
          />
          <SettingsRow
            icon="cloud-download"
            iconColor={colors.indigo}
            label="Offline Papers"
            value={`${libraryPapers.length} cached`}
            onPress={() => {}}
          />
          <SettingsRow
            icon="trash"
            iconColor={colors.error}
            label="Clear All Data"
            onPress={handleClearData}
            isDestructive
            showChevron={false}
          />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingsRow
            icon="notifications"
            iconColor={colors.purple}
            label="Push Notifications"
            isSwitch
            switchValue={settings.notificationsEnabled}
            onSwitchChange={(value) => updateSettings({ notificationsEnabled: value })}
          />
          <SettingsRow
            icon="mail"
            iconColor={colors.primary}
            label="Daily Paper Digest"
            isSwitch
            switchValue={settings.dailyDigestEnabled}
            onSwitchChange={(value) => updateSettings({ dailyDigestEnabled: value })}
          />
        </SettingsSection>

        {/* Appearance Section */}
        <SettingsSection title="Appearance">
          <SettingsRow
            icon="contrast"
            iconColor={colors.sky}
            label="Theme"
            value={settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
            onPress={() => {
              const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
              const currentIndex = themes.indexOf(settings.theme);
              const nextTheme = themes[(currentIndex + 1) % themes.length];
              updateSettings({ theme: nextTheme });
            }}
          />
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="About">
          <SettingsRow
            icon="information-circle"
            iconColor={colors.slate}
            label="About PaperPocket"
            onPress={() => {
              Alert.alert(
                'PaperPocket',
                'A mobile app for discovering and analyzing research papers with on-device AI.\n\nPowered by Cactus for local inference.\n\nVersion 1.0.0'
              );
            }}
          />
          <SettingsRow
            icon="logo-github"
            iconColor={isDark ? '#fff' : '#000'}
            label="Source Code"
            onPress={() => {}}
          />
          <SettingsRow
            icon="shield-checkmark"
            iconColor={colors.slate}
            label="Privacy Policy"
            onPress={() => {}}
          />
        </SettingsSection>

        {/* Sign Out */}
        <TouchableOpacity style={[styles.signOutButton, isDark && styles.signOutButtonDark]} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={[styles.versionText, isDark && styles.versionTextDark]}>
          PaperPocket v1.0.0{'\n'}Powered by Cactus AI
        </Text>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  profileCardDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimaryLight,
    marginBottom: spacing.xs,
  },
  profileNameDark: {
    color: colors.textPrimaryDark,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
  },
  profileEmailDark: {
    color: colors.textSecondaryDark,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardLight,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  statsContainerDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  statValueDark: {
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
    marginTop: spacing.xs,
  },
  statLabelDark: {
    color: colors.textSecondaryDark,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.dividerLight,
    marginHorizontal: spacing.lg,
  },
  modelSection: {
    padding: spacing.lg,
  },
  modelInfo: {
    marginBottom: spacing.md,
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  modelText: {
    flex: 1,
  },
  modelName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimaryLight,
  },
  modelNameDark: {
    color: colors.textPrimaryDark,
  },
  modelDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
    marginTop: 2,
  },
  modelDescDark: {
    color: colors.textSecondaryDark,
  },
  downloadProgressContainer: {
    height: 4,
    backgroundColor: colors.dividerLight,
    borderRadius: 2,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  downloadProgressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  downloadModelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  downloadModelText: {
    color: '#fff',
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  modelReadyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  modelReadyText: {
    color: colors.success,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardLight,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  signOutButtonDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  signOutText: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.textTertiaryLight,
    lineHeight: typography.fontSize.xs * 1.5,
  },
  versionTextDark: {
    color: colors.textTertiaryDark,
  },
});
