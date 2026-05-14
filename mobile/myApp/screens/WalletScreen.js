import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  PaymentBadge,
  PlusIcon,
} from '../components/Icons';
import { CURRENT_USER, TRANSACTIONS } from '../data/mockData';
import { colors } from '../theme/colors';

const PAYMENT_LABELS = {
  cash: 'Cash',
  esewa: 'eSewa',
  khalti: 'Khalti',
  wallet: 'Shakti wallet',
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

function formatDate(value) {
  const d = new Date(value);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const TOPUP_AMOUNTS = [200, 500, 1000, 2000];

export default function WalletScreen() {
  const [topUp, setTopUp] = useState(500);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <Text style={styles.headerSub}>Manage your balance & payments</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available balance</Text>
        <Text style={styles.balanceAmount}>
          Rs {CURRENT_USER.walletBalance.toLocaleString()}
        </Text>
        <View style={styles.balanceActions}>
          <Pressable style={styles.balanceBtnPrimary}>
            <Text style={styles.balanceBtnPrimaryText}>Top up</Text>
          </Pressable>
          <Pressable style={styles.balanceBtnGhost}>
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
                <Text
                  style={[
                    styles.topupChipText,
                    active && styles.topupChipTextActive,
                  ]}
                >
                  Rs {a}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.cta}>
          <Text style={styles.ctaText}>Add Rs {topUp}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment methods</Text>
        <View style={styles.methodList}>
          {Object.entries(PAYMENT_LABELS).map(([id, label]) => {
            const preferred = CURRENT_USER.preferredPaymentMethod === id;
            return (
              <View key={id} style={styles.methodRow}>
                <View style={styles.methodIcon}>
                  <PaymentBadge id={id} size={22} />
                </View>
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
        <View style={styles.txList}>
          {TRANSACTIONS.map((t, i) => {
            const positive = t.amount > 0;
            return (
              <View
                key={t._id}
                style={[
                  styles.txRow,
                  i === TRANSACTIONS.length - 1 && styles.txRowLast,
                ]}
              >
                <View
                  style={[
                    styles.txIcon,
                    positive ? styles.txIconPos : styles.txIconNeg,
                  ]}
                >
                  {positive ? (
                    <ArrowDownIcon size={16} color={colors.primary} />
                  ) : (
                    <ArrowUpIcon size={16} color={colors.text} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txTitle}>{t.note}</Text>
                  <Text style={styles.txMeta}>
                    {TYPE_LABELS[t.type]} · {PAYMENT_LABELS[t.method]}
                  </Text>
                </View>
                <View style={styles.txRight}>
                  <Text
                    style={[
                      styles.txAmount,
                      positive ? styles.txPos : styles.txNeg,
                    ]}
                  >
                    {positive ? '+' : ''}Rs {Math.abs(t.amount)}
                  </Text>
                  <Text style={styles.txDate}>{formatDate(t.createdAt)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 40 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: { color: colors.textMuted, fontSize: 13, marginTop: 4 },

  balanceCard: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: colors.primary,
    borderRadius: 18,
  },
  balanceLabel: {
    color: '#dfeee5',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: -1,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  balanceBtnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  balanceBtnPrimaryText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
  balanceBtnGhost: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
  },
  balanceBtnGhostText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },

  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  topupGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  topupChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  topupChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  topupChipText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  topupChipTextActive: { color: colors.primaryDark },

  cta: {
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  ctaText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },

  methodList: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    overflow: 'hidden',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  methodSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  preferredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  preferredText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },

  txList: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  txRowLast: { borderBottomWidth: 0 },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txIconPos: { backgroundColor: colors.primarySoft },
  txIconNeg: { backgroundColor: colors.surfaceMuted },
  txTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  txMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 14, fontWeight: '800' },
  txPos: { color: colors.primary },
  txNeg: { color: colors.text },
  txDate: { color: colors.textFaint, fontSize: 11, marginTop: 2 },
});
