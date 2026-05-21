import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { FadeIn, FadeInDown } from 'react-native-reanimated';

export function useStaggerEntrance() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  const entering = reduceMotion
    ? FadeIn.duration(200)
    : FadeInDown.duration(500).springify().damping(20);

  const stagger = (delayMs: number, durationMs = 500) =>
    reduceMotion
      ? FadeIn.duration(200)
      : FadeInDown.delay(delayMs).duration(durationMs).springify().damping(20);

  const staggerIndex = (index: number, baseDelayMs = 60) => stagger(index * baseDelayMs);

  return { entering, stagger, staggerIndex, reduceMotion };
}
