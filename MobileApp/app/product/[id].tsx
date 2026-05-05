import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  TextInput, Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { inventoryAPI, salesAPI, predictionAPI } from '../../services/api';
import { ProductOut, SaleOut, PredictionOut, getStockStatus, ProductUpdate } from '../../services/types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import Card from '../../components/Card';
import StockBadge from '../../components/StockBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductOut | null>(null);
  const [sales, setSales] = useState<SaleOut[]>([]);
  const [forecast, setForecast] = useState<PredictionOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<ProductUpdate>({});
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [p, s] = await Promise.all([
          inventoryAPI.getProduct(id),
          salesAPI.getSales(id),
        ]);
        setProduct(p);
        setSales(s);
        setEditForm({
          product_name: p.product_name,
          category: p.category || '',
          current_stock: p.current_stock,
          reorder_threshold: p.reorder_threshold,
          cost_price: p.cost_price ?? undefined,
          selling_price: p.selling_price ?? undefined,
          sku_code: p.sku_code || '',
          unit: p.unit,
        });
        try {
          const f = await predictionAPI.getProductForecast(id);
          setForecast(f);
        } catch { /* no forecast available */ }
      } catch (err: any) {
        Alert.alert('Error', err.message);
        router.back();
      } finally { setLoading(false); }
    })();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    setEditLoading(true);
    try {
      const updated = await inventoryAPI.updateProduct(id, editForm);
      setProduct(updated);
      setShowEdit(false);
      Alert.alert('Success', 'Product updated');
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setEditLoading(false); }
  };

  const handleDelete = () => {
    Alert.alert('Delete Product', `Delete "${product?.product_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try { await inventoryAPI.deleteProduct(id!); router.back(); }
          catch (err: any) { Alert.alert('Error', err.message); }
        },
      },
    ]);
  };

  if (loading || !product) return <LoadingSpinner fullscreen message="Loading product..." />;

  const status = getStockStatus(product);
  const stockPct = Math.min((product.current_stock / (product.reorder_threshold * 3)) * 100, 100);
  const barColor = status === 'CRITICAL' ? Colors.critical : status === 'WARNING' ? Colors.warning : Colors.success;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowEdit(true)} style={styles.actionBtn}>
              <Ionicons name="create-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={20} color={Colors.critical} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.productName}>{product.product_name}</Text>
            <StockBadge status={status} />
          </View>
          {product.category && <Text style={styles.category}>{product.category}</Text>}
          {product.sku_code && <Text style={styles.sku}>SKU: {product.sku_code}</Text>}
        </View>

        {/* Stock Card */}
        <Card style={styles.stockCard}>
          <Text style={styles.cardLabel}>Stock Level</Text>
          <Text style={styles.stockValue}>{product.current_stock} <Text style={styles.stockUnit}>{product.unit}</Text></Text>
          <View style={styles.stockBarBg}>
            <View style={[styles.stockBarFill, { width: `${stockPct}%`, backgroundColor: barColor }]} />
          </View>
          <View style={styles.stockMeta}>
            <Text style={styles.metaText}>Threshold: {product.reorder_threshold}</Text>
            <Text style={styles.metaText}>Max: ~{Math.round(product.reorder_threshold * 3)}</Text>
          </View>
        </Card>

        {/* Price Card */}
        <View style={styles.priceRow}>
          <Card style={styles.priceCard}>
            <Text style={styles.cardLabel}>Cost Price</Text>
            <Text style={styles.priceValue}>{product.cost_price != null ? `₹${product.cost_price}` : '—'}</Text>
          </Card>
          <Card style={styles.priceCard}>
            <Text style={styles.cardLabel}>Selling Price</Text>
            <Text style={[styles.priceValue, { color: Colors.success }]}>{product.selling_price != null ? `₹${product.selling_price}` : '—'}</Text>
          </Card>
        </View>

        {/* Forecast */}
        {forecast && (
          <Card style={styles.forecastCard}>
            <View style={styles.fcHeader}>
              <Ionicons name="analytics" size={20} color={Colors.info} />
              <Text style={styles.fcTitle}>ML Forecast ({forecast.forecast_days} days)</Text>
            </View>
            <View style={styles.fcRow}>
              <View style={styles.fcMetric}>
                <Text style={styles.fcVal}>{Math.round(forecast.predicted_demand)}</Text>
                <Text style={styles.fcLbl}>Demand</Text>
              </View>
              <View style={styles.fcMetric}>
                <Text style={[styles.fcVal, { color: forecast.suggested_reorder > 0 ? Colors.warning : Colors.success }]}>
                  {Math.round(forecast.suggested_reorder)}
                </Text>
                <Text style={styles.fcLbl}>Reorder</Text>
              </View>
              <View style={styles.fcMetric}>
                <Text style={styles.fcVal}>{forecast.confidence}</Text>
                <Text style={styles.fcLbl}>Confidence</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Sales History */}
        <Text style={styles.sectionTitle}>Sales History</Text>
        {sales.length === 0 ? (
          <Text style={styles.emptyText}>No sales recorded yet</Text>
        ) : (
          sales.slice(0, 10).map(s => (
            <Card key={s.log_id} style={styles.saleItem}>
              <View style={styles.saleRow}>
                <Text style={styles.saleDate}>{new Date(s.sale_date).toLocaleDateString()}</Text>
                <Text style={styles.saleQty}>-{s.quantity_sold} units</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEdit} animationType="slide" transparent>
        <View style={styles.modalOvr}>
          <View style={[styles.modalCnt, Shadow.lg]}>
            <View style={styles.modalHdr}>
              <Text style={styles.modalTtl}>Edit Product</Text>
              <TouchableOpacity onPress={() => setShowEdit(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBdy} keyboardShouldPersistTaps="handled">
              {[
                { l: 'Name', k: 'product_name' },
                { l: 'Category', k: 'category' },
                { l: 'SKU', k: 'sku_code' },
                { l: 'Unit', k: 'unit' },
              ].map(({ l, k }) => (
                <View key={k} style={styles.mGrp}>
                  <Text style={styles.mLbl}>{l}</Text>
                  <TextInput style={styles.mInp} value={String((editForm as any)[k] || '')}
                    onChangeText={v => setEditForm(f => ({ ...f, [k]: v }))} />
                </View>
              ))}
              <View style={styles.mRow}>
                {[{ l: 'Stock', k: 'current_stock' }, { l: 'Threshold', k: 'reorder_threshold' }].map(({ l, k }) => (
                  <View key={k} style={{ flex: 1 }}>
                    <View style={styles.mGrp}>
                      <Text style={styles.mLbl}>{l}</Text>
                      <TextInput style={styles.mInp} keyboardType="numeric" value={String((editForm as any)[k] ?? '')}
                        onChangeText={v => setEditForm(f => ({ ...f, [k]: Number(v) || 0 }))} />
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.mRow}>
                {[{ l: 'Cost ₹', k: 'cost_price' }, { l: 'Sell ₹', k: 'selling_price' }].map(({ l, k }) => (
                  <View key={k} style={{ flex: 1 }}>
                    <View style={styles.mGrp}>
                      <Text style={styles.mLbl}>{l}</Text>
                      <TextInput style={styles.mInp} keyboardType="numeric" value={(editForm as any)[k] != null ? String((editForm as any)[k]) : ''}
                        onChangeText={v => setEditForm(f => ({ ...f, [k]: v ? Number(v) : undefined }))} />
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity style={[styles.saveBtn, editLoading && { opacity: 0.6 }]} onPress={handleUpdate} disabled={editLoading}>
              <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.saveBtnG}>
                <Text style={styles.saveBtnT}>{editLoading ? 'Saving...' : 'Save Changes'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing.huge },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xxl, marginBottom: Spacing.xl },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  infoSection: { marginBottom: Spacing.xl },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xs },
  productName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, flex: 1 },
  category: { fontSize: FontSize.sm, color: Colors.primaryLight, marginBottom: 2 },
  sku: { fontSize: FontSize.xs, color: Colors.textMuted },
  stockCard: { marginBottom: Spacing.md },
  cardLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  stockValue: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  stockUnit: { fontSize: FontSize.lg, fontWeight: FontWeight.regular, color: Colors.textSecondary },
  stockBarBg: { height: 8, backgroundColor: Colors.bgElevated, borderRadius: 4, overflow: 'hidden', marginBottom: Spacing.sm },
  stockBarFill: { height: '100%', borderRadius: 4 },
  stockMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: FontSize.xs, color: Colors.textMuted },
  priceRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  priceCard: { flex: 1 },
  priceValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  forecastCard: { marginBottom: Spacing.xl },
  fcHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  fcTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  fcRow: { flexDirection: 'row', gap: Spacing.md },
  fcMetric: { flex: 1, alignItems: 'center' as const },
  fcVal: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  fcLbl: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.xxl },
  saleItem: { marginBottom: Spacing.sm },
  saleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saleDate: { fontSize: FontSize.sm, color: Colors.textSecondary },
  saleQty: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.critical },
  modalOvr: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalCnt: { backgroundColor: Colors.bgCard, borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl, maxHeight: '85%', borderWidth: 1, borderColor: Colors.border },
  modalHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xxl, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTtl: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  modalBdy: { padding: Spacing.xxl },
  mGrp: { marginBottom: Spacing.md },
  mLbl: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: Spacing.xs },
  mInp: { backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, color: Colors.text, fontSize: FontSize.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  mRow: { flexDirection: 'row', gap: Spacing.md },
  saveBtn: { margin: Spacing.xxl, borderRadius: BorderRadius.md, overflow: 'hidden' },
  saveBtnG: { paddingVertical: Spacing.lg, alignItems: 'center', borderRadius: BorderRadius.md },
  saveBtnT: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
});
