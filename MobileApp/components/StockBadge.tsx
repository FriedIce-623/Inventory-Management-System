import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../constants/theme';
import { StockStatus } from '../services/types';

interface StockBadgeProps {
  status: StockStatus;
  compact?: boolean;
}

const STATUS_CONFIG = {
  CRITICAL: { label: 'Critical', bg: Colors.criticalBg, text: Colors.critical },
  WARNING:  { label: 'Warning',  bg: Colors.warningBg,  text: Colors.warning  },
  HEALTHY:  { label: 'Healthy',  bg: Colors.successBg,  text: Colors.success  },
};

export default function StockBadge({ status, compact }: StockBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      {!compact && <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
