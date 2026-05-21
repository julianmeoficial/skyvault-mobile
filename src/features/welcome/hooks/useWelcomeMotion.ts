import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { FadeIn, FadeInDown } from 'react-native-reanimated';

export function useWelcomeMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  const heroEntering = reduceMotion
    ? FadeIn.duration(200)
    : FadeInDown.duration(700).springify().damping(18);

  const stagger = (delayMs: number) =>
    reduceMotion
      ? FadeIn.duration(200)
      : FadeInDown.delay(delayMs).duration(600).springify().damping(20);

  return { heroEntering, stagger, reduceMotion };
}
