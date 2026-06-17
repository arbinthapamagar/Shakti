import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { bidApi } from '../../api/trip.api';
import { userApi } from '../../api/user.api';
import { colors, radius, shadow, spacing, STATUS_TOP_PAD, type } from '../../theme';

function money(n) {
  return `NPR ${Number(n || 0).toLocaleString()}`;
}

const BID_STATUS_COLOR = {
  accepted: colors.primary,
  pending: colors.warn,
  rejected: colors.danger,
  expired: colors.textFaint,
};

export default function DriverEarnings() {
  const [stats, setStats] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [earnRes, bidRes] = await Promise.all([
        userApi.getMyEarnings(),
        bidApi.getMyBids({ limit: 20 }),
      ]);
      setStats(earnRes.data);
      setBids(bidRes.data?.bids || []);
    } catch {
      // leave previous data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(); }}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={styles.title}>Earnings</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Total earnings</Text>
        <Text style={styles.heroValue}>{money(stats?.earnings)}</Text>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats?.totalRides ?? 0}</Text>
          <Text style={styles.statLabel}>Rides</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {stats?.totalRatings ? Number(stats.rating).toFixed(1) : '—'}
          </Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats?.cancelledRides ?? 0}</Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent bids</Text>
      {bids.length === 0 ? (
        <Text style={styles.empty}>No bids yet. Go online and start bidding on trips.</Text>
      ) : (
        bids.map((b) => (
          <View key={b._id} style={styles.bidRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bidRoute} numberOfLines={1}>
                {b.tripId?.pickup?.address || 'Trip'} → {b.tripId?.dropoff?.address || ''}
              </Text>
              <Text style={styles.bidMeta}>{money(b.amount)}</Text>
            </View>
            <Text style={[styles.bidStatus, { color: BID_STATUS_COLOR[b.status] || colors.textMuted }]}>
              {b.status}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceMuted },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.xl, paddingTop: STATUS_TOP_PAD, paddingBottom: spacing.xxl },
  title: { ...type.h1, color: colors.text, marginBottom: spacing.lg },

  heroCard: {
    backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.xl,
    ...shadow.card,
  },
  heroLabel: { ...type.caption, color: 'rgba(255,255,255,0.8)' },
  heroValue: { ...type.h1, color: '#fff', marginTop: 4 },

  statRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  statBox: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center',
  },
  statValue: { ...type.h2, color: colors.text },
  statLabel: { ...type.caption, color: colors.textMuted, marginTop: 2 },

  sectionTitle: { ...type.bodyBold, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  empty: { ...type.body, color: colors.textMuted },

  bidRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.sm,
  },
  bidRoute: { ...type.body, color: colors.text },
  bidMeta: { ...type.caption, color: colors.textMuted, marginTop: 2 },
  bidStatus: { ...type.caption, fontWeight: '800', textTransform: 'capitalize' },
});
