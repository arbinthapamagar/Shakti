import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ACTIVE_SUBSCRIPTION, SUBSCRIPTION_PLANS } from '../data/mockData';
import { colors } from '../theme/colors';

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function SubscriptionScreen({ onBack }) {
  const [tab, setTab] = useState('active');

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
          <View style={styles.backArrow} />
        </Pressable>
        <Text style={styles.headerTitle}>Subscriptions</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, tab === 'active' && styles.tabActive]}
          onPress={() => setTab('active')}
        >
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>
            My plan
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === 'browse' && styles.tabActive]}
          onPress={() => setTab('browse')}
        >
          <Text style={[styles.tabText, tab === 'browse' && styles.tabTextActive]}>
            Browse plans
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'active' ? (
          <ActiveSubscription />
        ) : (
          SUBSCRIPTION_PLANS.map((p) => <PlanCard key={p.id} plan={p} />)
        )}
      </ScrollView>
    </View>
  );
}

function ActiveSubscription() {
  const s = ACTIVE_SUBSCRIPTION;
  return (
    <View>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroTitle}>Parent plan</Text>
          <View style={styles.heroStatus}>
            <View style={styles.heroStatusDot} />
            <Text style={styles.heroStatusText}>{s.status}</Text>
          </View>
        </View>
        <Text style={styles.heroPrice}>
          Rs {s.monthlyPrice.toLocaleString()} <Text style={styles.heroPer}>/ month</Text>
        </Text>
        <Text style={styles.heroRenews}>
          Active until {formatDate(s.endDate)}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Child</Text>
      <View style={styles.card}>
        <Row label="Name" value={s.childName} />
        <Row label="Age" value={`${s.childAge} yrs`} />
        <Row label="School" value={s.schoolName} last />
      </View>

      <Text style={styles.sectionTitle}>Schedule</Text>
      <View style={styles.card}>
        <Row label="Pickup" value={`${s.pickup.address} · ${s.pickupTime}`} />
        <Row label="Drop-off" value={`${s.dropoff.address} · ${s.dropoffTime}`} />
        <Row label="Vehicle" value={s.vehicleType} last />
      </View>

      <Text style={styles.sectionTitle}>Driver</Text>
      <View style={styles.card}>
        <Row label="Primary" value={s.primaryDriver.name} />
        <Row label="Rating" value={`★ ${s.primaryDriver.rating.toFixed(2)}`} />
        <Row label="Plate" value={s.primaryDriver.vehiclePlate} last />
      </View>

      <Text style={styles.sectionTitle}>Billing</Text>
      <View style={styles.card}>
        <Row label="Started" value={formatDate(s.startDate)} />
        <Row label="Missed days" value={String(s.missedDays.length)} />
        <Row
          label="Next bill"
          value={`Rs ${(s.monthlyPrice - s.missedDays.length * 250).toLocaleString()}`}
          last
        />
      </View>

      <Pressable style={styles.pauseBtn}>
        <Text style={styles.pauseBtnText}>Pause subscription</Text>
      </Pressable>
      <Pressable style={styles.cancelBtn}>
        <Text style={styles.cancelBtnText}>Cancel plan</Text>
      </Pressable>
    </View>
  );
}

function PlanCard({ plan }) {
  const short = plan.id === 'parent' ? 'PR' : 'BZ';
  return (
    <View style={styles.planCard}>
      <View style={styles.planBadge}>
        <Text style={styles.planBadgeText}>{short}</Text>
      </View>
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.planTag}>{plan.tagline}</Text>
      <Text style={styles.planPrice}>
        Rs {plan.price.toLocaleString()}
        <Text style={styles.planPer}> / {plan.period}</Text>
      </Text>
      <View style={styles.featureList}>
        {plan.features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureCheck}>✓</Text>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
      <Pressable style={styles.subscribeBtn}>
        <Text style={styles.subscribeBtnText}>Subscribe</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value, last }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.text,
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },

  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#ffffff' },

  scroll: { paddingHorizontal: 16, paddingBottom: 40 },

  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: { color: '#ffffff', fontSize: 20, fontWeight: '800' },
  heroStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ffffff' },
  heroStatusText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  heroPrice: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 10,
    letterSpacing: -1,
  },
  heroPer: { fontSize: 14, fontWeight: '600' },
  heroRenews: { color: '#dfeee5', fontSize: 13, marginTop: 4 },

  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { color: colors.textMuted, fontSize: 13 },
  rowValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '60%',
    textTransform: 'capitalize',
  },

  pauseBtn: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  pauseBtnText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  cancelBtn: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
  },
  cancelBtnText: { color: colors.danger, fontSize: 14, fontWeight: '700' },

  planCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  planBadge: {
    width: 44,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  planBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planName: { color: colors.text, fontSize: 18, fontWeight: '800' },
  planTag: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  planPrice: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 12,
    letterSpacing: -0.5,
  },
  planPer: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  featureList: { marginTop: 12, gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureCheck: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    width: 16,
  },
  featureText: { color: colors.text, fontSize: 13, flex: 1 },
  subscribeBtn: {
    marginTop: 14,
    paddingVertical: 13,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  subscribeBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});
