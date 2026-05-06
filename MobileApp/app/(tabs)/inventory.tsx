import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Modal, ScrollView, Alert, RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { inventoryAPI } from '../../services/api';
import { ProductOut, ProductCreate, getStockStatus } from '../../services/types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import ProductListItem from '../../components/ProductListItem';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function InventoryScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductOut[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newProduct, setNewProduct] = useState<ProductCreate>({
    product_name: '', category: '', unit: 'units',
    current_stock: 0, reorder_threshold: 10,
  });

  const fetchProducts = useCallback(async () => {
    try {
      const data = await inventoryAPI.getProducts();
      setProducts(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); fetchProducts(); }, [fetchProducts]));

  const handleAddProduct = async () => {
    if (!newProduct.product_name.trim()) { Alert.alert('Error', 'Product name is required'); return; }
    setAddLoading(true);
    try {
      await inventoryAPI.addProduct(newProduct);
      setShowAddModal(false);
      setNewProduct({ product_name: '', category: '', unit: 'units', current_stock: 0, reorder_threshold: 10 });
      fetchProducts();
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setAddLoading(false); }
  };

  const filtered = products.filter(p =>
    p.product_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading && !refreshing) return <LoadingSpinner fullscreen message="Loading inventory..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <Text style={styles.subtitle}>{products.length} products</Text>
      </View>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput style={styles.searchInput} placeholder="Search products..." placeholderTextColor={Colors.textMuted} value={search} onChangeText={setSearch} />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={Colors.textMuted} /></TouchableOpacity> : null}
      </View>
      <FlatList data={filtered} keyExtractor={i => i.product_id}
        renderItem={({ item }) => <ProductListItem product={item} onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.product_id } })} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="cube-outline" title="No products found" subtitle={search ? "Try different search" : "Add your first product"} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProducts(); }} tintColor={Colors.primary} />}
      />
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)} activeOpacity={0.8}>
        <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.fabG}><Ionicons name="add" size={28} color={Colors.white} /></LinearGradient>
      </TouchableOpacity>
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOvr}>
          <View style={[styles.modalCnt, Shadow.lg]}>
            <View style={styles.modalHdr}>
              <Text style={styles.modalTtl}>Add Product</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBdy} keyboardShouldPersistTaps="handled">
              {[
                { l: 'Product Name *', k: 'product_name' },
                { l: 'Category', k: 'category' },
                { l: 'SKU Code', k: 'sku_code' },
                { l: 'Unit', k: 'unit' },
              ].map(({ l, k }) => (
                <View key={k} style={styles.mGrp}>
                  <Text style={styles.mLbl}>{l}</Text>
                  <TextInput style={styles.mInp} value={String((newProduct as any)[k] || '')} placeholderTextColor={Colors.textMuted}
                    onChangeText={v => setNewProduct(p => ({ ...p, [k]: v }))} />
                </View>
              ))}
              <View style={styles.mRow}>
                {[
                  { l: 'Stock', k: 'current_stock' },
                  { l: 'Initial Threshold', k: 'reorder_threshold' },
                ].map(({ l, k }) => (
                  <View key={k} style={{ flex: 1 }}>
                    <View style={styles.mGrp}>
                      <Text style={styles.mLbl}>{l}</Text>
                      <TextInput style={styles.mInp} value={String((newProduct as any)[k] ?? '')} keyboardType="numeric" placeholderTextColor={Colors.textMuted}
                        onChangeText={v => setNewProduct(p => ({ ...p, [k]: Number(v) || 0 }))} />
                    </View>
                  </View>
                ))}
              </View>
              <Text style={styles.mHint}>🤖 AI will auto-adjust the threshold once you have sales data</Text>
              <View style={styles.mRow}>
                {[
                  { l: 'Cost Price ₹', k: 'cost_price' },
                  { l: 'Sell Price ₹', k: 'selling_price' },
                ].map(({ l, k }) => (
                  <View key={k} style={{ flex: 1 }}>
                    <View style={styles.mGrp}>
                      <Text style={styles.mLbl}>{l}</Text>
                      <TextInput style={styles.mInp} value={(newProduct as any)[k] != null ? String((newProduct as any)[k]) : ''} keyboardType="numeric" placeholderTextColor={Colors.textMuted}
                        onChangeText={v => setNewProduct(p => ({ ...p, [k]: v ? Number(v) : undefined }))} />
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity style={[styles.addBtn, addLoading && { opacity: 0.6 }]} onPress={handleAddProduct} disabled={addLoading}>
              <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.addBtnG}>
                <Text style={styles.addBtnT}>{addLoading ? 'Adding...' : 'Add Product'}</Text>
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
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, marginHorizontal: Spacing.xl, marginBottom: Spacing.lg, paddingHorizontal: Spacing.md, gap: Spacing.sm },
  searchInput: { flex: 1, color: Colors.text, fontSize: FontSize.md, paddingVertical: Spacing.sm },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },
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
  mRow: { flexDirection: 'row', gap: Spacing.md },
  mHint: { fontSize: FontSize.xs, color: Colors.info, marginBottom: Spacing.md, fontStyle: 'italic' },
  addBtn: { margin: Spacing.xxl, borderRadius: BorderRadius.md, overflow: 'hidden' },
  addBtnG: { paddingVertical: Spacing.lg, alignItems: 'center', borderRadius: BorderRadius.md },
  addBtnT: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
});
