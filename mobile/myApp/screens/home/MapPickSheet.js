import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Button } from '../../components/ui';
import { colors, radius, shadow, spacing, STATUS_TOP_PAD, type } from '../../theme';
import { KATHMANDU } from './constants';

const ZOOMED = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

/**
 * Full-screen map picker. The pin stays fixed in the centre; we react to
 * `onRegionChangeComplete` and reverse-geocode the new centre.
 */
export default function MapPickSheet({ onCancel, onConfirm }) {
  const mapRef = useRef(null);
  const [center, setCenter] = useState({
    latitude: KATHMANDU.latitude,
    longitude: KATHMANDU.longitude,
  });
  const [address, setAddress] = useState('Loading address…');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const me = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const c = { latitude: me.coords.latitude, longitude: me.coords.longitude };
      setCenter(c);
      mapRef.current?.animateToRegion({ ...c, ...ZOOMED }, 600);
    })();
  }, []);

  // Reverse-geocode whenever the centre settles after a pan.
  useEffect(() => {
    let cancelled = false;
    setResolving(true);
    (async () => {
      try {
        const res = await Location.reverseGeocodeAsync(center);
        if (cancelled) return;
        const first = res?.[0];
        if (first) {
          const parts = [first.name, first.street, first.district, first.city].filter(
            Boolean,
          );
          setAddress(parts.slice(0, 2).join(', ') || 'Selected location');
        } else {
          setAddress('Selected location');
        }
      } catch {
        if (!cancelled) setAddress('Selected location');
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [center.latitude, center.longitude]);

  const recenterOnMe = async () => {
    const me = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion(
      {
        latitude: me.coords.latitude,
        longitude: me.coords.longitude,
        ...ZOOMED,
      },
      500,
    );
  };

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={KATHMANDU}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        onRegionChangeComplete={(r) =>
          setCenter({ latitude: r.latitude, longitude: r.longitude })
        }
      />

      <View pointerEvents="none" style={styles.centerPin}>
        <Ionicons name="location-sharp" size={42} color={colors.primary} />
      </View>

      <Pressable style={styles.close} onPress={onCancel} hitSlop={6}>
        <Ionicons name="close" size={22} color={colors.text} />
      </Pressable>

      <Pressable style={styles.recenter} onPress={recenterOnMe} hitSlop={6}>
        <Ionicons name="locate" size={20} color={colors.text} />
      </Pressable>

      <View style={styles.sheet}>
        <Text style={styles.kicker}>Drop-off</Text>
        <Text style={styles.address} numberOfLines={2}>
          {resolving ? 'Finding address…' : address}
        </Text>
        <Button label="Confirm location" onPress={() => onConfirm(address)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.background },
  centerPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -21,
    marginTop: -42,
  },
  close: {
    position: 'absolute',
    top: STATUS_TOP_PAD + 8,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.fab,
  },
  recenter: {
    position: 'absolute',
    bottom: 220,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.fab,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl + 4,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    ...shadow.sheet,
  },
  kicker: { ...type.eyebrow, color: colors.textMuted, marginBottom: 6 },
  address: { ...type.h2, color: colors.text, marginBottom: spacing.md + 2 },
});
