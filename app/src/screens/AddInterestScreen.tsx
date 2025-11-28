import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, typography, borderRadius } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { InterestChip } from '../components';

const SUGGESTED_INTERESTS = [
  { name: 'Machine Learning', type: 'topic' as const },
  { name: 'Computer Vision', type: 'topic' as const },
  { name: 'Natural Language Processing', type: 'topic' as const },
  { name: 'Reinforcement Learning', type: 'topic' as const },
  { name: 'cs.LG', type: 'category' as const },
  { name: 'cs.CV', type: 'category' as const },
  { name: 'cs.CL', type: 'category' as const },
  { name: 'cs.AI', type: 'category' as const },
  { name: 'stat.ML', type: 'category' as const },
];

export default function AddInterestScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const { interests, addInterest, removeInterest } = useAppStore();
  const [inputValue, setInputValue] = useState('');

  const handleAddInterest = () => {
    if (!inputValue.trim()) return;

    const newInterest = {
      id: Date.now().toString(),
      name: inputValue.trim(),
      type: inputValue.startsWith('cs.') || inputValue.startsWith('stat.')
        ? ('category' as const)
        : ('topic' as const),
      createdAt: new Date().toISOString(),
    };

    addInterest(newInterest);
    setInputValue('');
  };

  const handleSuggestedInterest = (name: string, type: 'topic' | 'category') => {
    const exists = interests.some((i) => i.name.toLowerCase() === name.toLowerCase());
    if (!exists) {
      addInterest({
        id: Date.now().toString(),
        name,
        type,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleDone = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={isDark ? colors.textPrimaryDark : colors.textPrimaryLight}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
          Add Interests
        </Text>
        <TouchableOpacity onPress={handleDone}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Description */}
        <Text style={[styles.description, isDark && styles.descriptionDark]}>
          Add topics or arXiv categories to personalize your feed.
        </Text>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="e.g., 'machine learning', 'cs.CV'"
              placeholderTextColor={
                isDark ? colors.textTertiaryDark : colors.textTertiaryLight
              }
              onSubmitEditing={handleAddInterest}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={handleAddInterest}
              style={styles.addButton}
              disabled={!inputValue.trim()}
            >
              <Ionicons
                name="add-circle"
                size={28}
                color={inputValue.trim() ? colors.primary : colors.textTertiaryLight}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* My Interests */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            My Interests
          </Text>
          {interests.length > 0 ? (
            <View style={styles.chipsContainer}>
              {interests.map((interest) => (
                <InterestChip
                  key={interest.id}
                  interest={interest}
                  onRemove={() => removeInterest(interest.id)}
                  showRemove
                />
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              No interests added yet
            </Text>
          )}
        </View>

        {/* Suggested */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Suggested
          </Text>
          <View style={styles.chipsContainer}>
            {SUGGESTED_INTERESTS.filter(
              (s) => !interests.some((i) => i.name.toLowerCase() === s.name.toLowerCase())
            ).map((suggestion) => (
              <InterestChip
                key={suggestion.name}
                interest={{
                  id: suggestion.name,
                  name: suggestion.name,
                  type: suggestion.type,
                  createdAt: '',
                }}
                onPress={() => handleSuggestedInterest(suggestion.name, suggestion.type)}
                showRemove={false}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <TouchableOpacity style={styles.saveButton} onPress={handleDone}>
          <Text style={styles.saveButtonText}>Save Interests</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimaryLight,
  },
  headerTitleDark: {
    color: colors.textPrimaryDark,
  },
  doneButton: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondaryLight,
    marginBottom: spacing.lg,
  },
  descriptionDark: {
    color: colors.textSecondaryDark,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.dividerLight,
    paddingRight: spacing.sm,
  },
  inputWrapperDark: {
    backgroundColor: colors.cardDarkAlt,
    borderColor: colors.dividerDark,
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.md,
    color: colors.textPrimaryLight,
  },
  inputDark: {
    color: colors.textPrimaryDark,
  },
  addButton: {
    padding: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimaryLight,
    marginBottom: spacing.md,
  },
  sectionTitleDark: {
    color: colors.textPrimaryDark,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondaryLight,
    fontStyle: 'italic',
  },
  emptyTextDark: {
    color: colors.textSecondaryDark,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    backgroundColor: colors.backgroundLight,
  },
  saveButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: '#fff',
  },
});

