import { useCallback, useState } from 'react';
import { playSuccessChime } from '../utils/feedbackSound';

export interface MutationFeedbackOptions {
  successTitle: string;
  successSubtitle?: string;
  onDone?: () => void;
}

export function useMutationFeedback() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<{ title: string; subtitle?: string } | null>(null);
  const [pendingDone, setPendingDone] = useState<(() => void) | undefined>();

  const dismissSuccess = useCallback(() => {
    setSuccess(null);
    const done = pendingDone;
    setPendingDone(undefined);
    done?.();
  }, [pendingDone]);

  const runMutation = useCallback(
    async <T>(fn: () => Promise<T>, options: MutationFeedbackOptions): Promise<T | undefined> => {
      setSaving(true);
      try {
        const result = await fn();
        setPendingDone(() => options.onDone);
        setSuccess({ title: options.successTitle, subtitle: options.successSubtitle });
        void playSuccessChime();
        return result;
      } catch (e) {
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return { saving, success, dismissSuccess, runMutation };
}
