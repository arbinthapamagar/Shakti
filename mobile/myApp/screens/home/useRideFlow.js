import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { CURRENT_USER } from '../../data/mockData';
import { ARRIVING_TO_STARTED_MS } from './constants';

async function resolveCurrentAddress() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;
  const me = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const res = await Location.reverseGeocodeAsync({
    latitude: me.coords.latitude,
    longitude: me.coords.longitude,
  });
  const first = res?.[0];
  if (!first) return null;
  return [first.name, first.street, first.district, first.city]
    .filter(Boolean)
    .slice(0, 2)
    .join(', ');
}

/**
 * Owns the ride-request state machine.
 *
 *   home → search → (map-pick) → options → bidding → active → home
 *
 * Returns the current state plus typed transitions. Components stay
 * presentational and just dispatch through these.
 */
export default function useRideFlow() {
  const [step, setStep] = useState('home');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleId, setVehicleId] = useState('tuktuk');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [payment, setPayment] = useState(CURRENT_USER.preferredPaymentMethod);
  const [acceptedBid, setAcceptedBid] = useState(null);
  const [tripStatus, setTripStatus] = useState('arriving');
  const [locating, setLocating] = useState(true);

  // Best-effort resolve the rider's current address on mount so the pickup
  // field is pre-filled. Falls back to empty so we can disable the confirm
  // button until the user fills it in another way.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const addr = await resolveCurrentAddress();
        if (!cancelled && addr) setPickup(addr);
      } catch {
        // permission denied or device offline — leave pickup empty
      } finally {
        if (!cancelled) setLocating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Resetting the accepted bid whenever bidding starts keeps the BiddingSheet
  // idempotent if the user navigates back into it from active.
  useEffect(() => {
    if (step === 'bidding') setAcceptedBid(null);
  }, [step]);

  const reset = useCallback(() => {
    setStep('home');
    setDestination('');
    setVehicleId('tuktuk');
    setOfferedPrice('');
    setAcceptedBid(null);
    setTripStatus('arriving');
  }, []);

  const goBack = useCallback(() => {
    if (step === 'search') setStep('home');
    else if (step === 'map-pick') setStep('search');
    else if (step === 'options') setStep('search');
    else if (step === 'bidding') setStep('options');
    else if (step === 'active') reset();
  }, [step, reset]);

  const requestRide = useCallback(() => {
    if (!destination.trim()) return;
    const price = Number(offeredPrice);
    if (!price || price < 50) return;
    setStep('bidding');
  }, [destination, offeredPrice]);

  const acceptBid = useCallback((bid) => {
    setAcceptedBid(bid);
    setStep('active');
    setTripStatus('arriving');
    const t = setTimeout(() => setTripStatus('started'), ARRIVING_TO_STARTED_MS);
    return () => clearTimeout(t);
  }, []);

  return {
    step,
    setStep,
    pickup,
    setPickup,
    destination,
    setDestination,
    vehicleId,
    setVehicleId,
    offeredPrice,
    setOfferedPrice,
    payment,
    setPayment,
    acceptedBid,
    tripStatus,
    locating,
    goBack,
    reset,
    requestRide,
    acceptBid,
  };
}
