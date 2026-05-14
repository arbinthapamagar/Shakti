import { Ionicons } from '@expo/vector-icons';
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
  return (
    <Sheet tall>
      <View style={styles.routeBox}>
        <View style={styles.routeIcons}>
          <PinIcon size={14} color={colors.primary} />
          <View style={styles.vline} />
          <FlagIcon size={14} color={colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>From</Text>
            <TextInput
              value={pickup}
              onChangeText={setPickup}
              placeholder="Pickup location"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>To</Text>
            <TextInput
              value={destination}
              onChangeText={setDestination}
              placeholder="Where are you going?"
              placeholderTextColor={colors.textFaint}
              autoFocus
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={onSubmit}
            />
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
        <Text style={styles.sectionHeader}>Saved places</Text>
        {CURRENT_USER.savedAddresses.map((s) => (
          <Pressable
            key={s.label}
            style={styles.suggestion}
            onPress={() => {
              hapticPick();
              onPick(s.address);
            }}
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

        <Text style={styles.sectionHeader}>Recent</Text>
        {RECENT_DESTINATIONS.map((r) => (
          <Pressable
            key={r.id}
            style={styles.suggestion}
            onPress={() => {
              hapticPick();
              onPick(r.title);
            }}
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
  field: { paddingVertical: 4 },
  fieldLabel: { ...type.eyebrow, color: colors.textMuted },
  input: { color: colors.text, fontSize: 16, paddingVertical: 4 },
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

  sectionHeader: {
    ...type.eyebrow,
    color: colors.textMuted,
    marginTop: spacing.md + 2,
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
});
