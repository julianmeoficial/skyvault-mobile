import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Bell } from 'lucide-react-native';
import type { ToastNotification, UserNotificationDto } from '../types/notification.types';
import { getNotificationDisplayCopy } from '../../../shared/copy/notificationCopy';
import { LiquidGlassSurface } from '../../../components/ui/liquid-glass/LiquidGlassSurface';
import { useTheme } from '../../../theme';

interface NotificationToastHostProps {
  toasts: ToastNotification[];
  onDismiss: (toastId: string) => void;
  onPress: (n: UserNotificationDto) => void;
}

function SwipeToast({
  toast,
  onDismiss,
  onPress,
}: {
  toast: ToastNotification;
  onDismiss: () => void;
  onPress: () => void;
}) {
  const { colors, spacing, fontFamily, fontSize } = useTheme();
  const copy = getNotificationDisplayCopy(toast.type, toast.title, toast.message);

  const pan = Gesture.Pan()
    .onEnd((e) => {
      if (e.translationY < -40 || e.velocityY < -500) onDismiss();
    })
    .runOnJS(true);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View entering={FadeInUp.duration(280)} exiting={FadeOutUp.duration(180)}>
        <Pressable onPress={onPress}>
          <LiquidGlassSurface
            borderRadius={16}
            style={{
              borderWidth: 1,
              borderColor: toast.priority === 'HIGH' ? colors.error : colors.glassBorder,
            }}
          >
            <View style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primary + '22' }]}>
                <Bell color={colors.primary} size={20} />
              </View>
              <View style={styles.textCol}>
                <Text
                  style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold, fontSize: fontSize.bodySmall }}
                  numberOfLines={1}
                >
                  {copy.title}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, marginTop: 2 }} numberOfLines={2}>
                  {copy.message}
                </Text>
              </View>
            </View>
          </LiquidGlassSurface>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

export function NotificationToastHost({ toasts, onDismiss, onPress }: NotificationToastHostProps) {
  if (toasts.length === 0) return null;

  return (
    <View style={styles.host} pointerEvents="box-none">
      {toasts.map((t) => (
        <SwipeToast
          key={t.toastId}
          toast={t}
          onDismiss={() => onDismiss(t.toastId)}
          onPress={() => {
            onPress(t);
            onDismiss(t.toastId);
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 56,
    left: 12,
    right: 12,
    zIndex: 100,
    gap: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1 },
});
