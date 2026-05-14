import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CallIcon } from '../components/Icons';
import { CHAT_THREADS, NOTIFICATIONS } from '../data/mockData';

const NOTIFICATION_META = {
  trip_request: { lib: 'ion', name: 'car', color: '#1f7a4d', bg: '#e8f3ec' },
  bid_received: { lib: 'ion', name: 'pricetag', color: '#5c6fff', bg: '#eaecff' },
  bid_accepted: { lib: 'ion', name: 'checkmark-circle', color: '#1f7a4d', bg: '#e8f3ec' },
  driver_arriving: { lib: 'ion', name: 'location', color: '#e0464a', bg: '#fbecec' },
  trip_started: { lib: 'mci', name: 'road-variant', color: '#5c6fff', bg: '#eaecff' },
  trip_completed: { lib: 'ion', name: 'flag', color: '#1f7a4d', bg: '#e8f3ec' },
  trip_cancelled: { lib: 'ion', name: 'close-circle', color: '#c43d3d', bg: '#fbecec' },
  subscription_alert: { lib: 'mci', name: 'school', color: '#c98a2a', bg: '#fbf1de' },
  document_verified: { lib: 'ion', name: 'shield-checkmark', color: '#1f7a4d', bg: '#e8f3ec' },
  document_rejected: { lib: 'ion', name: 'warning', color: '#c98a2a', bg: '#fbf1de' },
  payment: { lib: 'ion', name: 'wallet', color: '#c98a2a', bg: '#fbf1de' },
  general: { lib: 'ion', name: 'notifications', color: '#5c6fff', bg: '#eaecff' },
};

function NotificationIcon({ type }) {
  const m = NOTIFICATION_META[type] || NOTIFICATION_META.general;
  const Lib = m.lib === 'mci' ? MaterialCommunityIcons : Ionicons;
  return <Lib name={m.name} size={18} color={m.color} />;
}
import { colors } from '../theme/colors';

const TABS = [
  { id: 'notifications', label: 'Notifications' },
  { id: 'messages', label: 'Messages' },
];

function timeAgo(value) {
  const ms = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
}

export default function InboxScreen() {
  const [tab, setTab] = useState('notifications');
  const [activeThread, setActiveThread] = useState(null);

  if (activeThread) {
    return <ChatView thread={activeThread} onBack={() => setActiveThread(null)} />;
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox</Text>
      </View>

      <View style={styles.tabs}>
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'notifications' &&
          NOTIFICATIONS.map((n) => {
            const meta = NOTIFICATION_META[n.type] || NOTIFICATION_META.general;
            return (
              <View
                key={n._id}
                style={[styles.notifRow, !n.isRead && styles.notifUnread]}
              >
                <View
                  style={[styles.notifIcon, { backgroundColor: meta.bg }]}
                >
                  <NotificationIcon type={n.type} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.notifTopRow}>
                    <Text style={styles.notifTitle}>{n.title}</Text>
                    <Text style={styles.notifTime}>{timeAgo(n.createdAt)}</Text>
                  </View>
                  <Text style={styles.notifBody}>{n.body}</Text>
                </View>
                {!n.isRead && <View style={styles.notifUnreadDot} />}
              </View>
            );
          })}

        {tab === 'messages' &&
          CHAT_THREADS.map((c) => (
            <Pressable
              key={c._id}
              style={styles.chatRow}
              onPress={() => setActiveThread(c)}
            >
              <View style={styles.chatAvatar}>
                <Text style={styles.chatAvatarText}>{c.peer.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.chatTopRow}>
                  <Text style={styles.chatName}>{c.peer.name}</Text>
                  <Text style={styles.chatTime}>{timeAgo(c.updatedAt)}</Text>
                </View>
                <Text
                  style={[styles.chatLast, c.unread > 0 && styles.chatLastUnread]}
                  numberOfLines={1}
                >
                  {c.lastMessage}
                </Text>
              </View>
              {c.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{c.unread}</Text>
                </View>
              )}
            </Pressable>
          ))}

        {tab === 'messages' && CHAT_THREADS.length === 0 && (
          <Text style={styles.empty}>No messages yet.</Text>
        )}
      </ScrollView>
    </View>
  );
}

function ChatView({ thread, onBack }) {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState(thread.messages);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages([
      ...messages,
      { _id: `m-${Date.now()}`, from: 'rider', text, at: new Date().toISOString() },
    ]);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.chatHeader}>
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
          <View style={styles.backArrow} />
        </Pressable>
        <View style={styles.chatAvatarSmall}>
          <Text style={styles.chatAvatarTextSmall}>{thread.peer.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.chatHeaderName}>{thread.peer.name}</Text>
          <Text style={styles.chatHeaderSub}>Active now</Text>
        </View>
        <Pressable style={styles.callBtn}>
          <CallIcon size={14} color="#ffffff" />
          <Text style={styles.callBtnText}>Call</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.chatScroll}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m) => {
          const mine = m.from === 'rider';
          return (
            <View
              key={m._id}
              style={[
                styles.bubbleWrap,
                mine ? styles.bubbleWrapRight : styles.bubbleWrapLeft,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  mine ? styles.bubbleMine : styles.bubbleTheirs,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    mine ? styles.bubbleTextMine : styles.bubbleTextTheirs,
                  ]}
                >
                  {m.text}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message"
          placeholderTextColor={colors.textFaint}
          style={styles.composerInput}
        />
        <Pressable style={styles.sendBtn} onPress={send}>
          <Text style={styles.sendBtnText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  headerTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#ffffff' },

  scroll: { paddingHorizontal: 20, paddingBottom: 28 },
  empty: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 36,
    fontSize: 14,
  },

  notifRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  notifUnread: {
    backgroundColor: colors.primarySoft,
    borderColor: '#cfe6d8',
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 4,
  },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  notifTime: { color: colors.textFaint, fontSize: 11, fontWeight: '600' },
  notifBody: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },

  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  chatTime: { color: colors.textFaint, fontSize: 11, fontWeight: '600' },
  chatLast: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  chatLastUnread: { color: colors.text, fontWeight: '600' },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },

  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  chatAvatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarTextSmall: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
  chatHeaderName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  chatHeaderSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  callBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },

  chatScroll: { padding: 16, gap: 6 },
  bubbleWrap: { flexDirection: 'row', marginBottom: 6 },
  bubbleWrapLeft: { justifyContent: 'flex-start' },
  bubbleWrapRight: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: {
    backgroundColor: colors.surfaceMuted,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 14, lineHeight: 19 },
  bubbleTextMine: { color: '#ffffff' },
  bubbleTextTheirs: { color: colors.text },

  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  composerInput: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  sendBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  sendBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
});
