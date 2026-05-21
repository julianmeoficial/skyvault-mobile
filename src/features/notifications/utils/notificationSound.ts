import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { NotificationPriority } from '../types/notification.types';

/** Feedback háptico al recibir notificación (sin expo-av / ExponentAV). */
export async function playIncomingNotificationFeedback(
  priority: NotificationPriority = 'NORMAL',
): Promise<void> {
  try {
    const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
    if (reduceMotion) return;

    if (priority === 'HIGH') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    /* haptics no disponibles en este runtime */
  }
}

/** @deprecated usar playIncomingNotificationFeedback */
export const playHighPriorityNotificationSound = playIncomingNotificationFeedback;
