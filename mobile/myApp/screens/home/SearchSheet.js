import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Sheet } from '../../components/ui';
import { FlagIcon, PinIcon } from '../../components/Icons';
import { confirm as hapticConfirm, pick as hapticPick } from '../../components/haptics';
import { CURRENT_USER, RECENT_DESTINATIONS } from '../../data/mockData';
import { colors, radius, spacing, type } from '../../theme';

const SAVED_ICON = { home: 'home', work: 'briefcase' };

function caseInsensitiveIncludes(haystack, needle) {
  if (!needle) return true;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export default function SearchSheet({
  pickup,
  setPickup,
  destination,
  setDestination,
  onPick,
  onSubmit,
  onPickPickupOnMap,
  onPickDestOnMap,
}) {
  const [activeField, setActiveField] = useState('dest');
  const destRef = useRef(null);

  const query = activeField === 'pickup' ? pickup : destination;

  const filteredSaved = useMemo(
    () =>
      CURRENT_USER.savedAddresses.filter(
        (s) =>
          caseInsensitiveIncludes(s.address, query) ||
          caseInsensitiveIncludes(s.label, query),
      ),
    [query],
  );
  const filteredRecent = useMemo(
    () =>
      RECENT_DESTINATIONS.filter(
        (r) =>
          caseInsensitiveIncludes(r.title, query) ||
          caseInsensitiveIncludes(r.subtitle, query),
      ),
    [query],
  );

  const pickValue = (value) => {
    hapticPick();
    if (activeField === 'pickup') {
      setPickup(value);
      // Hand the focus to the destination field so the user keeps flowing.
      setActiveField('dest');
      destRef.current?.focus();
    } else {
      onPick(value);
    }
  };

  return (
    <Sheet tall>
      <View style={styles.routeBox}>
        <View style={styles.routeIcons}>
          <PinIcon size={14} color={colors.primary} />
          <View style={styles.vline} />
          <FlagIcon size={14} color={colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <View
            style={[
              styles.field,
              activeField === 'pickup' && styles.fieldActive,
            ]}
          >
            <Text style={styles.fieldLabel}>From</Text>
            <View style={styles.fieldRow}>
              <TextInput
                value={pickup}
                onChangeText={setPickup}
                onFocus={() => setActiveField('pickup')}
                placeholder="Pickup location"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
              />
              {pickup ? (
                <Pressable onPress={() => setPickup('')} hitSlop={6}>
                  <Ionicons name="close-circle" size={16} color={colors.textFaint} />
                </Pressable>
              ) : null}
            </View>
          </View>
          <View style={styles.divider} />
          <View
            style={[styles.field, activeField === 'dest' && styles.fieldActive]}
          >
            <Text style={styles.fieldLabel}>To</Text>
            <View style={styles.fieldRow}>
              <TextInput
                ref={destRef}
                value={destination}
                onChangeText={setDestination}
                onFocus={() => setActiveField('dest')}
                placeholder="Where are you going?"
                placeholderTextColor={colors.textFaint}
                autoFocus
                style={styles.input}
                returnKeyType="search"
                onSubmitEditing={onSubmit}
              />
              {destination ? (
                <Pressable onPress={() => setDestination('')} hitSlop={6}>
                  <Ionicons name="close-circle" size={16} color={colors.textFaint} />
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.action}
          onPress={() => {
            hapticConfirm();
            onPickPickupOnMap?.();
          }}
        >
          <Ionicons name="locate" size={16} color={colors.primary} />
          <Text style={styles.actionText}>Pickup on map</Text>
        </Pressable>
        <Pressable
          style={styles.action}
          onPress={() => {
            hapticConfirm();
            onPickDestOnMap?.();
          }}
        >
          <Ionicons name="map" size={16} color="#5c6fff" />
          <Text style={styles.actionText}>Drop-off on map</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginTop: spacing.sm }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.activeHint}>
          Searching for{' '}
          <Text style={styles.activeHintStrong}>
            {activeField === 'pickup' ? 'pickup' : 'drop-off'}
          </Text>
          {query ? ` · "${query}"` : ''}
        </Text>

        {filteredSaved.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Saved places</Text>
            {filteredSaved.map((s) => (
              <Pressable
                key={s.label}
                style={styles.suggestion}
                onPress={() => pickValue(s.address)}
              >
                <View style={styles.suggestionIcon}>
                  <Ionicons
                    name={SAVED_ICON[s.label] || 'location'}
                    size={16}
                    color={colors.primaryDark}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestionTitle}>
                    {s.label.charAt(0).toUpperCase() + s.label.slice(1)}
                  </Text>
                  <Text style={styles.suggestionSub} numberOfLines={1}>
                    {s.address}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

        {filteredRecent.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Recent</Text>
            {filteredRecent.map((r) => (
              <Pressable
                key={r.id}
                style={styles.suggestion}
                onPress={() => pickValue(r.title)}
              >
                <View style={styles.suggestionIcon}>
                  <Ionicons name="time" size={16} color={colors.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestionTitle}>{r.title}</Text>
                  <Text style={styles.suggestionSub} numberOfLines={1}>
                    {r.subtitle}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

        {filteredSaved.length === 0 && filteredRecent.length === 0 && (
          <Text style={styles.empty}>No matches. Try a different name.</Text>
        )}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  routeBox: {
    flexDirection: 'row',
    backgroundColor: '#f3f5f2',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md + 2,
  },
  routeIcons: {
    alignItems: 'center',
    width: 16,
    marginRight: spacing.md + 2,
    paddingVertical: 6,
  },
  vline: { width: 2, flex: 1, backgroundColor: '#c5cac3', marginVertical: 4 },
  field: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginHorizontal: -6,
    borderRadius: 8,
  },
  fieldActive: { backgroundColor: '#ffffff' },
  fieldLabel: { ...type.eyebrow, color: colors.textMuted },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  input: { flex: 1, color: colors.text, fontSize: 16, paddingVertical: 4 },
  divider: { height: 1, backgroundColor: '#cdd2cd', marginVertical: 4 },

  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md - 2 },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: '#f3f5f2',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: { ...type.small, color: colors.text, fontWeight: '700' },

  activeHint: {
    ...type.caption,
    color: colors.textMuted,
    marginTop: spacing.md + 2,
    marginBottom: spacing.xs,
  },
  activeHintStrong: { color: colors.primaryDark, fontWeight: '800' },

  sectionHeader: {
    ...type.eyebrow,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
    paddingVertical: spacing.md + 2,
  },
  suggestionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f3f5f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  suggestionSub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },

  empty: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
