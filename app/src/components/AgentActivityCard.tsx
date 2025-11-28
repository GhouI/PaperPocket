import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, typography, shadows } from '../theme';
import type { AgentActivity } from '../types';

interface AgentActivityCardProps {
  activities: AgentActivity[];
  onViewAll?: () => void;
}

export default function AgentActivityCard({ activities, onViewAll }: AgentActivityCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formatTimeAgo = (timestamp: string): string => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getStatusIcon = (status: AgentActivity['status']) => {
    switch (status) {
      case 'completed':
        return { name: 'checkmark-circle' as const, color: colors.success };
      case 'in_progress':
        return { name: 'sync' as const, color: colors.primary };
      case 'failed':
        return { name: 'alert-circle' as const, color: colors.error };
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {activities.slice(0, 3).map((activity, index) => (
        <React.Fragment key={activity.id}>
          <View style={styles.activityRow}>
            <View style={styles.activityContent}>
              <Text
                style={[styles.activityTitle, isDark && styles.textPrimaryDark]}
                numberOfLines={1}
              >
                {activity.paperTitle || 'Processing...'}
              </Text>
              <Text style={[styles.activityTime, isDark && styles.textSecondaryDark]}>
                Processed {formatTimeAgo(activity.timestamp)}
              </Text>
            </View>
            <Ionicons
              name={getStatusIcon(activity.status).name}
              size={24}
              color={getStatusIcon(activity.status).color}
            />
          </View>
          {index < Math.min(activities.length, 3) - 1 && (
            <View style={[styles.divider, isDark && styles.dividerDark]} />
          )}
        </React.Fragment>
      ))}

      {onViewAll && (
        <>
          <View style={[styles.divider, isDark && styles.dividerDark]} />
          <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
            <Text style={styles.viewAllText}>View All Activity</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardLight,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadows.md,
  },
  containerDark: {
    backgroundColor: colors.cardDark,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityContent: {
    flex: 1,
    marginRight: spacing.lg,
  },
  activityTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.textPrimaryLight,
    marginBottom: spacing.xs,
  },
  activityTime: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondaryLight,
  },
  divider: {
    height: 1,
    backgroundColor: colors.dividerLight,
  },
  dividerDark: {
    backgroundColor: colors.dividerDark,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  textPrimaryDark: {
    color: colors.textPrimaryDark,
  },
  textSecondaryDark: {
    color: colors.textSecondaryDark,
  },
});

