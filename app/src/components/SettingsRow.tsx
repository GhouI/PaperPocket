import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, typography } from '../theme';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  isDestructive?: boolean;
  showChevron?: boolean;
}

export default function SettingsRow({
  icon,
  iconColor,
  label,
  value,
  onPress,
  isSwitch = false,
  switchValue,
  onSwitchChange,
  isDestructive = false,
  showChevron = true,
}: SettingsRowProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const content = (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <Ionicons name={icon} size={22} color="#fff" />
        </View>
        <Text
          style={[
            styles.label,
            isDark && styles.labelDark,
            isDestructive && styles.labelDestructive,
          ]}
        >
          {label}
        </Text>
      </View>

      <View style={styles.rightContent}>
        {isSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor="#fff"
          />
        ) : (
          <>
            {value && (
              <Text style={[styles.value, isDark && styles.valueDark]}>{value}</Text>
            )}
            {showChevron && !isDestructive && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? colors.textTertiaryDark : colors.textTertiaryLight}
              />
            )}
          </>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.sectionContainer}>
      {title && (
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          {title}
        </Text>
      )}
      <View style={[styles.sectionContent, isDark && styles.sectionContentDark]}>
        {React.Children.map(children, (child, index) => (
          <>
            {child}
            {index < React.Children.count(children) - 1 && (
              <View style={[styles.divider, isDark && styles.dividerDark]} />
            )}
          </>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimaryLight,
    flex: 1,
  },
  labelDark: {
    color: colors.textPrimaryDark,
  },
  labelDestructive: {
    color: colors.error,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  value: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondaryLight,
  },
  valueDark: {
    color: colors.textSecondaryDark,
  },
  sectionContainer: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionTitleDark: {
    color: colors.textSecondaryDark,
  },
  sectionContent: {
    backgroundColor: colors.cardLight,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  sectionContentDark: {
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
});

