import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { VehiclePhoto } from '../../components/Brand';
import { StarIcon } from '../../components/Icons';
import { Sheet } from '../../components/ui';
import { BIDS, NEARBY_DRIVERS } from '../../data/mockData';
import { colors, radius, spacing, type } from '../../theme';

const BID_STAGGER_MS = 1200;

function diffLabel(amount, offered) {
  const diff = amount - offered;
  if (diff === 0) return 'matches';
  return diff > 0 ? `+Rs ${diff}` : `−Rs ${-diff}`;
}

function diffStyle(amount, offered) {
  const diff = amount - offered;
  if (diff === 0) return styles.diffSame;
  if (diff > 0) return styles.diffHigh;
  return styles.diffLow;
}

export default function BiddingSheet({ vehicle, offeredPrice, onAccept, onCancel }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const [bids, setBids] = useState([]);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    const timers = BIDS.map((b, i) =>
      setTimeout(() => {
        setBids((prev) => [...prev, b]);
      }, BID_STAGGER_MS * (i + 1)),
    );
    const tick = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(tick);
    };
  }, []);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.6] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <Sheet tall>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Receiving bids</Text>
          <Text style={styles.sub}>
            Your offer Rs {offeredPrice} · {vehicle?.name}
          </Text>
        </View>
        <View style={styles.timer}>
          <Text style={styles.timerText}>{seconds}s</Text>
        </View>
      </View>

      <View style={styles.pulseStage}>
        <Animated.View
          style={[styles.pulseRing, { transform: [{ scale }], opacity }]}
        />
        <View style={styles.pulseCore} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
        {bids.length === 0 ? (
          <Text style={styles.waiting}>Waiting for drivers nearby…</Text>
        ) : (
          bids.map((b) => {
            const driver = NEARBY_DRIVERS.find((d) => d._id === b.driverId);
            if (!driver) return null;
            const initials = driver.name
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2);
            return (
              <View key={b._id} style={styles.bidCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                  <View style={styles.avatarBadge}>
                    <VehiclePhoto type={driver.vehicleType} size={20} />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.bidTopRow}>
                    <Text style={styles.bidName}>{driver.name}</Text>
                    <View style={styles.ratingPill}>
                      <StarIcon size={11} />
                      <Text style={styles.ratingText}>
                        {driver.rating.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.bidMeta} numberOfLines={1}>
                    {driver.vehicleColor} {driver.vehicleModel} · {driver.eta} min away
                  </Text>
                  {b.message ? (
                    <Text style={styles.bidMessage}>"{b.message}"</Text>
                  ) : null}
                </View>
                <View style={styles.bidRight}>
                  <Text style={styles.bidAmount}>Rs {b.amount}</Text>
                  <Text style={[styles.diffBase, diffStyle(b.amount, offeredPrice)]}>
                    {diffLabel(b.amount, offeredPrice)}
                  </Text>
                  <Pressable style={styles.accept} onPress={() => onAccept(b)}>
                    <Text style={styles.acceptText}>Accept</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Pressable style={styles.cancel} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancel request</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heading: { ...type.display, fontSize: 28, color: colors.text },
  sub: { ...type.small, color: colors.textMuted, marginTop: 2 },
  timer: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  timerText: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },

  pulseStage: {
    alignSelf: 'center',
    marginVertical: spacing.sm,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
  },
  pulseCore: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: '#ffffff',
  },

  waiting: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.lg,
  },

  bidCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm + 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: { color: colors.primaryDark, fontSize: 14, fontWeight: '800' },
  avatarBadge: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  bidName: { ...type.bodyBold, color: colors.text, fontWeight: '700', flex: 1 },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: '#fff7e6',
  },
  ratingText: { color: '#8a5a14', fontSize: 11, fontWeight: '800' },
  bidMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  bidMessage: { color: colors.text, fontSize: 12, marginTop: 4, fontStyle: 'italic' },

  bidRight: { alignItems: 'flex-end', gap: 4 },
  bidAmount: { color: colors.text, fontSize: 16, fontWeight: '800' },
  diffBase: { fontSize: 11, fontWeight: '700' },
  diffSame: { color: colors.textMuted },
  diffHigh: { color: colors.danger },
  diffLow: { color: colors.primary },
  accept: {
    marginTop: 4,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  acceptText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },

  cancel: { marginTop: spacing.md - 2, paddingVertical: spacing.md + 2, alignItems: 'center' },
  cancelText: { color: colors.text, fontSize: 14, fontWeight: '600' },
});
