import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { cleanImei, isValidImei, formatImeiDisplay } from '@tekshir/shared';

const API_URL = 'http://10.0.2.2:4000/api/v1'; // Android Emulator localhost (or localhost:4000)

export default function App() {
  const [activeTab, setActiveTab] = useState<'VERIFY' | 'HISTORY' | 'PACKAGES'>('VERIFY');
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [imei, setImei] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  // Auth modal
  const [authVisible, setAuthVisible] = useState(false);
  const [phone, setPhone] = useState('+998907778899');
  const [code, setCode] = useState('7777');

  const cleaned = cleanImei(imei);
  const isLuhnValid = cleaned.length === 15 && isValidImei(cleaned);

  // Auto login demo user on start
  useEffect(() => {
    handleLogin();
    loadPackages();
  }, []);

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (data.accessToken) {
        setToken(data.accessToken);
        setUser(data.user);
        setAuthVisible(false);
      }
    } catch {
      // Offline fallback demo user
      setUser({ name: 'Alisher Test', phone: '+998907778899', credits: 10 });
    }
  };

  const loadPackages = async () => {
    try {
      const res = await fetch(`${API_URL}/packages`);
      const data = await res.json();
      if (Array.isArray(data)) setPackages(data);
    } catch {
      setPackages([
        { id: '1', name: '1 ta tekshiruv', credits: 1, price: 5000 },
        { id: '2', name: '5 ta tekshiruv', credits: 5, price: 20000 },
        { id: '3', name: '10 ta tekshiruv', credits: 10, price: 35000 },
      ]);
    }
  };

  const loadHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/verifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerify = async () => {
    if (!isLuhnValid) {
      Alert.alert('Xato', '15 xonali to‘g‘ri IMEI raqamini kiriting');
      return;
    }

    if (!user || user.credits <= 0) {
      Alert.alert('Kredit yetarli emas', 'Tekshirish uchun paket xarid qiling', [
        { text: 'Paketlar', onPress: () => setActiveTab('PACKAGES') },
        { text: 'Bekor qilish' },
      ]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/verifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ imei: cleaned }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Xatolik');
      }

      setResult(data);
      setUser((prev: any) => ({ ...prev, credits: data.creditsRemaining }));
    } catch (err: any) {
      Alert.alert('Xatolik', err.message || 'Tekshirish imkoni bo‘lmadi');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPackage = async (pkg: any) => {
    if (!token) {
      setAuthVisible(true);
      return;
    }

    try {
      const orderRes = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packageId: pkg.id, provider: 'PAYME' }),
      });
      const order = await orderRes.json();

      // Complete payment
      const payRes = await fetch(`${API_URL}/payments/${order.paymentId}/complete`, {
        method: 'POST',
      });
      const payData = await payRes.json();

      setUser((prev: any) => ({ ...prev, credits: payData.balanceAfter }));
      Alert.alert('Muvaffaqiyatli!', `${pkg.name} uchun to‘lov qabul qilindi. Balans: ${payData.balanceAfter} ta tekshiruv.`);
      setActiveTab('VERIFY');
    } catch (err: any) {
      Alert.alert('To‘lovda xatolik', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logoTitle}>TEKSHIR</Text>
          <Text style={styles.logoSubtitle}>IMEI Verification</Text>
        </View>

        {user && (
          <TouchableOpacity
            style={styles.creditBadge}
            onPress={() => setActiveTab('PACKAGES')}
          >
            <Text style={styles.creditBadgeText}>🪙 {user.credits ?? 0} ta</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'VERIFY' && styles.navItemActive]}
          onPress={() => setActiveTab('VERIFY')}
        >
          <Text style={[styles.navText, activeTab === 'VERIFY' && styles.navTextActive]}>
            Tekshirish
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'HISTORY' && styles.navItemActive]}
          onPress={() => {
            setActiveTab('HISTORY');
            loadHistory();
          }}
        >
          <Text style={[styles.navText, activeTab === 'HISTORY' && styles.navTextActive]}>
            Tarix
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'PACKAGES' && styles.navItemActive]}
          onPress={() => setActiveTab('PACKAGES')}
        >
          <Text style={[styles.navText, activeTab === 'PACKAGES' && styles.navTextActive]}>
            Tariflar
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* TAB 1: VERIFY */}
        {activeTab === 'VERIFY' && (
          <View>
            <Text style={styles.heroTitle}>Telefon holatini tekshiring</Text>
            <Text style={styles.heroDesc}>
              Xarid qilishdan oldin IMEI orqali muddatli to‘lov qarzini aniqlang.
            </Text>

            <View style={styles.card}>
              <Text style={styles.label}>15 xonali IMEI raqami:</Text>
              <TextInput
                style={[
                  styles.input,
                  isLuhnValid ? styles.inputValid : cleaned.length === 15 ? styles.inputInvalid : null,
                ]}
                keyboardType="numeric"
                maxLength={18}
                value={formatImeiDisplay(cleaned)}
                onChangeText={(t) => setImei(cleanImei(t).slice(0, 15))}
                placeholder="3560 0000 0000 000"
              />

              <View style={styles.validationRow}>
                <Text style={styles.validationText}>
                  {isLuhnValid
                    ? '✅ To‘g‘ri IMEI (Luhn tasdiqlangan)'
                    : cleaned.length === 15
                    ? '❌ Nazorat raqami noto‘g‘ri'
                    : `${cleaned.length}/15 ta raqam`}
                </Text>

                <View style={styles.sampleButtons}>
                  <TouchableOpacity onPress={() => setImei('356111111111113')}>
                    <Text style={styles.sampleText}>[Faol IMEI]</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setImei('356777777777775')}>
                    <Text style={[styles.sampleText, { color: '#059669' }]}>[Toza IMEI]</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, (!isLuhnValid || loading) && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={!isLuhnValid || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>QURILMANI TEKSHIRISH</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Verification Result Display */}
            {result && (
              <View
                style={[
                  styles.resultCard,
                  result.result === 'ACTIVE_INSTALLMENT'
                    ? styles.resultCardAlert
                    : result.result === 'CLEAR'
                    ? styles.resultCardClear
                    : styles.resultCardWarn,
                ]}
              >
                <Text style={styles.resultTitle}>{result.title}</Text>
                <Text style={styles.resultMsg}>{result.message}</Text>
                <View style={styles.resultDetails}>
                  <Text style={styles.resultDetailItem}>Qurilma: {result.maskedImei}</Text>
                  <Text style={styles.resultDetailItem}>Qolgan kreditlar: {result.creditsRemaining} ta</Text>
                  <Text style={styles.resultDetailItem}>ID: {result.requestId}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'HISTORY' && (
          <View>
            <Text style={styles.sectionTitle}>Tekshiruvlar Tarixi</Text>
            {history.length === 0 ? (
              <Text style={styles.emptyText}>Hozircha tekshiruvlar yo‘q</Text>
            ) : (
              history.map((h) => (
                <View key={h.id} style={styles.historyCard}>
                  <Text style={styles.historyImei}>{h.maskedImei}</Text>
                  <Text
                    style={[
                      styles.historyBadge,
                      h.status === 'ACTIVE_INSTALLMENT'
                        ? styles.badgeAlert
                        : styles.badgeClear,
                    ]}
                  >
                    {h.status === 'ACTIVE_INSTALLMENT' ? '🔴 MUDDATLI TO‘LOV FAOL' : '🟢 TOZA'}
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(h.createdAt).toLocaleDateString('uz-UZ')}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: PACKAGES */}
        {activeTab === 'PACKAGES' && (
          <View>
            <Text style={styles.sectionTitle}>Tekshiruv Paketlari</Text>
            <Text style={styles.sectionSubtitle}>
              Kreditlar muddatsiz saqlanadi. Xato natijada sarflanmaydi.
            </Text>

            {packages.map((p) => (
              <View key={p.id} style={styles.packageCard}>
                <View>
                  <Text style={styles.packageName}>{p.name}</Text>
                  <Text style={styles.packageCredits}>{p.credits} ta muvaffaqiyatli tekshiruv</Text>
                </View>
                <TouchableOpacity
                  style={styles.packageBtn}
                  onPress={() => handleBuyPackage(p)}
                >
                  <Text style={styles.packageBtnText}>{p.price?.toLocaleString('uz-UZ')} so‘m</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logoTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a' },
  logoSubtitle: { fontSize: 10, color: '#64748b' },
  creditBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  creditBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#78350f' },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  navItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  navItemActive: { borderBottomWidth: 2, borderBottomColor: '#2563eb' },
  navText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  navTextActive: { color: '#2563eb', fontWeight: 'bold' },
  content: { padding: 20 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a', marginBottom: 6 },
  heroDesc: { fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 18 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  label: { fontSize: 13, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  input: {
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  inputValid: { borderColor: '#10b981', backgroundColor: '#ecfdf5' },
  inputInvalid: { borderColor: '#f43f5e', backgroundColor: '#fff1f2' },
  validationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  validationText: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  sampleButtons: { flexDirection: 'row', gap: 8 },
  sampleText: { fontSize: 11, color: '#f43f5e', fontWeight: 'bold' },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: { backgroundColor: '#cbd5e1' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  resultCard: { borderRadius: 20, padding: 18, borderWidth: 1, marginTop: 10 },
  resultCardAlert: { backgroundColor: '#fff1f2', borderColor: '#fecdd3' },
  resultCardClear: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  resultCardWarn: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  resultTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 6 },
  resultMsg: { fontSize: 13, color: '#334155', lineHeight: 18, marginBottom: 12 },
  resultDetails: { borderTopWidth: 1, borderTopColor: '#00000010', paddingTop: 8 },
  resultDetailItem: { fontSize: 11, color: '#64748b', marginTop: 2 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', marginBottom: 4 },
  sectionSubtitle: { fontSize: 12, color: '#64748b', marginBottom: 16 },
  emptyText: { textAlign: 'center', color: '#94a3b8', padding: 40 },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  historyImei: { fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace', color: '#0f172a' },
  historyBadge: { fontSize: 10, fontWeight: 'bold', marginVertical: 4 },
  badgeAlert: { color: '#e11d48' },
  badgeClear: { color: '#059669' },
  historyDate: { fontSize: 10, color: '#94a3b8' },
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  packageName: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
  packageCredits: { fontSize: 11, color: '#64748b', marginTop: 2 },
  packageBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  packageBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});
