import type { PropsWithChildren } from 'react';
import {
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
  type TextInputProps,
} from 'react-native';

export const colors = {
  background: '#F2F5F1',
  surface: '#FFFFFF',
  ink: '#162D25',
  muted: '#4B665C',
  accent: '#235E49',
  tint: '#E2EFE8',
  border: '#C9D8CF',
  danger: '#A12932',
};

export function Page({ children }: PropsWithChildren) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {children}
    </ScrollView>
  );
}

export function Button({ label, onPress, variant = 'primary', disabled = false }: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button, variant === 'primary' ? styles.primary : styles.secondary,
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <Text style={[
        styles.buttonText,
        variant === 'primary' && styles.primaryText,
        variant === 'danger' && styles.error,
      ]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...props}
        style={[styles.input, props.multiline && styles.multiline, style]}
      />
    </View>
  );
}

export function ErrorText({ message }: { message: string }) {
  return <Text accessibilityRole="alert" style={styles.error}>{message}</Text>;
}

export const layout = StyleSheet.create({
  title: { color: colors.ink, fontSize: 28, fontWeight: '800' },
  heading: { color: colors.ink, fontSize: 19, fontWeight: '700' },
  text: { color: colors.ink, fontSize: 16 },
  muted: { color: colors.muted, fontSize: 14 },
  card: {
    backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1,
    borderColor: colors.border, padding: 16, gap: 10,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  page: { padding: 16, gap: 14, width: '100%', maxWidth: 720, alignSelf: 'center' },
  button: { borderRadius: 12, minHeight: 46, paddingHorizontal: 15, paddingVertical: 12, justifyContent: 'center' },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.tint },
  buttonText: { color: colors.accent, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  primaryText: { color: '#FFFFFF' },
  dimmed: { opacity: 0.55 },
  field: { gap: 5 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  input: {
    color: colors.ink, fontSize: 16, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, borderRadius: 12, padding: 12, minHeight: 48,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  error: { color: colors.danger, fontSize: 15 },
});
