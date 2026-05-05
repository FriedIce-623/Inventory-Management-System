import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { ShopRegister } from '../../services/types';

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<ShopRegister>({
    shop_name: '',
    owner_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    district: '',
    pincode: '',
    gstin: '',
  });

  const updateField = (key: keyof ShopRegister, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const validateStep1 = () => {
    if (!form.shop_name.trim()) return 'Shop name is required';
    if (!form.owner_name.trim()) return 'Owner name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!form.password || form.password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleNext = () => {
    const error = validateStep1();
    if (error) {
      Alert.alert('Missing Information', error);
      return;
    }
    setStep(2);
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(form);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    key: keyof ShopRegister,
    icon: keyof typeof Ionicons.glyphMap,
    options?: {
      keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
      secureTextEntry?: boolean;
      autoCapitalize?: 'none' | 'sentences' | 'words';
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name={icon} size={18} color={Colors.textMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={label}
          placeholderTextColor={Colors.textMuted}
          value={form[key] || ''}
          onChangeText={(v) => updateField(key, v)}
          autoCapitalize={options?.autoCapitalize || 'sentences'}
          keyboardType={options?.keyboardType || 'default'}
          secureTextEntry={options?.secureTextEntry}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step === 2 ? setStep(1) : router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Register Shop</Text>
          <Text style={styles.headerSubtitle}>Step {step} of 2</Text>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: step === 1 ? '50%' : '100%' }]} />
          </View>
        </View>

        {/* Form Card */}
        <View style={[styles.card, Shadow.md]}>
          {step === 1 ? (
            <>
              <Text style={styles.cardTitle}>Shop Details</Text>
              {renderInput('Shop Name', 'shop_name', 'storefront-outline', { autoCapitalize: 'words' })}
              {renderInput('Owner Name', 'owner_name', 'person-outline', { autoCapitalize: 'words' })}
              {renderInput('Email', 'email', 'mail-outline', { keyboardType: 'email-address', autoCapitalize: 'none' })}
              {renderInput('Password', 'password', 'lock-closed-outline', { secureTextEntry: true, autoCapitalize: 'none' })}
              {renderInput('Phone', 'phone', 'call-outline', { keyboardType: 'phone-pad' })}

              <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.btnGradient}
                >
                  <Text style={styles.btnText}>Next</Text>
                  <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Address & Tax</Text>
              {renderInput('Address', 'address', 'location-outline')}
              {renderInput('City', 'city', 'business-outline', { autoCapitalize: 'words' })}
              {renderInput('District', 'district', 'map-outline', { autoCapitalize: 'words' })}
              {renderInput('State', 'state', 'flag-outline', { autoCapitalize: 'words' })}
              {renderInput('Pincode', 'pincode', 'navigate-outline', { keyboardType: 'numeric' })}
              {renderInput('GSTIN', 'gstin', 'document-text-outline', { autoCapitalize: 'none' })}

              <TouchableOpacity
                style={[styles.nextBtn, loading && { opacity: 0.6 }]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.success, '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.btnGradient}
                >
                  <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                  <Text style={styles.btnText}>{loading ? 'Creating...' : 'Create Shop'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, padding: Spacing.xxl },
  header: { marginBottom: Spacing.xxl, marginTop: Spacing.huge },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  headerSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  progressBar: {
    height: 4, backgroundColor: Colors.bgElevated, borderRadius: 2, marginTop: Spacing.lg, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: Colors.primary, borderRadius: 2,
  },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: BorderRadius.xl,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.xxl,
  },
  cardTitle: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.xl,
  },
  inputGroup: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: Spacing.xs },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgInput, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  inputIcon: { paddingLeft: Spacing.md },
  input: {
    flex: 1, color: Colors.text, fontSize: FontSize.md,
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
  },
  nextBtn: { marginTop: Spacing.lg, borderRadius: BorderRadius.md, overflow: 'hidden' },
  btnGradient: {
    paddingVertical: Spacing.lg, alignItems: 'center', borderRadius: BorderRadius.md,
    flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm,
  },
  btnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxl },
  loginText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  loginLink: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
});
