import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { predictionAPI } from '../../services/api';
import { PredictionOut } from '../../services/types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

const CONFIDENCE_COLORS: Record<string, string> = {
  high: Colors.success,
  medium: Colors.warning,
  low: Colors.critical,
};

export default function PredictionsScreen() {
  const [predictions, setPredictions] = useState<PredictionOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchForecasts = useCallback(async () => {
    try {
      const data = await predictionAPI.getAllForecasts(14);
      setPredictions(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); fetchForecasts(); }, [fetchForecasts]));

  if (loading && !refreshing) return <LoadingSpinner fullscreen message="Generating forecasts..." />;

  const needsReorder = predictions.filter(p => p.suggested_reorder > 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ML Forecasts</Text>
        <Text style={styles.subtitle}>14-day demand predictions</Text>
      </View>

      {needsReorder.length > 0 && (
        <View style={styles.alertBanner}>
          <Ionicons name="alert-circle" size={18} color={Colors.warning} />
          <Text style={styles.alertText}>{needsReorder.length} products need reordering</Text>
        </View>
      )}

      <FlatList
        data={predictions}
        keyExtractor={i => i.product_id}
        renderItem={({ item }) => <ForecastCard prediction={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="analytics-outline" title="No forecasts available" subtitle="Add products and sales data to enable ML predictions" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchForecasts(); }} tintColor={Colors.primary} />}
      />
    </View>
  );
}

function ForecastCard({ prediction }: { prediction: PredictionOut }) {
  const p = prediction;
  const confColor = CONFIDENCE_COLORS[p.confidence.toLowerCase()] || Colors.textMuted;
  const stockRatio = p.current_stock > 0 && p.predicted_demand > 0
    ? Math.min(p.current_stock / p.predicted_demand, 2) : 0;
  const daysOfStock = p.predicted_demand > 0
    ? Math.round((p.current_stock / p.predicted_demand) * p.forecast_days) : 999;

  return (
    <Card style={styles.forecastCard}>
      <View style={styles.fcHeader}>
        <Text style={styles.fcName} numberOfLines={1}>{p.product_name}</Text>
        <View style={[styles.confBadge, { backgroundColor: confColor + '20' }]}>
          <View style={[styles.confDot, { backgroundColor: confColor }]} />
          <Text style={[styles.confText, { color: confColor }]}>{p.confidence}</Text>
        </View>
      </View>

      <View style={styles.fcGrid}>
        <View style={styles.fcMetric}>
          <Text style={styles.fcMetricLabel}>Predicted Demand</Text>
          <Text style={styles.fcMetricValue}>{Math.round(p.predicted_demand)}</Text>
          <Text style={styles.fcMetricUnit}>{p.forecast_days} days</Text>
        </View>
        <View style={styles.fcMetric}>
          <Text style={styles.fcMetricLabel}>Current Stock</Text>
          <Text style={[styles.fcMetricValue, daysOfStock < p.forecast_days && { color: Colors.critical }]}>
            {Math.round(p.current_stock)}
          </Text>
          <Text style={styles.fcMetricUnit}>≈ {daysOfStock} days</Text>
        </View>
        <View style={styles.fcMetric}>
          <Text style={styles.fcMetricLabel}>Reorder Qty</Text>
          <Text style={[styles.fcMetricValue, p.suggested_reorder > 0 ? { color: Colors.warning } : { color: Colors.success }]}>
            {Math.round(p.suggested_reorder)}
          </Text>
          <Text style={styles.fcMetricUnit}>{p.suggested_reorder > 0 ? 'needed' : 'sufficient'}</Text>
        </View>
      </View>

      {/* Stock vs Demand bar */}
      <View style={styles.fcBarContainer}>
        <View style={styles.fcBarBg}>
          <View style={[styles.fcBarFill, {
            width: `${Math.min(stockRatio * 50, 100)}%`,
            backgroundColor: stockRatio >= 1 ? Colors.success : stockRatio >= 0.5 ? Colors.warning : Colors.critical,
          }]} />
        </View>
        <View style={styles.fcBarLabels}>
          <Text style={styles.fcBarLabel}>Stock</Text>
          <Text style={styles.fcBarLabel}>Demand</Text>
        </View>
      </View>

      <View style={styles.tierRow}>
        <Ionicons name="hardware-chip-outline" size={14} color={Colors.textMuted} />
        <Text style={styles.tierText}>{p.model_tier}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.huge, paddingBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.warningBg, marginHorizontal: Spacing.xl, marginBottom: Spacing.lg, padding: Spacing.md, borderRadius: BorderRadius.md },
  alertText: { fontSize: FontSize.sm, color: Colors.warning, fontWeight: FontWeight.medium },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  forecastCard: { marginBottom: Spacing.md },
  fcHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  fcName: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text, flex: 1, marginRight: Spacing.sm },
  confBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, gap: 4 },
  confDot: { width: 6, height: 6, borderRadius: 3 },
  confText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textTransform: 'capitalize' },
  fcGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  fcMetric: { flex: 1, alignItems: 'center' as const },
  fcMetricLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  fcMetricValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  fcMetricUnit: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  fcBarContainer: { marginBottom: Spacing.sm },
  fcBarBg: { height: 6, backgroundColor: Colors.bgElevated, borderRadius: 3, overflow: 'hidden' },
  fcBarFill: { height: '100%', borderRadius: 3 },
  fcBarLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  fcBarLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tierText: { fontSize: FontSize.xs, color: Colors.textMuted },
});
