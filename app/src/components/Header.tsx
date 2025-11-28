import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, layout } from '../theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightText?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  transparent?: boolean;
}

export default function Header({
  title,
  showBack = false,
  leftIcon,
  rightIcon,
  rightText,
  onLeftPress,
  onRightPress,
  transparent = false,
}: HeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleLeftPress = () => {
    if (onLeftPress) {
      onLeftPress();
    } else if (showBack) {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        isDark && styles.containerDark,
        transparent && styles.containerTransparent,
      ]}
    >
      <View style={styles.content}>
        {/* Left Button */}
        <View style={styles.leftContainer}>
          {(showBack || leftIcon) && (
            <TouchableOpacity onPress={handleLeftPress} style={styles.iconButton}>
              <Ionicons
                name={leftIcon || 'chevron-back'}
                size={28}
                color={isDark ? colors.textPrimaryDark : colors.textPrimaryLight}
              />
            </TouchableOpacity>
          )}
          {!showBack && !leftIcon && (
            <Ionicons
              name="flask"
              size={28}
              color={isDark ? colors.textPrimaryDark : colors.textPrimaryLight}
            />
          )}
        </View>

        {/* Title */}
        <Text style={[styles.title, isDark && styles.titleDark]} numberOfLines={1}>
          {title}
        </Text>

        {/* Right Button */}
        <View style={styles.rightContainer}>
          {rightText && (
            <TouchableOpacity onPress={onRightPress}>
              <Text style={styles.rightText}>{rightText}</Text>
            </TouchableOpacity>
          )}
          {rightIcon && (
            <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
              <Ionicons
                name={rightIcon}
                size={28}
                color={isDark ? colors.textPrimaryDark : colors.textPrimaryLight}
              />
            </TouchableOpacity>
          )}
          {!rightText && !rightIcon && <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerLight,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
    borderBottomColor: colors.dividerDark,
  },
  containerTransparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: layout.headerHeight,
    paddingHorizontal: spacing.lg,
  },
  leftContainer: {
    width: 48,
    alignItems: 'flex-start',
  },
  rightContainer: {
    width: 48,
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimaryLight,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  titleDark: {
    color: colors.textPrimaryDark,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightText: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
  placeholder: {
    width: 40,
  },
});

