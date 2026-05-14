import { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import TabBar from './components/TabBar';
import HomeScreen from './screens/home';
import InboxScreen from './screens/InboxScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import RegisterScreen from './screens/RegisterScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import TripsScreen from './screens/TripsScreen';
import WalletScreen from './screens/WalletScreen';
import { colors } from './theme/colors';

export default function App() {
  const [authed, setAuthed] = useState(true);
  const [authScreen, setAuthScreen] = useState('login');
  const [tab, setTab] = useState('home');
  const [overlay, setOverlay] = useState(null);

  if (!authed) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        {authScreen === 'login' ? (
          <LoginScreen
            onGoToRegister={() => setAuthScreen('register')}
            onBypass={() => setAuthed(true)}
          />
        ) : (
          <RegisterScreen onGoToLogin={() => setAuthScreen('login')} />
        )}
      </SafeAreaView>
    );
  }

  const signOut = () => {
    setOverlay(null);
    setTab('home');
    setAuthed(false);
    setAuthScreen('login');
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {overlay === 'subscription' && (
        <SubscriptionScreen onBack={() => setOverlay(null)} />
      )}

      {!overlay && (
        <View style={styles.body}>
          <View style={styles.content}>
            {tab === 'home' && <HomeScreen />}
            {tab === 'trips' && <TripsScreen />}
            {tab === 'wallet' && <WalletScreen />}
            {tab === 'inbox' && <InboxScreen />}
            {tab === 'account' && (
              <ProfileScreen
                onBack={() => setTab('home')}
                onSignOut={signOut}
                onOpenSubscription={() => setOverlay('subscription')}
              />
            )}
          </View>
          <TabBar active={tab} onChange={setTab} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  content: { flex: 1 },
});
