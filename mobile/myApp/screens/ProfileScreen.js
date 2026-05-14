import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ChevronIcon, StarIcon } from '../components/Icons';
import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { colors } from '../theme/colors';

const PROFILE = {
  name: 'Arbeen Shrestha',
  phone: '+977 9812345678',
  email: 'arbeen@matat.io',
  dateOfBirth: '1999-08-14',
  gender: 'male',
  userType: 'regular',
  role: 'driver',
  isPhoneVerified: true,
  isEmailVerified: false,
  accountStatus: 'active',
  walletBalance: 1240,
  preferredPaymentMethod: 'esewa',
  rating: { average: 4.92, total: 184 },
  lastLoginAt: '2026-05-15T08:24:00.000Z',
  memberSince: '2024-02-11T00:00:00.000Z',
  savedAddresses: [
    {
      label: 'home',
      address: 'Baluwatar, Kathmandu',
    },
    {
      label: 'work',
      address: 'Durbar Marg, Kathmandu',
    },
    {
      label: 'other',
      address: 'Bhatbhateni Maharajgunj',
    },
  ],
  subscription: {
    plan: 'Shakti Plus',
    status: 'active',
    renewsOn: '2026-06-01',
    price: 'Rs 499 / month',
  },
  driverProfile: {
    vehicleType: 'car',
    vehiclePlate: 'BA 2 PA 4521',
    vehicleModel: 'Suzuki Alto',
    vehicleColor: 'White',
    vehicleYear: 2021,
    vehicleCapacity: 4,
    licenseNumber: '03-08-12345678',
    licenseExpiry: '2028-11-30',
    status: 'approved',
    isVerified: true,
    isOnline: true,
    isAvailable: true,
    isOnRide: false,
    rating: 4.92,
    totalRatings: 184,
    totalRides: 1280,
    cancelledRides: 6,
    earnings: 84620,
    lastActiveAt: '2026-05-15T08:24:00.000Z',
    documents: [
      { key: 'licenseImage', label: 'Driving licence', uploaded: true },
      { key: 'citizenshipImage', label: 'Citizenship', uploaded: true },
      { key: 'vehicleImage', label: 'Vehicle photo', uploaded: true },
      { key: 'insuranceImage', label: 'Insurance', uploaded: true },
      { key: 'bluebook', label: 'Bluebook', uploaded: true },
      { key: 'policeReport', label: 'Police report', uploaded: false },
    ],
  },
};

const PAYMENT_LABELS = {
  cash: 'Cash',
  khalti: 'Khalti',
  esewa: 'eSewa',
};

const GENDER_LABELS = { male: 'Male', female: 'Female', other: 'Other' };
const USER_TYPE_LABELS = {
  regular: 'Regular',
  parent: 'Parent',
  business: 'Business',
};

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProfileScreen({ onBack, onSignOut, onOpenSubscription }) {
  const [online, setOnline] = useState(PROFILE.driverProfile.isOnline);
  const [available, setAvailable] = useState(PROFILE.driverProfile.isAvailable);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [rideReminders, setRideReminders] = useState(true);
  const [avatarUri, setAvatarUri] = useState(null);

  const [profile, setProfile] = useState({
    name: PROFILE.name,
    phone: PROFILE.phone,
    email: PROFILE.email,
    walletBalance: PROFILE.walletBalance,
  });
  const [addresses, setAddresses] = useState(PROFILE.savedAddresses);
  const [documents, setDocuments] = useState(PROFILE.driverProfile.documents);
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  const updateAddress = (label, newAddress) => {
    setAddresses((prev) =>
      prev.map((a) => (a.label === label ? { ...a, address: newAddress } : a)),
    );
  };
  const addAddress = (label, address) => {
    setAddresses((prev) => [...prev, { label, address }]);
  };
  const removeAddress = (label) => {
    setAddresses((prev) => prev.filter((a) => a.label !== label));
  };
  const toggleDocument = (key) => {
    setDocuments((prev) =>
      prev.map((d) => (d.key === key ? { ...d, uploaded: !d.uploaded } : d)),
    );
  };
  const addToWallet = (amount) => {
    setProfile((p) => ({ ...p, walletBalance: p.walletBalance + amount }));
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow photo access to change your avatar.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const isDriver = PROFILE.role === 'driver';
  const initials = PROFILE.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Account</Text>
        <Pressable
          style={styles.editBtn}
          onPress={() => setModal({ type: 'edit-profile' })}
          hitSlop={8}
        >
          <Ionicons name="create-outline" size={18} color={colors.primaryDark} />
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroDecorA} />
          <View style={styles.heroDecorB} />

          <Pressable
            style={styles.avatarWrap}
            onPress={pickAvatar}
            hitSlop={8}
          >
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{initials}</Text>
                )}
              </View>
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#ffffff" />
            </View>
          </Pressable>

          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.heroSub}>{profile.email}</Text>

          <View style={styles.roleRow}>
            <View style={styles.rolePill}>
              <Ionicons
                name={isDriver ? 'car-sport' : 'person'}
                size={12}
                color={colors.primaryDark}
              />
              <Text style={styles.rolePillText}>
                {isDriver ? 'Driver' : 'Passenger'}
              </Text>
            </View>
            <View
              style={[
                styles.statusPill,
                PROFILE.accountStatus === 'active'
                  ? styles.statusActive
                  : styles.statusInactive,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  PROFILE.accountStatus === 'active'
                    ? styles.statusDotActive
                    : styles.statusDotInactive,
                ]}
              />
              <Text style={styles.statusPillText}>
                {PROFILE.accountStatus.charAt(0).toUpperCase() +
                  PROFILE.accountStatus.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <Stat
            icon={<StarIcon size={16} color="#f5b400" />}
            value={PROFILE.rating.average.toFixed(2)}
            label={`${PROFILE.rating.total} ratings`}
          />
          <View style={styles.statsDivider} />
          <Stat
            icon={
              <Ionicons name="navigate" size={14} color={colors.primary} />
            }
            value={isDriver ? PROFILE.driverProfile.totalRides : 38}
            label={isDriver ? 'Rides' : 'Trips'}
          />
          <View style={styles.statsDivider} />
          <Stat
            icon={
              <Ionicons name="calendar" size={14} color="#5c6fff" />
            }
            value={formatDate(PROFILE.memberSince).split(' ')[2]}
            label="Member"
          />
        </View>

        <Section title="Personal information" collapsible defaultOpen={false}>
          <Row label="Full name" value={profile.name} />
          <Row
            label="Phone"
            value={profile.phone}
            badge={PROFILE.isPhoneVerified ? 'Verified' : 'Unverified'}
            badgeTone={PROFILE.isPhoneVerified ? 'good' : 'warn'}
          />
          <Row
            label="Email"
            value={profile.email}
            badge={PROFILE.isEmailVerified ? 'Verified' : 'Unverified'}
            badgeTone={PROFILE.isEmailVerified ? 'good' : 'warn'}
          />
          <Row label="Date of birth" value={formatDate(PROFILE.dateOfBirth)} />
          <Row label="Gender" value={GENDER_LABELS[PROFILE.gender]} />
          <Row label="Account type" value={USER_TYPE_LABELS[PROFILE.userType]} last />
        </Section>

        <Section title="Wallet & payments">
          <View style={styles.walletCard}>
            <View>
              <Text style={styles.walletLabel}>Wallet balance</Text>
              <Text style={styles.walletAmount}>
                Rs {profile.walletBalance.toLocaleString()}
              </Text>
            </View>
            <Pressable
              style={styles.topUpBtn}
              onPress={() => setModal({ type: 'topup' })}
            >
              <Text style={styles.topUpText}>Top up</Text>
            </Pressable>
          </View>
          <Row
            label="Preferred method"
            value={PAYMENT_LABELS[PROFILE.preferredPaymentMethod]}
            last
          />
        </Section>

        {PROFILE.subscription && (
          <Section title="Subscription">
            <View style={styles.subCard}>
              <View style={styles.subHeader}>
                <Text style={styles.subPlan}>{PROFILE.subscription.plan}</Text>
                <View style={[styles.statusPill, styles.statusActive]}>
                  <Text style={styles.statusPillText}>
                    {PROFILE.subscription.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.subPrice}>{PROFILE.subscription.price}</Text>
              <Text style={styles.subRenews}>
                Renews on {formatDate(PROFILE.subscription.renewsOn)}
              </Text>
              <Pressable style={styles.subManage} onPress={onOpenSubscription}>
                <Text style={styles.subManageText}>Manage subscription</Text>
              </Pressable>
            </View>
          </Section>
        )}

        <Section title="Saved places">
          {addresses.map((a, i) => (
            <Pressable
              key={a.label}
              style={[
                styles.savedRow,
                i === addresses.length - 1 && styles.rowLast,
              ]}
              onPress={() => setModal({ type: 'edit-address', data: a })}
            >
              <View style={styles.savedIcon}>
                <Ionicons
                  name={
                    a.label === 'home'
                      ? 'home'
                      : a.label === 'work'
                      ? 'briefcase'
                      : 'location'
                  }
                  size={16}
                  color={colors.primaryDark}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.savedLabel}>
                  {a.label.charAt(0).toUpperCase() + a.label.slice(1)}
                </Text>
                <Text style={styles.savedAddress} numberOfLines={1}>
                  {a.address}
                </Text>
              </View>
              <Text style={styles.savedAction}>Edit</Text>
            </Pressable>
          ))}
          <Pressable
            style={styles.addAddressBtn}
            onPress={() => setModal({ type: 'add-address' })}
          >
            <Ionicons name="add-circle" size={18} color={colors.primary} />
            <Text style={styles.addAddressText}>Add a place</Text>
          </Pressable>
        </Section>

        {isDriver && (
          <>
            <Section title="Driver status">
              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Online</Text>
                  <Text style={styles.toggleHint}>
                    Receive ride requests from nearby passengers.
                  </Text>
                </View>
                <Switch
                  value={online}
                  onValueChange={setOnline}
                  thumbColor="#ffffff"
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Available for new trips</Text>
                  <Text style={styles.toggleHint}>
                    Turn off if you don't want new requests right now.
                  </Text>
                </View>
                <Switch
                  value={available}
                  onValueChange={setAvailable}
                  thumbColor="#ffffff"
                  trackColor={{ false: colors.border, true: colors.primary }}
                />
              </View>
              <Row
                label="Verification"
                value={
                  PROFILE.driverProfile.isVerified ? 'Verified' : 'Pending'
                }
                badge={PROFILE.driverProfile.status}
                badgeTone={
                  PROFILE.driverProfile.status === 'approved' ? 'good' : 'warn'
                }
              />
              <Row
                label="Last active"
                value={formatDateTime(PROFILE.driverProfile.lastActiveAt)}
                last
              />
            </Section>

            <Section title="Vehicle" collapsible defaultOpen={false}>
              <Row
                label="Type"
                value={
                  PROFILE.driverProfile.vehicleType.charAt(0).toUpperCase() +
                  PROFILE.driverProfile.vehicleType.slice(1)
                }
              />
              <Row label="Model" value={PROFILE.driverProfile.vehicleModel} />
              <Row label="Colour" value={PROFILE.driverProfile.vehicleColor} />
              <Row
                label="Year"
                value={String(PROFILE.driverProfile.vehicleYear)}
              />
              <Row label="Plate" value={PROFILE.driverProfile.vehiclePlate} />
              <Row
                label="Capacity"
                value={`${PROFILE.driverProfile.vehicleCapacity} seats`}
                last
              />
            </Section>

            <Section title="Licence" collapsible defaultOpen={false}>
              <Row
                label="Number"
                value={PROFILE.driverProfile.licenseNumber}
              />
              <Row
                label="Expiry"
                value={formatDate(PROFILE.driverProfile.licenseExpiry)}
                last
              />
            </Section>

            <Section title="Driving stats" collapsible defaultOpen={false}>
              <View style={styles.metricsGrid}>
                <Metric
                  label="Total rides"
                  value={PROFILE.driverProfile.totalRides.toLocaleString()}
                />
                <Metric
                  label="Earnings"
                  value={`Rs ${PROFILE.driverProfile.earnings.toLocaleString()}`}
                />
                <Metric
                  label="Cancelled"
                  value={String(PROFILE.driverProfile.cancelledRides)}
                />
                <Metric
                  label="Rating"
                  value={`${PROFILE.driverProfile.rating.toFixed(2)} / 5`}
                />
              </View>
            </Section>

            <Section title="Documents" collapsible defaultOpen={false}>
              {documents.map((doc, i) => (
                <Pressable
                  key={doc.key}
                  style={[
                    styles.docRow,
                    i === documents.length - 1 && styles.rowLast,
                  ]}
                  onPress={() => setModal({ type: 'doc', data: doc })}
                >
                  <View style={styles.docIcon}>
                    <Ionicons
                      name="document-text"
                      size={18}
                      color={colors.primaryDark}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docLabel}>{doc.label}</Text>
                    <Text
                      style={[
                        styles.docState,
                        doc.uploaded ? styles.docStateGood : styles.docStateWarn,
                      ]}
                    >
                      {doc.uploaded ? 'Uploaded' : 'Missing'}
                    </Text>
                  </View>
                  <Text style={styles.docAction}>
                    {doc.uploaded ? 'View' : 'Upload'}
                  </Text>
                </Pressable>
              ))}
            </Section>
          </>
        )}

        <Section title="Notifications">
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Push notifications</Text>
              <Text style={styles.toggleHint}>
                Updates about your account, rides and offers.
              </Text>
            </View>
            <Switch
              value={pushNotifs}
              onValueChange={setPushNotifs}
              thumbColor="#ffffff"
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Ride reminders</Text>
              <Text style={styles.toggleHint}>
                Get a heads-up before your scheduled trips.
              </Text>
            </View>
            <Switch
              value={rideReminders}
              onValueChange={setRideReminders}
              thumbColor="#ffffff"
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </Section>

        <Section title="Security & support">
          <LinkRow
            label="Change password"
            onPress={() => setModal({ type: 'password' })}
          />
          <LinkRow
            label="Two-factor authentication"
            badge={tfaEnabled ? 'On' : 'Off'}
            onPress={() => setModal({ type: 'tfa' })}
          />
          <LinkRow
            label="Linked devices"
            onPress={() => setModal({ type: 'devices' })}
          />
          <LinkRow
            label="Help centre"
            onPress={() => setModal({ type: 'help' })}
          />
          <LinkRow
            label="Contact support"
            onPress={() => setModal({ type: 'contact' })}
            last
          />
        </Section>

        <Section title="About">
          <Row label="Last login" value={formatDateTime(PROFILE.lastLoginAt)} />
          <Row label="App version" value="1.0.0 (beta)" last />
        </Section>

        <Pressable style={styles.signOutBtn} onPress={onSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        <Text style={styles.footer}>Shakti, Kathmandu</Text>
      </ScrollView>

      <ProfileModal
        modal={modal}
        close={closeModal}
        profile={profile}
        setProfile={setProfile}
        updateAddress={updateAddress}
        addAddress={addAddress}
        removeAddress={removeAddress}
        toggleDocument={toggleDocument}
        addToWallet={addToWallet}
        tfaEnabled={tfaEnabled}
        setTfaEnabled={setTfaEnabled}
      />
    </View>
  );
}

function ProfileModal({
  modal,
  close,
  profile,
  setProfile,
  updateAddress,
  addAddress,
  removeAddress,
  toggleDocument,
  addToWallet,
  tfaEnabled,
  setTfaEnabled,
}) {
  return (
    <Modal
      visible={!!modal}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <Pressable style={styles.modalDismiss} onPress={close} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          {modal?.type === 'edit-profile' && (
            <EditProfileForm
              profile={profile}
              setProfile={setProfile}
              close={close}
            />
          )}
          {modal?.type === 'topup' && (
            <TopupForm addToWallet={addToWallet} close={close} />
          )}
          {modal?.type === 'edit-address' && (
            <EditAddressForm
              address={modal.data}
              updateAddress={updateAddress}
              removeAddress={removeAddress}
              close={close}
            />
          )}
          {modal?.type === 'add-address' && (
            <AddAddressForm addAddress={addAddress} close={close} />
          )}
          {modal?.type === 'doc' && (
            <DocViewer
              doc={modal.data}
              toggleDocument={toggleDocument}
              close={close}
            />
          )}
          {modal?.type === 'password' && <PasswordForm close={close} />}
          {modal?.type === 'tfa' && (
            <TfaForm
              enabled={tfaEnabled}
              setEnabled={setTfaEnabled}
              close={close}
            />
          )}
          {modal?.type === 'devices' && <LinkedDevices close={close} />}
          {modal?.type === 'help' && <HelpCentre close={close} />}
          {modal?.type === 'contact' && <ContactSupport close={close} />}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ModalHeader({ title, close }) {
  return (
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>{title}</Text>
      <Pressable onPress={close} hitSlop={8} style={styles.modalClose}>
        <Ionicons name="close" size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}

function FormField({ label, value, onChangeText, keyboardType, secure }) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={styles.formInput}
        placeholderTextColor={colors.textFaint}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        autoCapitalize="none"
      />
    </View>
  );
}

function PrimaryButton({ label, onPress }) {
  return (
    <Pressable style={styles.primaryBtn} onPress={onPress}>
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

function EditProfileForm({ profile, setProfile, close }) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  return (
    <>
      <ModalHeader title="Edit profile" close={close} />
      <FormField label="Full name" value={name} onChangeText={setName} />
      <FormField
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <PrimaryButton
        label="Save changes"
        onPress={() => {
          setProfile((p) => ({ ...p, name, phone, email }));
          close();
        }}
      />
    </>
  );
}

function TopupForm({ addToWallet, close }) {
  const [amount, setAmount] = useState('500');
  const presets = [200, 500, 1000, 2000];
  return (
    <>
      <ModalHeader title="Top up wallet" close={close} />
      <View style={styles.presetRow}>
        {presets.map((p) => (
          <Pressable
            key={p}
            onPress={() => setAmount(String(p))}
            style={[
              styles.presetChip,
              Number(amount) === p && styles.presetChipActive,
            ]}
          >
            <Text
              style={[
                styles.presetText,
                Number(amount) === p && styles.presetTextActive,
              ]}
            >
              Rs {p}
            </Text>
          </Pressable>
        ))}
      </View>
      <FormField
        label="Custom amount"
        value={amount}
        onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
      />
      <PrimaryButton
        label={`Add Rs ${amount || 0}`}
        onPress={() => {
          const num = Number(amount);
          if (num > 0) addToWallet(num);
          close();
        }}
      />
    </>
  );
}

function EditAddressForm({ address, updateAddress, removeAddress, close }) {
  const [value, setValue] = useState(address.address);
  return (
    <>
      <ModalHeader
        title={`Edit ${address.label}`}
        close={close}
      />
      <FormField label="Address" value={value} onChangeText={setValue} />
      <PrimaryButton
        label="Save"
        onPress={() => {
          updateAddress(address.label, value);
          close();
        }}
      />
      <Pressable
        style={styles.dangerBtn}
        onPress={() => {
          removeAddress(address.label);
          close();
        }}
      >
        <Text style={styles.dangerBtnText}>Remove place</Text>
      </Pressable>
    </>
  );
}

function AddAddressForm({ addAddress, close }) {
  const [label, setLabel] = useState('');
  const [addr, setAddr] = useState('');
  return (
    <>
      <ModalHeader title="Add a place" close={close} />
      <FormField label="Label (e.g. Gym)" value={label} onChangeText={setLabel} />
      <FormField label="Address" value={addr} onChangeText={setAddr} />
      <PrimaryButton
        label="Add place"
        onPress={() => {
          if (label.trim() && addr.trim()) {
            addAddress(label.trim().toLowerCase(), addr.trim());
            close();
          }
        }}
      />
    </>
  );
}

function DocViewer({ doc, toggleDocument, close }) {
  return (
    <>
      <ModalHeader title={doc.label} close={close} />
      <View style={styles.docPreview}>
        <Ionicons name="document-text" size={60} color={colors.primary} />
        <Text style={styles.docPreviewText}>
          {doc.uploaded
            ? 'Document preview unavailable in demo mode.'
            : 'No document uploaded yet.'}
        </Text>
        <View
          style={[
            styles.docStatusPill,
            doc.uploaded ? styles.statusActive : styles.statusInactive,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              doc.uploaded ? styles.statusDotActive : styles.statusDotInactive,
            ]}
          />
          <Text style={styles.statusPillText}>
            {doc.uploaded ? 'Verified' : 'Pending upload'}
          </Text>
        </View>
      </View>
      <PrimaryButton
        label={doc.uploaded ? 'Replace document' : 'Upload document'}
        onPress={() => {
          toggleDocument(doc.key);
          close();
        }}
      />
    </>
  );
}

function PasswordForm({ close }) {
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  return (
    <>
      <ModalHeader title="Change password" close={close} />
      <FormField
        label="Current password"
        value={oldPwd}
        onChangeText={setOldPwd}
        secure
      />
      <FormField
        label="New password"
        value={newPwd}
        onChangeText={setNewPwd}
        secure
      />
      <FormField
        label="Confirm new password"
        value={confirm}
        onChangeText={setConfirm}
        secure
      />
      {error ? <Text style={styles.formError}>{error}</Text> : null}
      <PrimaryButton
        label="Update password"
        onPress={() => {
          if (newPwd.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
          }
          if (newPwd !== confirm) {
            setError('Passwords do not match.');
            return;
          }
          close();
        }}
      />
    </>
  );
}

function TfaForm({ enabled, setEnabled, close }) {
  return (
    <>
      <ModalHeader title="Two-factor authentication" close={close} />
      <Text style={styles.formCopy}>
        Add a second step when signing in. We'll send a code to your phone
        whenever you log in from a new device.
      </Text>
      <View style={styles.tfaCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.tfaTitle}>SMS verification</Text>
          <Text style={styles.tfaSub}>
            {enabled ? 'Enabled · sent to your phone' : 'Currently off'}
          </Text>
        </View>
        <Pressable
          onPress={() => setEnabled((v) => !v)}
          style={[
            styles.tfaToggle,
            enabled ? styles.tfaToggleOn : styles.tfaToggleOff,
          ]}
        >
          <Text style={styles.tfaToggleText}>{enabled ? 'On' : 'Off'}</Text>
        </Pressable>
      </View>
      <PrimaryButton label="Done" onPress={close} />
    </>
  );
}

function LinkedDevices({ close }) {
  const devices = [
    { id: 'd1', name: 'iPhone 14', meta: 'Kathmandu · last seen now', current: true },
    { id: 'd2', name: 'Pixel 8', meta: 'Lalitpur · 3 days ago' },
    { id: 'd3', name: 'Chrome (Mac)', meta: 'Kathmandu · 1 week ago' },
  ];
  return (
    <>
      <ModalHeader title="Linked devices" close={close} />
      {devices.map((d) => (
        <View key={d.id} style={styles.deviceRow}>
          <Ionicons name="phone-portrait" size={22} color={colors.text} />
          <View style={{ flex: 1 }}>
            <Text style={styles.deviceName}>
              {d.name}
              {d.current ? '  ·  This device' : ''}
            </Text>
            <Text style={styles.deviceMeta}>{d.meta}</Text>
          </View>
          {!d.current && (
            <Pressable hitSlop={6}>
              <Text style={styles.deviceRevoke}>Revoke</Text>
            </Pressable>
          )}
        </View>
      ))}
    </>
  );
}

function HelpCentre({ close }) {
  const topics = [
    'I was charged the wrong amount',
    'My driver did not arrive',
    'How does bidding work?',
    'Update payment method',
    'Subscription billing questions',
  ];
  return (
    <>
      <ModalHeader title="Help centre" close={close} />
      {topics.map((t) => (
        <Pressable key={t} style={styles.helpRow}>
          <Text style={styles.helpText}>{t}</Text>
          <ChevronIcon dir="right" size={14} color={colors.textFaint} />
        </Pressable>
      ))}
    </>
  );
}

function ContactSupport({ close }) {
  return (
    <>
      <ModalHeader title="Contact support" close={close} />
      <Text style={styles.formCopy}>
        Our team usually replies within 30 minutes.
      </Text>
      <Pressable style={styles.contactRow}>
        <Ionicons name="call" size={20} color={colors.primary} />
        <Text style={styles.contactLabel}>Call 16600-12345</Text>
      </Pressable>
      <Pressable style={styles.contactRow}>
        <Ionicons name="mail" size={20} color="#5c6fff" />
        <Text style={styles.contactLabel}>support@shakti.com</Text>
      </Pressable>
      <Pressable style={styles.contactRow}>
        <Ionicons name="chatbubbles" size={20} color="#c98a2a" />
        <Text style={styles.contactLabel}>Start a live chat</Text>
      </Pressable>
      <PrimaryButton label="Close" onPress={close} />
    </>
  );
}

function Section({ title, children, collapsible, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!collapsible) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionBody}>{children}</View>
      </View>
    );
  }
  return (
    <View style={styles.section}>
      <Pressable
        style={styles.sectionHeaderToggle}
        onPress={() => setOpen((v) => !v)}
        hitSlop={6}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <ChevronIcon dir={open ? 'up' : 'down'} size={16} color={colors.textMuted} />
      </Pressable>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

function Row({ label, value, badge, badgeTone, last }) {
  return (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
        {badge ? (
          <View
            style={[
              styles.badge,
              badgeTone === 'good' && styles.badgeGood,
              badgeTone === 'warn' && styles.badgeWarn,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                badgeTone === 'good' && styles.badgeTextGood,
                badgeTone === 'warn' && styles.badgeTextWarn,
              ]}
            >
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function LinkRow({ label, last, onPress, badge }) {
  return (
    <Pressable
      style={[styles.linkRow, last && styles.rowLast]}
      onPress={onPress}
    >
      <Text style={styles.linkLabel}>{label}</Text>
      <View style={styles.linkRight}>
        {badge ? (
          <View style={styles.linkBadge}>
            <Text style={styles.linkBadgeText}>{badge}</Text>
          </View>
        ) : null}
        <ChevronIcon dir="right" size={14} color={colors.textFaint} />
      </View>
    </Pressable>
  );
}

function Stat({ value, label, icon }) {
  return (
    <View style={styles.stat}>
      {icon ? <View style={styles.statIcon}>{icon}</View> : null}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingTop: Platform.OS === 'android' ? 28 : 16,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  editText: { color: colors.primaryDark, fontSize: 13, fontWeight: '700' },

  scroll: { paddingBottom: 40 },

  hero: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#cfe6d8',
    overflow: 'hidden',
    position: 'relative',
  },
  heroDecorA: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(31, 122, 77, 0.12)',
  },
  heroDecorB: {
    position: 'absolute',
    bottom: -50,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(31, 122, 77, 0.08)',
  },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.text,
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  heroSub: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cfe6d8',
  },
  rolePillText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: '#edf6f0',
    borderColor: '#cfe6d8',
  },
  statusInactive: {
    backgroundColor: '#fbecec',
    borderColor: '#f0cccc',
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusDotActive: { backgroundColor: colors.accent },
  statusDotInactive: { backgroundColor: colors.danger },
  statusPillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  statsRow: {
    marginTop: 14,
    marginHorizontal: 16,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 16,
  },
  stat: { flex: 1, alignItems: 'center' },
  statIcon: { marginBottom: 4 },
  statValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  statsDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 6,
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 22,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionHeaderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingRight: 4,
  },
  sectionBody: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { color: colors.textMuted, fontSize: 13 },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '65%',
  },
  rowValue: { color: colors.text, fontSize: 14, fontWeight: '600' },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#eef2ef',
  },
  badgeGood: { backgroundColor: '#e6f3ec' },
  badgeWarn: { backgroundColor: '#fbeede' },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  badgeTextGood: { color: colors.primaryDark },
  badgeTextWarn: { color: '#9a6b1f' },

  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: colors.primarySoft,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  walletLabel: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  walletAmount: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  topUpBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 14,
  },
  topUpText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },

  subCard: {
    padding: 14,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subPlan: { color: colors.text, fontSize: 16, fontWeight: '700' },
  subPrice: { color: colors.textMuted, fontSize: 13, marginTop: 6 },
  subRenews: { color: colors.textFaint, fontSize: 12, marginTop: 4 },
  subManage: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  subManageText: { color: colors.text, fontSize: 13, fontWeight: '600' },

  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  savedIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  savedAddress: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  savedAction: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  addAddressText: { color: colors.primary, fontSize: 14, fontWeight: '700' },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  toggleHint: { color: colors.textMuted, fontSize: 12, marginTop: 2 },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  metric: {
    width: '50%',
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  metricValue: { color: colors.text, fontSize: 18, fontWeight: '700' },
  metricLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },

  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  docIcon: {
    width: 30,
    height: 38,
    borderRadius: 4,
    backgroundColor: '#f0f4f1',
    borderWidth: 1,
    borderColor: colors.border,
  },
  docLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  docState: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  docStateGood: { color: colors.primaryDark },
  docStateWarn: { color: '#9a6b1f' },
  docAction: { color: colors.primary, fontSize: 13, fontWeight: '600' },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkLabel: { color: colors.text, fontSize: 14, fontWeight: '500' },
  chevron: {
    width: 8,
    height: 8,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: colors.textFaint,
    transform: [{ rotate: '45deg' }],
  },

  signOutBtn: {
    marginTop: 28,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0cccc',
    backgroundColor: '#fbecec',
    alignItems: 'center',
  },
  signOutText: { color: colors.danger, fontSize: 15, fontWeight: '700' },

  linkRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  linkBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
  },
  linkBadgeText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalDismiss: { flex: 1 },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cdd2cd',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  formField: { marginBottom: 12 },
  formLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  formInput: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formError: { color: colors.danger, fontSize: 12, marginTop: -4, marginBottom: 8 },
  formCopy: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },

  primaryBtn: {
    marginTop: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  dangerBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dangerSoft,
    backgroundColor: colors.dangerSoft,
  },
  dangerBtnText: { color: colors.danger, fontSize: 14, fontWeight: '700' },

  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  presetChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  presetChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  presetText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  presetTextActive: { color: colors.primaryDark },

  docPreview: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    marginBottom: 14,
    gap: 10,
  },
  docPreviewText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  docStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 6,
  },

  tfaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    marginBottom: 12,
  },
  tfaTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  tfaSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  tfaToggle: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  tfaToggleOn: { backgroundColor: colors.primary },
  tfaToggleOff: { backgroundColor: colors.textFaint },
  tfaToggleText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },

  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  deviceName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  deviceMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  deviceRevoke: { color: colors.danger, fontSize: 12, fontWeight: '700' },

  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  helpText: { color: colors.text, fontSize: 14, flex: 1 },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    marginBottom: 8,
  },
  contactLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  footer: {
    color: colors.textFaint,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
  },
});
