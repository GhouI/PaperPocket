import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, typography } from '../theme';
import type { UserInterest } from '../types';

interface InterestChipProps {
  interest: UserInterest;
  onRemove?: () => void;
  onPress?: () => void;
  selected?: boolean;
  showRemove?: boolean;
}

export default function InterestChip({
  interest,
  onRemove,
  onPress,
  selected = false,
  showRemove = true,
}: InterestChipProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const chipContent = (
    <View
      style={[
        styles.container,
        isDark && styles.containerDark,
        selected && styles.containerSelected,
      ]}
    >
      <Text
        style={[
          styles.text,
          isDark && styles.textDark,
          selected && styles.textSelected,
        ]}
      >
        {interest.name}
      </Text>
      {showRemove && onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons
            name="close"
            size={16}
            color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(19,127,236,0.7)'}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {chipContent}
      </TouchableOpacity>
    );
  }

  return chipContent;
}

interface ActionChipProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

export function ActionChip({ icon, label, onPress }: ActionChipProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      style={[styles.actionContainer, isDark && styles.actionContainerDark]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon}
        size={16}
        color={isDark ? colors.textPrimaryDark : colors.textPrimaryLight}
      />
      <Text style={[styles.actionText, isDark && styles.actionTextDark]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 36,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight,
  },
  containerDark: {
    backgroundColor: colors.primaryDark,
  },
  containerSelected: {
    backgroundColor: colors.primary,
  },
  text: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.primary,
  },
  textDark: {
    color: colors.textPrimaryDark,
  },
  textSelected: {
    color: '#fff',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 32,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.cardLight,
  },
  actionContainerDark: {
    backgroundColor: colors.cardDarkAlt,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.textPrimaryLight,
  },
  actionTextDark: {
    color: colors.textPrimaryDark,
  },
});

