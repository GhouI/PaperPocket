import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import { useCactusAI } from '../hooks/useCactusAI';

export default function ModelDownloadBanner() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    isDownloaded,
    isDownloading,
    downloadProgress,
    downloadModel,
    error,
  } = useCactusAI();

  if (isDownloaded) return null;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="hardware-chip" size={24} color={colors.accent} />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            {isDownloading ? 'Downloading AI Model...' : 'Enable On-Device AI'}
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            {isDownloading
              ? `${Math.round(downloadProgress * 100)}% complete`
              : 'Chat about papers offline (~600MB)'}
          </Text>
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>

        {isDownloading ? (
          <View style={styles.progressContainer}>
            <ActivityIndicator color={colors.primary} size="small" />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={downloadModel}
            activeOpacity={0.8}
          >
            <Ionicons name="download" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {isDownloading && (
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${downloadProgress * 100}%` },
            ]}
          />
        </View>
      )}
    </View>
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimaryLight,
    marginBottom: spacing.xs,
  },
  titleDark: {
    color: colors.textPrimaryDark,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
  },
  subtitleDark: {
    color: colors.textSecondaryDark,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: colors.dividerLight,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});
