import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NEARBY_DRIVERS, VEHICLE_TYPES } from '../../data/mockData';
import { colors, shadow } from '../../theme';
import ActiveTripSheet from './ActiveTripSheet';
import BiddingSheet from './BiddingSheet';
import HomeView from './HomeView';
import Map from './Map';
import MapPickSheet from './MapPickSheet';
import OptionsSheet from './OptionsSheet';
import SearchSheet from './SearchSheet';
import useRideFlow from './useRideFlow';

/**
 * Top-level home/ride orchestrator.
 *
 * The flow is a state machine owned by `useRideFlow`. This component does
 * three things only:
 *   1. delegate the `home` step to `HomeView` (its own layout)
 *   2. on any other step, show the live `Map` behind a bottom Sheet
 *   3. dispatch the correct Sheet for the current step
 */
export default function HomeScreen({ onOpenProfile }) {
  const flow = useRideFlow();
  const {
    step,
    pickup,
    setPickup,
    destination,
    setDestination,
    vehicleId,
    setVehicleId,
    offeredPrice,
    setOfferedPrice,
    payment,
    acceptedBid,
    tripStatus,
    setStep,
    goBack,
    reset,
    requestRide,
    acceptBid,
  } = flow;

  if (step === 'home') {
    return (
      <HomeView
        onOpenProfile={onOpenProfile}
        onTapSearch={() => setStep('search')}
        onPickSaved={(addr) => {
          setDestination(addr);
          setStep('options');
        }}
      />
    );
  }

  const vehicle = VEHICLE_TYPES.find((v) => v.id === vehicleId);
  const acceptedDriver = acceptedBid
    ? NEARBY_DRIVERS.find((d) => d._id === acceptedBid.driverId)
    : null;

  return (
    <View style={styles.root}>
      <Map step={step} />

      {step !== 'active' && (
        <View style={styles.topBar}>
          <Pressable style={styles.backBtn} onPress={goBack} hitSlop={8}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}
      >
        {step === 'search' && (
          <SearchSheet
            pickup={pickup}
            setPickup={setPickup}
            destination={destination}
            setDestination={setDestination}
            onPick={(value) => {
              setDestination(value);
              setStep('options');
            }}
            onSubmit={() => destination.trim() && setStep('options')}
            onOpenMapPicker={() => setStep('map-pick')}
          />
        )}

        {step === 'map-pick' && (
          <MapPickSheet
            onCancel={() => setStep('search')}
            onConfirm={(label) => {
              setDestination(label);
              setStep('options');
            }}
          />
        )}

        {step === 'options' && (
          <OptionsSheet
            pickup={pickup}
            destination={destination}
            vehicleId={vehicleId}
            setVehicleId={setVehicleId}
            offeredPrice={offeredPrice}
            setOfferedPrice={setOfferedPrice}
            onConfirm={requestRide}
          />
        )}

        {step === 'bidding' && (
          <BiddingSheet
            vehicle={vehicle}
            offeredPrice={Number(offeredPrice)}
            onAccept={acceptBid}
            onCancel={() => setStep('options')}
          />
        )}

        {step === 'active' && acceptedBid && acceptedDriver && (
          <ActiveTripSheet
            driver={acceptedDriver}
            bid={acceptedBid}
            destination={destination}
            payment={payment}
            tripStatus={tripStatus}
            onComplete={reset}
            onCancel={reset}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: {
    position: 'absolute',
    top: 56,
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.fab,
  },
  sheetWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
});
