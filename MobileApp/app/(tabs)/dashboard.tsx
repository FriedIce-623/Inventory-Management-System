import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { inventoryAPI, salesAPI } from '../../services/api';
import { ProductOut, SaleSummary, getStockStatus } from '../../services/types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import StockBadge from '../../components/StockBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DashboardScreen() {
  const { shop, logout } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<ProductOut[]>([]);
  const [lowStock, setLowStock] = useState<ProductOut[]>([]);
  const [salesSummary, setSalesSummary] = useState<SaleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [prods, alerts, summary] = await Promise.all([
        inventoryAPI.getProducts(),
        inventoryAPI.getLowStockAlerts(),
        salesAPI.getSalesSummary(),
      ]);
      setProducts(prods);
      setLowStock(alerts);
      setSalesSummary(summary);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [fetchData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const totalSales = salesSummary.reduce((acc, s) => acc + s.total_units_sold, 0);
  const totalTransactions = salesSummary.reduce((acc, s) => acc + s.total_transactions, 0);

  if (loading && !refreshing) {
    return <LoadingSpinner fullscreen message="Loading dashboard..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.shopName}>{shop?.shop_name || 'My Shop'}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <StatCard
            title="Products"
            value={products.length}
            icon={<Ionicons name="cube" size={20} color={Colors.primary} />}
            color={Colors.primary}
          />
          <StatCard
            title="Low Stock"
            value={lowStock.length}
            icon={<Ionicons name="alert-circle" size={20} color={Colors.critical} />}
            color={Colors.critical}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            title="Units Sold"
            value={Math.round(totalSales)}
            icon={<Ionicons name="trending-up" size={20} color={Colors.success} />}
            color={Colors.success}
          />
          <StatCard
            title="Transactions"
            value={totalTransactions}
            icon={<Ionicons name="receipt" size={20} color={Colors.info} />}
            color={Colors.info}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(tabs)/inventory')}
            activeOpacity={0.7}
          >
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.actionIcon}>
              <Ionicons name="add" size={24} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.actionLabel}>Add Product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(tabs)/sales')}
            activeOpacity={0.7}
          >
            <LinearGradient colors={[Colors.success, '#059669']} style={styles.actionIcon}>
              <Ionicons name="cart" size={24} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.actionLabel}>Log Sale</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(tabs)/predictions')}
            activeOpacity={0.7}
          >
            <LinearGradient colors={[Colors.info, '#2563EB']} style={styles.actionIcon}>
              <Ionicons name="analytics" size={24} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.actionLabel}>Forecasts</Text>
          </TouchableOpacity>
        </View>

        {/* Low Stock Alerts */}
        {lowStock.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⚠️ Low Stock Alerts</Text>
              <Text style={styles.sectionCount}>{lowStock.length} items</Text>
            </View>

            {lowStock.slice(0, 5).map((product) => (
              <TouchableOpacity
                key={product.product_id}
                onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.product_id } })}
                activeOpacity={0.7}
              >
                <Card style={styles.alertCard}>
                  <View style={styles.alertRow}>
                    <View style={styles.alertInfo}>
                      <Text style={styles.alertName} numberOfLines={1}>{product.product_name}</Text>
                      <Text style={styles.alertStock}>
                        Stock: {product.current_stock} / Threshold: {product.reorder_threshold} {product.unit}
                      </Text>
                    </View>
                    <StockBadge status={getStockStatus(product)} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}

            {lowStock.length > 5 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/inventory')}>
                <Text style={styles.viewAll}>View all {lowStock.length} alerts →</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing.huge },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Spacing.huge, marginBottom: Spacing.xxl,
  },
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary },
  shopName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginTop: 2 },
  logoutBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  sectionTitle: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text,
    marginTop: Spacing.xxl, marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Spacing.xxl, marginBottom: Spacing.lg,
  },
  sectionCount: { fontSize: FontSize.sm, color: Colors.textMuted },
  actionsRow: { flexDirection: 'row', gap: Spacing.lg, justifyContent: 'space-around' },
  actionBtn: { alignItems: 'center', gap: Spacing.sm },
  actionIcon: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', ...Shadow.md,
  },
  actionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  alertCard: { marginBottom: Spacing.sm },
  alertRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  alertInfo: { flex: 1, marginRight: Spacing.md },
  alertName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  alertStock: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  viewAll: {
    fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium,
    textAlign: 'center', marginTop: Spacing.md,
  },
});
