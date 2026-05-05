import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Modal, Alert, RefreshControl, ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { inventoryAPI, salesAPI } from '../../services/api';
import { ProductOut, SaleOut, SaleSummary } from '../../services/types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function SalesScreen() {
  const [products, setProducts] = useState<ProductOut[]>([]);
  const [sales, setSales] = useState<SaleOut[]>([]);
  const [summary, setSummary] = useState<SaleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [p, s, sm] = await Promise.all([
        inventoryAPI.getProducts(),
        salesAPI.getSales(),
        salesAPI.getSalesSummary(),
      ]);
      setProducts(p);
      setSales(s);
      setSummary(sm);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, [fetchData]));

  const getProductName = (pid: string) => products.find(p => p.product_id === pid)?.product_name || 'Unknown';

  const handleLogSale = async () => {
    if (!selectedProduct) { Alert.alert('Error', 'Select a product'); return; }
    const qty = Number(quantity);
    if (!qty || qty <= 0) { Alert.alert('Error', 'Enter a valid quantity'); return; }
    setLogLoading(true);
    try {
      await salesAPI.logSale({ product_id: selectedProduct, quantity_sold: qty, note: note || undefined });
      setShowLogModal(false);
      setSelectedProduct('');
      setQuantity('');
      setNote('');
      fetchData();
      Alert.alert('Success', 'Sale logged successfully');
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLogLoading(false); }
  };

  const totalUnits = summary.reduce((a, s) => a + s.total_units_sold, 0);
  const totalTx = summary.reduce((a, s) => a + s.total_transactions, 0);
  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (loading && !refreshing) return <LoadingSpinner fullscreen message="Loading sales..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sales</Text>
        <Text style={styles.subtitle}>{sales.length} transactions</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <Card style={styles.sumCard}>
          <Ionicons name="trending-up" size={20} color={Colors.success} />
          <Text style={styles.sumValue}>{Math.round(totalUnits)}</Text>
          <Text style={styles.sumLabel}>Units Sold</Text>
        </Card>
        <Card style={styles.sumCard}>
          <Ionicons name="receipt" size={20} color={Colors.info} />
          <Text style={styles.sumValue}>{totalTx}</Text>
          <Text style={styles.sumLabel}>Transactions</Text>
        </Card>
      </View>

      {/* Sales List */}
      <Text style={styles.sectionTitle}>Recent Sales</Text>
      <FlatList
        data={sales.slice(0, 50)}
        keyExtractor={i => i.log_id}
        renderItem={({ item }) => (
          <Card style={styles.saleItem}>
            <View style={styles.saleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.saleName}>{getProductName(item.product_id)}</Text>
                <Text style={styles.saleDate}>{new Date(item.sale_date).toLocaleDateString()}</Text>
                {item.note && <Text style={styles.saleNote}>{item.note}</Text>}
              </View>
              <View style={styles.saleQty}>
                <Text style={styles.saleQtyNum}>-{item.quantity_sold}</Text>
                <Text style={styles.saleQtyLabel}>units</Text>
              </View>
            </View>
          </Card>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="cart-outline" title="No sales yet" subtitle="Log your first sale to get started" />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={Colors.primary} />}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowLogModal(true)} activeOpacity={0.8}>
        <LinearGradient colors={[Colors.success, '#059669']} style={styles.fabG}>
          <Ionicons name="add" size={28} color={Colors.white} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Log Sale Modal */}
      <Modal visible={showLogModal} animationType="slide" transparent>
        <View style={styles.modalOvr}>
          <View style={[styles.modalCnt, Shadow.lg]}>
            <View style={styles.modalHdr}>
              <Text style={styles.modalTtl}>Log Sale</Text>
              <TouchableOpacity onPress={() => setShowLogModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBdy} keyboardShouldPersistTaps="handled">
              <Text style={styles.mLbl}>Select Product</Text>
              <TextInput style={styles.mInp} placeholder="Search product..." placeholderTextColor={Colors.textMuted}
                value={productSearch} onChangeText={setProductSearch} />
              <View style={styles.prodList}>
                {filteredProducts.slice(0, 8).map(p => (
                  <TouchableOpacity key={p.product_id}
                    style={[styles.prodItem, selectedProduct === p.product_id && styles.prodItemSel]}
                    onPress={() => { setSelectedProduct(p.product_id); setProductSearch(p.product_name); }}>
                    <Text style={[styles.prodItemText, selectedProduct === p.product_id && { color: Colors.primary }]}>
                      {p.product_name}
                    </Text>
                    <Text style={styles.prodItemStock}>Stock: {p.current_stock}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.mGrp}>
                <Text style={styles.mLbl}>Quantity</Text>
                <TextInput style={styles.mInp} value={quantity} onChangeText={setQuantity}
                  keyboardType="numeric" placeholder="Enter quantity" placeholderTextColor={Colors.textMuted} />
              </View>
              <View style={styles.mGrp}>
                <Text style={styles.mLbl}>Note (optional)</Text>
                <TextInput style={styles.mInp} value={note} onChangeText={setNote}
                  placeholder="Sale note" placeholderTextColor={Colors.textMuted} />
              </View>
            </ScrollView>
            <TouchableOpacity style={[styles.logBtn, logLoading && { opacity: 0.6 }]} onPress={handleLogSale} disabled={logLoading}>
              <LinearGradient colors={[Colors.success, '#059669']} style={styles.logBtnG}>
                <Text style={styles.logBtnT}>{logLoading ? 'Logging...' : 'Log Sale'}</Text>
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
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.huge, paddingBottom: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.xl, marginBottom: Spacing.lg },
  sumCard: { flex: 1, alignItems: 'center' as const, gap: Spacing.xs },
  sumValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  sumLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, paddingHorizontal: Spacing.xl, marginBottom: Spacing.md },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
  saleItem: { marginBottom: Spacing.sm },
  saleRow: { flexDirection: 'row', alignItems: 'center' },
  saleName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  saleDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  saleNote: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, fontStyle: 'italic' },
  saleQty: { alignItems: 'center' as const },
  saleQtyNum: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.critical },
  saleQtyLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  fab: { position: 'absolute', bottom: 24, right: 24, borderRadius: 28, ...Shadow.lg },
  fabG: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  modalOvr: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalCnt: { backgroundColor: Colors.bgCard, borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl, maxHeight: '85%', borderWidth: 1, borderColor: Colors.border },
  modalHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xxl, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTtl: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  modalBdy: { padding: Spacing.xxl },
  mGrp: { marginBottom: Spacing.md },
  mLbl: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: Spacing.xs },
  mInp: { backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, color: Colors.text, fontSize: FontSize.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  prodList: { marginBottom: Spacing.lg, gap: Spacing.xs },
  prodItem: { padding: Spacing.sm, borderRadius: BorderRadius.sm, flexDirection: 'row', justifyContent: 'space-between' },
  prodItemSel: { backgroundColor: Colors.primary + '20' },
  prodItemText: { fontSize: FontSize.sm, color: Colors.text },
  prodItemStock: { fontSize: FontSize.xs, color: Colors.textMuted },
  logBtn: { margin: Spacing.xxl, borderRadius: BorderRadius.md, overflow: 'hidden' },
  logBtnG: { paddingVertical: Spacing.lg, alignItems: 'center', borderRadius: BorderRadius.md },
  logBtnT: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
});
