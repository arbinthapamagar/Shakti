import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PaymentLogo } from '../components/Brand';
import { ArrowDownIcon, ArrowUpIcon, CheckIcon } from '../components/Icons';
import { userApi } from '../api/user.api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const PAYMENT_LABELS = {
  cash: 'Cash',
  esewa: 'eSewa',
  khalti: 'Khalti',
  wallet: 'Wallet',
};

const TYPE_LABELS = {
  trip_payment: 'Trip payment',
  trip_earning: 'Trip earning',
  subscription_payment: 'Subscription',
  wallet_topup: 'Wallet top up',
  wallet_withdrawal: 'Withdrawal',
  platform_fee: 'Platform fee',
  refund: 'Refund',
};

const TOPUP_AMOUNTS = [200, 500, 1000, 2000];

function formatDate(value) {
  const d = new Date(value);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function WalletScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance ?? 0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topUp, setTopUp] = useState(500);
  const [topping, setTopping] = useState(false);

  const handleTopUp = useCallback(async () => {
    if (topping) return;
    setTopping(true);
    try {
      await userApi.topUpWallet({ amount: topUp, method: 'esewa', gatewayRef: `MANUAL_${Date.now()}` });
      // Reload wallet after top-up
      const walletRes = await userApi.getWallet();
      setWalletBalance(walletRes.data?.walletBalance ?? 0);
      const txRes = await userApi.getTransactions();
      setTransactions(txRes.data?.transactions || txRes.data || []);
    } catch (err) {
      console.warn('Top up failed:', err.message);
    } finally {
      setTopping(false);
    }
  }, [topUp, topping]);

  const load = useCallback(async () => {
    try {
      const [walletRes, txRes] = await Promise.all([
        userApi.getWallet(),
        userApi.getTransactions(),
      ]);
      setWalletBalance(walletRes.data?.walletBalance ?? 0);
      setTransactions(txRes.data?.transactions || txRes.data || []);
    } catch {
      // keep stale data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const preferredMethod = user?.preferredPaymentMethod || 'cash';

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <Text style={styles.headerSub}>Manage your balance & payments</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available balance</Text>
        <Text style={styles.balanceAmount}>Rs {walletBalance.toLocaleString()}</Text>
        <View style={styles.balanceActions}>
          <Pressable
            style={[styles.balanceBtnPrimary, topping && { opacity: 0.6 }]}
            onPress={handleTopUp}
            disabled={topping}
          >
            <Text style={styles.balanceBtnPrimaryText}>{topping ? 'Adding…' : 'Top up'}</Text>
          </Pressable>
          <Pressable
            style={styles.balanceBtnGhost}
            onPress={() => alert('Send feature coming soon')}
          >
            <Text style={styles.balanceBtnGhostText}>Send</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick top up</Text>
        <View style={styles.topupGrid}>
          {TOPUP_AMOUNTS.map((a) => {
            const active = topUp === a;
            return (
              <Pressable
                key={a}
                onPress={() => setTopUp(a)}
                style={[styles.topupChip, active && styles.topupChipActive]}
              >
                <Text style={[styles.topupChipText, active && styles.topupChipTextActive]}>
                  Rs {a}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          style={[styles.cta, topping && { opacity: 0.6 }]}
          onPress={handleTopUp}
          disabled={topping}
        >
          <Text style={styles.ctaText}>{topping ? 'Adding…' : `Add Rs ${topUp}`}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment methods</Text>
        <View style={styles.methodList}>
          {Object.entries(PAYMENT_LABELS).map(([id, label]) => {
            const preferred = preferredMethod === id;
            return (
              <View key={id} style={styles.methodRow}>
                <PaymentLogo id={id} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodLabel}>{label}</Text>
                  <Text style={styles.methodSub}>
                    {preferred ? 'Preferred method' : 'Tap to set as preferred'}
                  </Text>
                </View>
                {preferred && (
                  <View style={styles.preferredPill}>
                    <CheckIcon size={12} color={colors.primaryDark} />
                    <Text style={styles.preferredText}>Default</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent transactions</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
        ) : transactions.length === 0 ? (
          <Text style={styles.empty}>No transactions yet.</Text>
        ) : (
          <View style={styles.txList}>
            {transactions.map((t, i) => {
              const positive = t.amount > 0;
              return (
                <View
                  key={t._id}
                  style={[styles.txRow, i === transactions.length - 1 && styles.txRowLast]}
                >
                  <View style={[styles.txIcon, positive ? styles.txIconPos : styles.txIconNeg]}>
                    {positive ? (
                      <ArrowDownIcon size={16} color={colors.primary} />
                    ) : (
                      <ArrowUpIcon size={16} color={colors.text} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txTitle}>{t.note || TYPE_LABELS[t.type] || t.type}</Text>
                    <Text style={styles.txMeta}>
                      {TYPE_LABELS[t.type]} · {PAYMENT_LABELS[t.method] || t.method}
                    </Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={[styles.txAmount, positive ? styles.txPos : styles.txNeg]}>
                      {positive ? '+' : ''}Rs {Math.abs(t.amount)}
                    </Text>
                    <Text style={styles.txDate}>{formatDate(t.createdAt)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
  headerTitle: { color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { color: colors.textMuted, fontSize: 13, marginTop: 4 },

  balanceCard: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: colors.primary,
    borderRadius: 18,
  },
  balanceLabel: { color: '#dfeee5', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  balanceAmount: { color: '#ffffff', fontSize: 34, fontWeight: '800', marginTop: 6, letterSpacing: -1 },
  balanceActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  balanceBtnPrimary: { flex: 1, paddingVertical: 12, borderRadius: 999, backgroundColor: '#ffffff', alignItems: 'center' },
  balanceBtnPrimaryText: { color: colors.primaryDark, fontSize: 14, fontWeight: '700' },
  balanceBtnGhost: { flex: 1, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center' },
  balanceBtnGhostText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { color: colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 12 },

  topupGrid: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  topupChip: { flex: 1, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.surface },
  topupChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  topupChipText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  topupChipTextActive: { color: colors.primaryDark },

  cta: { paddingVertical: 14, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center' },
  ctaText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },

  methodList: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, overflow: 'hidden' },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  methodLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  methodSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  preferredPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: colors.primarySoft },
  preferredText: { color: colors.primaryDark, fontSize: 11, fontWeight: '700' },

  txList: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, overflow: 'hidden' },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  txRowLast: { borderBottomWidth: 0 },
  txIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  txIconPos: { backgroundColor: colors.primarySoft },
  txIconNeg: { backgroundColor: colors.surfaceMuted },
  txTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  txMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 14, fontWeight: '800' },
  txPos: { color: colors.primary },
  txNeg: { color: colors.text },
  txDate: { color: colors.textFaint, fontSize: 11, marginTop: 2 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 16, fontSize: 14 },
});
