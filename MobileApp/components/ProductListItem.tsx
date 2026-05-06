import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '../constants/theme';
import { ProductOut, getStockStatus, getEffectiveThreshold } from '../services/types';
import StockBadge from './StockBadge';

interface ProductListItemProps {
  product: ProductOut;
  onPress?: () => void;
}

export default function ProductListItem({ product, onPress }: ProductListItemProps) {
  const status = getStockStatus(product);
  const effective = getEffectiveThreshold(product);
  const isAiDriven = product.ai_reorder_threshold != null;

  const stockPercent = effective > 0
    ? Math.min((product.current_stock / (effective * 1.5)) * 100, 100)
    : 100;

  const barColor = status === 'CRITICAL' ? Colors.critical
    : status === 'WARNING' ? Colors.warning
    : Colors.success;

  return (
    <TouchableOpacity
      style={[styles.container, Shadow.sm]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{product.product_name}</Text>
          {isAiDriven && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>🤖 AI</Text>
            </View>
          )}
          <StockBadge status={status} />
        </View>

        <View style={styles.metaRow}>
          {product.category && (
            <Text style={styles.category}>{product.category}</Text>
          )}
          {product.sku_code && (
            <Text style={styles.sku}>SKU: {product.sku_code}</Text>
          )}
        </View>

        <View style={styles.stockRow}>
          <View style={styles.stockBar}>
            <View style={[styles.stockFill, { width: `${stockPercent}%`, backgroundColor: barColor }]} />
          </View>
          <Text style={styles.stockText}>
            {product.current_stock} / {Math.round(effective)} {product.unit}
          </Text>
        </View>

        {/* AI reorder suggestion */}
        {product.ai_suggested_reorder != null && product.ai_suggested_reorder > 0 && (
          <View style={styles.reorderRow}>
            <Text style={styles.reorderText}>
              📦 Order {Math.round(product.ai_suggested_reorder)} more
            </Text>
          </View>
        )}
      </View>

      <View style={styles.right}>
        {product.selling_price != null && (
          <Text style={styles.price}>₹{product.selling_price.toFixed(0)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    flex: 1,
  },
  right: {
    marginLeft: Spacing.md,
    alignItems: 'flex-end',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    flex: 1,
  },
  aiBadge: {
    backgroundColor: Colors.infoBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  aiBadgeText: {
    fontSize: 10,
    color: Colors.info,
    fontWeight: FontWeight.semibold,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  category: {
    fontSize: FontSize.xs,
    color: Colors.primaryLight,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  sku: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stockBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  stockFill: {
    height: '100%',
    borderRadius: 2,
  },
  stockText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    minWidth: 80,
    textAlign: 'right',
  },
  reorderRow: {
    marginTop: Spacing.xs,
  },
  reorderText: {
    fontSize: FontSize.xs,
    color: Colors.warning,
    fontWeight: FontWeight.medium,
  },
  price: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
});
