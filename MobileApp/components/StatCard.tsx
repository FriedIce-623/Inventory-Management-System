import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  gradient?: readonly [string, string, ...string[]];
}

export default function StatCard({ title, value, subtitle, icon, color, gradient }: StatCardProps) {
  const Wrapper = gradient ? LinearGradient : View;
  const wrapperProps = gradient
    ? { colors: gradient, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }
    : {};

  return (
    <Wrapper style={[styles.card, Shadow.sm]} {...(wrapperProps as any)}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color ? `${color}20` : Colors.primaryLight + '20' }]}>
          {icon}
        </View>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    flex: 1,
    minWidth: 140,
  },
  header: {
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
