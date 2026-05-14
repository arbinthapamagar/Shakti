import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { VehiclePhoto } from '../../components/Brand';
import { ChevronIcon, SearchIcon } from '../../components/Icons';
import { CURRENT_USER } from '../../data/mockData';
import { colors, radius, spacing, STATUS_TOP_PAD, type } from '../../theme';
import BrandLogo from './BrandLogo';
import Map from './Map';
import { HOME_REFRESH_MS } from './constants';

const SERVICES = [
  { id: 'rickshaw', label: 'Rickshaw', sub: 'Local', type: 'tuktuk' },
  { id: 'scooter', label: 'EV Scooter', sub: 'Eco', type: 'scooter' },
  { id: 'delivery', label: 'Delivery', sub: 'Parcels', type: 'tuktuk_delivery' },
  { id: 'subscribe', label: 'Subscribe', sub: 'Daily', type: 'bike' },
];

const SAVED_PLACE_ICON = {
  home: 'home',
  work: 'briefcase',
};

function savedPlaceIcon(label) {
  return SAVED_PLACE_ICON[label] || 'location';
}

export default function HomeView({ onOpenProfile, onTapSearch, onPickSaved }) {
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState('rickshaw');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), HOME_REFRESH_MS);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <BrandLogo />
        <Pressable style={styles.avatarBtn} onPress={onOpenProfile} hitSlop={8}>
          <Text style={styles.avatarLetter}>
            {CURRENT_USER.name.charAt(0)}
          </Text>
        </Pressable>
      </View>

      <View style={styles.mapBand}>
        <Map step="home" />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <Pressable style={styles.searchBar} onPress={onTapSearch}>
          <SearchIcon size={18} color={colors.text} />
          <Text style={styles.searchPlaceholder}>Search destination</Text>
          <View style={styles.searchTrail}>
            <Text style={styles.searchLater}>Later</Text>
          </View>
        </Pressable>

        <View style={styles.serviceGrid}>
          {SERVICES.map((s) => {
            const active = s.id === selected;
            return (
              <Pressable
                key={s.id}
                onPress={() => setSelected(s.id)}
                style={[styles.serviceTile, active && styles.serviceTileActive]}
              >
                <VehiclePhoto type={s.type} size={44} />
                <Text style={styles.serviceTileLabel} numberOfLines={1}>
                  {s.label}
                </Text>
                <Text style={styles.serviceTileSub} numberOfLines={1}>
                  {s.sub}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.savedHeader}>
          <Text style={styles.savedTitle}>Saved places</Text>
          <Pressable hitSlop={8}>
            <Text style={styles.savedSeeAll}>See all</Text>
          </Pressable>
        </View>

        <View style={styles.savedList}>
          {CURRENT_USER.savedAddresses.slice(0, 2).map((s, i, arr) => (
            <Pressable
              key={s.label}
              style={[
                styles.savedRow,
                i !== arr.length - 1 && styles.savedRowDivider,
              ]}
              onPress={() => onPickSaved(s.address)}
            >
              <View style={styles.savedIcon}>
                <Ionicons
                  name={savedPlaceIcon(s.label)}
                  size={16}
                  color={colors.primaryDark}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.savedLabel}>
                  {s.label.charAt(0).toUpperCase() + s.label.slice(1)}
                </Text>
                <Text style={styles.savedAddress} numberOfLines={1}>
                  {s.address}
                </Text>
              </View>
              <ChevronIcon dir="right" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: STATUS_TOP_PAD,
    paddingBottom: spacing.sm,
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { ...type.h3, color: colors.text },

  mapBand: { height: 200, backgroundColor: '#e8ece6' },

  body: { flex: 1, backgroundColor: colors.surface },
  bodyContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md + 2,
    paddingBottom: spacing.xxl + 4,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#f3f5f2',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md + 2,
  },
  searchPlaceholder: {
    flex: 1,
    ...type.h3,
    color: colors.text,
    fontWeight: '500',
  },
  searchTrail: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchLater: { ...type.caption, color: colors.text, fontWeight: '700' },

  serviceGrid: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.md - 2,
  },
  serviceTile: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.md - 2,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceTileActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  serviceTileLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  serviceTileSub: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  savedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md + 2,
    marginBottom: 2,
  },
  savedTitle: { ...type.bodyBold, color: colors.text },
  savedSeeAll: { color: colors.primary, fontSize: 13, fontWeight: '700' },

  savedList: { marginTop: spacing.sm },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
    paddingVertical: spacing.md + 2,
  },
  savedRowDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  savedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
  savedAddress: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});
