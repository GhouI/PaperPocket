import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { SettingsRow, SettingsSection } from '../components';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const { user, settings, updateSettings, isModelDownloaded } = useAppStore();

  const handleLogout = () => {
    // TODO: Implement logout
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
          Settings
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.profileCard, isDark && styles.profileCardDark]}
          >
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={56} color={colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, isDark && styles.profileNameDark]}>
                {user?.name || 'Guest'}
              </Text>
              <Text style={[styles.profileEmail, isDark && styles.profileEmailDark]}>
                {user?.email || 'Sign in to sync data'}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? colors.textTertiaryDark : colors.textTertiaryLight}
            />
          </TouchableOpacity>

          <View style={[styles.accountOptions, isDark && styles.accountOptionsDark]}>
            <SettingsRow
              icon="ribbon"
              iconColor={colors.yellow}
              label="Subscription"
              value={user?.subscription === 'pro' ? 'Pro' : 'Free'}
              onPress={() => {}}
            />
            <View style={[styles.divider, isDark && styles.dividerDark]} />
            <SettingsRow
              icon="log-out"
              iconColor={colors.error}
              label="Log Out"
              onPress={handleLogout}
              isDestructive
              showChevron={false}
            />
          </View>
        </View>

        {/* AI & Data Section */}
        <SettingsSection title="AI & Data">
          <SettingsRow
            icon="hardware-chip"
            iconColor={colors.primary}
            label="AI Model"
            value={isModelDownloaded ? 'Downloaded' : 'Not Downloaded'}
            onPress={() => {}}
          />
          <SettingsRow
            icon="key"
            iconColor={colors.primary}
            label="API Keys"
            onPress={() => {}}
          />
          <SettingsRow
            icon="document-text"
            iconColor={colors.teal}
            label="Default Paper Source"
            value={settings.defaultPaperSource === 'arxiv' ? 'arXiv' : 'Semantic Scholar'}
            onPress={() => {}}
          />
          <SettingsRow
            icon="sync"
            iconColor={colors.indigo}
            label="Data & Sync"
            onPress={() => {}}
          />
        </SettingsSection>

        {/* General Section */}
        <SettingsSection title="General">
          <SettingsRow
            icon="notifications"
            iconColor={colors.purple}
            label="Notifications"
            isSwitch
            switchValue={settings.notificationsEnabled}
            onSwitchChange={(value) => updateSettings({ notificationsEnabled: value })}
          />
          <SettingsRow
            icon="mail"
            iconColor={colors.primary}
            label="Daily Digest"
            isSwitch
            switchValue={settings.dailyDigestEnabled}
            onSwitchChange={(value) => updateSettings({ dailyDigestEnabled: value })}
          />
          <SettingsRow
            icon="contrast"
            iconColor={colors.sky}
            label="Appearance"
            value={settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
            onPress={() => {}}
          />
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="About">
          <SettingsRow
            icon="information-circle"
            iconColor={colors.slate}
            label="About PaperPocket"
            onPress={() => {}}
          />
          <SettingsRow
            icon="shield-checkmark"
            iconColor={colors.slate}
            label="Privacy Policy"
            onPress={() => {}}
          />
          <SettingsRow
            icon="document-lock"
            iconColor={colors.slate}
            label="Terms of Service"
            onPress={() => {}}
          />
        </SettingsSection>

        {/* Version */}
        <Text style={[styles.versionText, isDark && styles.versionTextDark]}>
          Version 1.0.0 (231)
        </Text>

        {/* Cactus Attribution */}
        <View style={styles.attributionContainer}>
          <Text style={[styles.attributionText, isDark && styles.attributionTextDark]}>
            Powered by{' '}
            <Text style={styles.cactusText}>Cactus</Text>
            {' '}for on-device AI
          </Text>
        </View>
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
    gap: spacing.sm,
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
  accountOptions: {
    backgroundColor: colors.cardLight,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  accountOptionsDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  divider: {
    height: 1,
    backgroundColor: colors.dividerLight,
    marginHorizontal: spacing.lg,
  },
  dividerDark: {
    backgroundColor: colors.dividerDark,
  },
  versionText: {
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.textTertiaryLight,
    marginTop: spacing.md,
  },
  versionTextDark: {
    color: colors.textTertiaryDark,
  },
  attributionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  attributionText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiaryLight,
  },
  attributionTextDark: {
    color: colors.textTertiaryDark,
  },
  cactusText: {
    color: colors.success,
    fontWeight: '600',
  },
});

