import { Pressable, Text, View, StyleSheet, AccessibilityInfo } from 'react-native';
import { Bell } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function NotificationBell() {
  const { unreadCount, bellPulseKey, togglePanel, hasHighPriorityUnread } = useNotifications();
  const { colors } = useTheme();
  const rotate = useSharedValue(0);
  const badgeScale = useSharedValue(1);
  const pulse = useSharedValue(1);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion || bellPulseKey === 0) return;
    rotate.value = withSequence(
      withTiming(12, { duration: 80 }),
      withTiming(-12, { duration: 80 }),
      withTiming(10, { duration: 80 }),
      withTiming(-10, { duration: 80 }),
      withTiming(6, { duration: 80 }),
      withTiming(0, { duration: 80 }),
    );
    badgeScale.value = withSequence(
      withSpring(1.35, { damping: 6 }),
      withSpring(1, { damping: 10 }),
    );
  }, [bellPulseKey, reduceMotion, rotate, badgeScale]);

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 1;
      return;
    }
    if (hasHighPriorityUnread) {
      pulse.value = withRepeat(withTiming(1.12, { duration: 600 }), -1, true);
    } else {
      pulse.value = withTiming(1);
    }
  }, [hasHighPriorityUnread, reduceMotion, pulse]);

  const bellStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }, { scale: pulse.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const hasUnread = unreadCount > 0;
  const badgeColor = hasHighPriorityUnread ? colors.error : colors.primary;

  return (
    <AnimatedPressable
      onPress={togglePanel}
      style={[styles.wrap, bellStyle]}
      accessibilityLabel={`Notificaciones${hasUnread ? `, ${unreadCount} sin leer` : ''}`}
    >
      <Bell color={colors.primary} size={22} />
      {hasUnread ? (
        <>
          <View style={[styles.dot, { backgroundColor: badgeColor }]} />
          <Animated.View
            style={[
              styles.badge,
              { backgroundColor: badgeColor },
              badgeStyle,
            ]}
          >
            <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </Animated.View>
        </>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginRight: 12, padding: 4 },
  dot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
