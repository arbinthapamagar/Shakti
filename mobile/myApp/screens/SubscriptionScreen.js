import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { userApi } from '../api/user.api';
import { colors } from '../theme/colors';

const PLAN_INFO = {
  parent: {
    name: 'Parent plan',
    tagline: 'Daily school runs for your child',
    features: [
      'Dedicated driver assigned',
      'Live trip tracking',
      'Monthly billing',
      'Backup driver support',
      'Missed day deductions',
    ],
    price: 5000,
    period: 'month',
  },
  business: {
    name: 'Business plan',
    tagline: 'Regular delivery or commute service',
    features: [
      'Flexible pickup times',
      'Goods or passenger transport',
      'Priority driver matching',
      'Invoice billing',
      'Dedicated support',
    ],
    price: 8000,
    period: 'month',
  },
};

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function SubscriptionScreen({ onBack }) {
  const [tab, setTab] = useState('active');
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await userApi.getMySubscriptions();
      setSubscriptions(res.data || []);
    } catch {
      // keep stale
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const activeSubscription = subscriptions.find((s) => s.status === 'active' || s.status === 'paused');

  const handlePause = async (id) => {
    try {
      await userApi.pauseSubscription(id);
      setSubscriptions((prev) => prev.map((s) => s._id === id ? { ...s, status: 'paused' } : s));
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not pause subscription.');
    }
  };

  const handleResume = async (id) => {
    try {
      await userApi.resumeSubscription(id);
      setSubscriptions((prev) => prev.map((s) => s._id === id ? { ...s, status: 'active' } : s));
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not resume subscription.');
    }
  };

  const handleCancel = (id) => {
    Alert.alert('Cancel plan', 'Are you sure you want to cancel your subscription?', [
      { text: 'Keep plan', style: 'cancel' },
      {
        text: 'Cancel plan',
        style: 'destructive',
        onPress: async () => {
          try {
            await userApi.cancelSubscription(id);
            setSubscriptions((prev) => prev.map((s) => s._id === id ? { ...s, status: 'cancelled' } : s));
          } catch (err) {
            Alert.alert('Error', err.message || 'Could not cancel subscription.');
          }
        },
      },
    ]);
  };

  const handleSubscribe = async (plan) => {
    Alert.alert('Coming soon', `${PLAN_INFO[plan]?.name} sign-up flow will be available soon.`);
  };

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
        <Pressable style={[styles.tab, tab === 'active' && styles.tabActive]} onPress={() => setTab('active')}>
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>My plan</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'browse' && styles.tabActive]} onPress={() => setTab('browse')}>
          <Text style={[styles.tabText, tab === 'browse' && styles.tabTextActive]}>Browse plans</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {tab === 'active' ? (
          loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
          ) : activeSubscription ? (
            <ActiveSubscription
              sub={activeSubscription}
              onPause={() => handlePause(activeSubscription._id)}
              onResume={() => handleResume(activeSubscription._id)}
              onCancel={() => handleCancel(activeSubscription._id)}
            />
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No active plan</Text>
              <Text style={styles.emptySub}>Browse plans below to get started.</Text>
              <Pressable style={styles.browseCta} onPress={() => setTab('browse')}>
                <Text style={styles.browseCtaText}>Browse plans</Text>
              </Pressable>
            </View>
          )
        ) : (
          Object.entries(PLAN_INFO).map(([id, plan]) => (
            <PlanCard key={id} plan={{ id, ...plan }} onSubscribe={() => handleSubscribe(id)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function ActiveSubscription({ sub, onPause, onResume, onCancel }) {
  const info = PLAN_INFO[sub.plan] || {};
  return (
    <View>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroTitle}>{info.name || sub.plan}</Text>
          <View style={styles.heroStatus}>
            <View style={styles.heroStatusDot} />
            <Text style={styles.heroStatusText}>{sub.status}</Text>
          </View>
        </View>
        <Text style={styles.heroPrice}>
          Rs {sub.monthlyPrice?.toLocaleString()} <Text style={styles.heroPer}>/ month</Text>
        </Text>
        <Text style={styles.heroRenews}>Active until {formatDate(sub.endDate)}</Text>
      </View>

      {sub.plan === 'parent' && sub.childName && (
        <>
          <Text style={styles.sectionTitle}>Child</Text>
          <View style={styles.card}>
            <Row label="Name" value={sub.childName} />
            {sub.childAge != null && <Row label="Age" value={`${sub.childAge} yrs`} />}
            {sub.schoolName && <Row label="School" value={sub.schoolName} last />}
          </View>
        </>
      )}

      {sub.plan === 'business' && sub.businessName && (
        <>
          <Text style={styles.sectionTitle}>Business</Text>
          <View style={styles.card}>
            <Row label="Name" value={sub.businessName} />
            {sub.businessAddress && <Row label="Address" value={sub.businessAddress} />}
            {sub.goodsType && <Row label="Goods" value={sub.goodsType} last />}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Schedule</Text>
      <View style={styles.card}>
        <Row label="Pickup" value={`${sub.pickup?.address}${sub.pickupTime ? ` · ${sub.pickupTime}` : ''}`} />
        <Row label="Drop-off" value={`${sub.dropoff?.address}${sub.dropoffTime ? ` · ${sub.dropoffTime}` : ''}`} />
        <Row label="Vehicle" value={sub.vehicleType} last />
      </View>

      <Text style={styles.sectionTitle}>Billing</Text>
      <View style={styles.card}>
        <Row label="Started" value={formatDate(sub.startDate)} />
        <Row label="Missed days" value={String(sub.missedDays?.length ?? 0)} last />
      </View>

      {sub.status === 'paused' ? (
        <Pressable style={styles.pauseBtn} onPress={onResume}>
          <Text style={styles.pauseBtnText}>Resume subscription</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.pauseBtn} onPress={onPause}>
          <Text style={styles.pauseBtnText}>Pause subscription</Text>
        </Pressable>
      )}
      <Pressable style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.cancelBtnText}>Cancel plan</Text>
      </Pressable>
    </View>
  );
}

function PlanCard({ plan, onSubscribe }) {
  const short = plan.id === 'parent' ? 'PR' : 'BZ';
  return (
    <View style={styles.planCard}>
      <View style={styles.planBadge}>
        <Text style={styles.planBadgeText}>{short}</Text>
      </View>
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.planTag}>{plan.tagline}</Text>
      <Text style={styles.planPrice}>
        Rs {plan.price.toLocaleString()}<Text style={styles.planPer}> / {plan.period}</Text>
      </Text>
      <View style={styles.featureList}>
        {plan.features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureCheck}>✓</Text>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
      <Pressable style={styles.subscribeBtn} onPress={onSubscribe}>
        <Text style={styles.subscribeBtnText}>Subscribe</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value, last }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>{value ?? '—'}</Text>
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
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  backArrow: { width: 10, height: 10, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: colors.text, transform: [{ rotate: '45deg' }], marginLeft: 4 },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },

  tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.surfaceMuted },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#ffffff' },

  scroll: { paddingHorizontal: 16, paddingBottom: 40 },

  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  emptySub: { color: colors.textMuted, fontSize: 14, marginTop: 8 },
  browseCta: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 999 },
  browseCtaText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },

  heroCard: { backgroundColor: colors.primary, borderRadius: 18, padding: 20, marginBottom: 20 },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroTitle: { color: '#ffffff', fontSize: 20, fontWeight: '800' },
  heroStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)' },
  heroStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ffffff' },
  heroStatusText: { color: '#ffffff', fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  heroPrice: { color: '#ffffff', fontSize: 30, fontWeight: '800', marginTop: 10, letterSpacing: -1 },
  heroPer: { fontSize: 14, fontWeight: '600' },
  heroRenews: { color: '#dfeee5', fontSize: 13, marginTop: 4 },

  sectionTitle: { color: colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 16, marginBottom: 8 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { color: colors.textMuted, fontSize: 13 },
  rowValue: { color: colors.text, fontSize: 14, fontWeight: '600', maxWidth: '60%', textTransform: 'capitalize' },

  pauseBtn: { marginTop: 24, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  pauseBtnText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  cancelBtn: { marginTop: 10, paddingVertical: 14, borderRadius: 16, backgroundColor: colors.dangerSoft, alignItems: 'center' },
  cancelBtnText: { color: colors.danger, fontSize: 14, fontWeight: '700' },

  planCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 18, marginBottom: 14 },
  planBadge: { width: 44, height: 28, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  planBadgeText: { color: '#ffffff', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  planName: { color: colors.text, fontSize: 18, fontWeight: '800' },
  planTag: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  planPrice: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 12, letterSpacing: -0.5 },
  planPer: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  featureList: { marginTop: 12, gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureCheck: { color: colors.primary, fontSize: 14, fontWeight: '800', width: 16 },
  featureText: { color: colors.text, fontSize: 13, flex: 1 },
  subscribeBtn: { marginTop: 14, paddingVertical: 13, borderRadius: 999, backgroundColor: colors.primary, alignItems: 'center' },
  subscribeBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});
