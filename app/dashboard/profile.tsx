import { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { userService } from '../../src/features/auth/services/userService';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { ActionSuccessModal } from '../../src/components/feedback/ActionSuccessModal';
import { useMutationFeedback } from '../../src/features/dashboard/hooks/useMutationFeedback';
import { useTheme } from '../../src/theme';
import { getUserFriendlyError } from '../../src/shared/utils/errorMessages';
import { Alert } from 'react-native';

export default function DashboardProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { colors, spacing } = useTheme();
  const [username, setUsername] = useState(user?.username ?? '');
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const { saving, success, dismissSuccess, runMutation } = useMutationFeedback();

  const handleSuccessDone = useCallback(() => {
    dismissSuccess();
    router.back();
  }, [dismissSuccess, router]);

  const handleSave = async () => {
    try {
      await runMutation(
        async () => {
          const updated = await userService.updateProfile({ username, fullName });
          setUser(updated);
        },
        {
          successTitle: 'Perfil actualizado',
          successSubtitle: 'Tus datos se guardaron correctamente',
        },
      );
    } catch (err) {
      Alert.alert('Error', getUserFriendlyError(err));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgMain, padding: spacing.lg }}>
      <Text style={{ color: colors.textMuted, marginBottom: spacing.md }}>{user?.email}</Text>
      <Input label="Nombre visible" value={username} onChangeText={setUsername} />
      <View style={{ height: spacing.sm }} />
      <Input label="Nombre completo" value={fullName} onChangeText={setFullName} />
      <View style={{ height: spacing.lg }} />
      <Button title="Guardar cambios" onPress={() => void handleSave()} loading={saving} />
      <ActionSuccessModal
        visible={!!success}
        title={success?.title ?? ''}
        subtitle={success?.subtitle}
        onDone={handleSuccessDone}
      />
    </View>
  );
}
