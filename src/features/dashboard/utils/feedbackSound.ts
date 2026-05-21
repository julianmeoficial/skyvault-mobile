import { AccessibilityInfo } from 'react-native';
import * as Haptics from 'expo-haptics';

/** Feedback háptico tras mutación exitosa (sin audio nativo). */
export async function playSuccessChime(): Promise<void> {
  try {
    const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
    if (reduceMotion) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* haptics opcionales */
  }
}
