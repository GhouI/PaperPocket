import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, borderRadius, typography } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search papers, authors, keywords...',
  onSubmit,
  onClear,
  autoFocus = false,
}: SearchBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Ionicons
        name="search"
        size={20}
        color={isDark ? colors.textSecondaryDark : colors.textSecondaryLight}
        style={styles.searchIcon}
      />
      <TextInput
        style={[styles.input, isDark && styles.inputDark]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? colors.textSecondaryDark : colors.textSecondaryLight}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
          style={styles.clearButton}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={isDark ? colors.textSecondaryDark : colors.textSecondaryLight}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    borderRadius: borderRadius.lg,
    height: 48,
  },
  containerDark: {
    backgroundColor: colors.cardDarkAlt,
  },
  searchIcon: {
    marginLeft: spacing.lg,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.textPrimaryLight,
  },
  inputDark: {
    color: colors.textPrimaryDark,
  },
  clearButton: {
    padding: spacing.md,
  },
});

