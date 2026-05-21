import { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import type { AdminUserDto } from '../types/admin.types';
import type { UserRole } from '../../auth/types/auth.types';
import { adminUserService } from '../services/adminUserService';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ActionSuccessModal } from '../../../components/feedback/ActionSuccessModal';
import { useMutationFeedback } from '../../dashboard/hooks/useMutationFeedback';
import { roleDisplayName } from '../../../shared/copy/labels';
import { getUserFriendlyError } from '../../../shared/utils/errorMessages';
import { useTheme } from '../../../theme';

const ROLES: UserRole[] = ['ROLE_USER', 'ROLE_MODERATOR', 'ROLE_ADMIN'];

interface UserEditModalProps {
  user: AdminUserDto | null;
  visible: boolean;
  onClose: () => void;
  onMutated?: () => void;
}

export function UserEditModal({ user, visible, onClose, onMutated }: UserEditModalProps) {
  const { colors, spacing, fontFamily, fontSize } = useTheme();
  const { saving, success, dismissSuccess, runMutation } = useMutationFeedback();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [localUser, setLocalUser] = useState<AdminUserDto | null>(null);

  useEffect(() => {
    if (user && visible) {
      setLocalUser(user);
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user, visible]);

  if (!user || !localUser) return null;

  const finishSuccess = () => {
    onMutated?.();
    onClose();
  };

  const saveProfile = async () => {
    try {
      await runMutation(
        async () => {
          const updated = await adminUserService.patchUserProfile(localUser.id, {
            username: username.trim(),
            email: email.trim(),
          });
          setLocalUser(updated);
        },
        {
          successTitle: 'Perfil actualizado',
          successSubtitle: 'Los datos del usuario se guardaron correctamente',
          onDone: finishSuccess,
        },
      );
    } catch (err) {
      Alert.alert('Error', getUserFriendlyError(err));
    }
  };

  const changeRole = async (role: UserRole) => {
    if (localUser.role === role) return;
    try {
      await runMutation(
        async () => {
          const updated = await adminUserService.changeUserRole(localUser.id, { role });
          setLocalUser(updated);
        },
        {
          successTitle: 'Rol actualizado',
          successSubtitle: `Ahora es ${roleDisplayName(role)}`,
          onDone: finishSuccess,
        },
      );
    } catch (err) {
      Alert.alert('Error', getUserFriendlyError(err));
    }
  };

  const toggleActive = async () => {
    const enable = !localUser.enabled;
    try {
      await runMutation(
        async () => {
          const updated = enable
            ? await adminUserService.activateUser(localUser.id)
            : await adminUserService.deactivateUser(localUser.id);
          setLocalUser(updated);
        },
        {
          successTitle: enable ? 'Cuenta activada' : 'Cuenta desactivada',
          successSubtitle: enable
            ? 'El usuario puede volver a iniciar sesión'
            : 'El usuario ya no puede iniciar sesión',
          onDone: finishSuccess,
        },
      );
    } catch (err) {
      Alert.alert('Error', getUserFriendlyError(err));
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar usuario',
      `¿Eliminar permanentemente a ${localUser.username}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => void deleteUser(),
        },
      ],
    );
  };

  const deleteUser = async () => {
    try {
      await runMutation(
        async () => {
          await adminUserService.deleteUser(localUser.id);
        },
        {
          successTitle: 'Usuario eliminado',
          successSubtitle: 'Se eliminó de la lista de usuarios',
          onDone: finishSuccess,
        },
      );
    } catch (err) {
      Alert.alert('Error', getUserFriendlyError(err));
    }
  };

  const showForm = !success;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {showForm ? (
        <>
          <Pressable style={styles.backdrop} onPress={onClose} />
          <View style={[styles.sheet, { backgroundColor: colors.bgCard }]}>
            <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.bold, fontSize: fontSize.h5 }}>
              {localUser.username}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, marginTop: spacing.sm }}>
              Estado: {localUser.enabled ? 'Activo' : 'Inactivo'}
            </Text>

            <View style={{ marginTop: spacing.md }}>
              <Input label="Usuario" value={username} onChangeText={setUsername} editable={!saving} />
              <Input
                label="Correo"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!saving}
              />
              <Button title="Guardar datos" onPress={() => void saveProfile()} loading={saving} />
            </View>

            <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.semibold, marginTop: spacing.lg }}>
              Rol
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm }}>
              {ROLES.map((r) => (
                <Button
                  key={r}
                  title={roleDisplayName(r)}
                  variant={localUser.role === r ? 'primary' : 'secondary'}
                  onPress={() => void changeRole(r)}
                  disabled={saving || localUser.role === r}
                />
              ))}
            </View>

            <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
              <Button
                title={localUser.enabled ? 'Desactivar cuenta' : 'Activar cuenta'}
                variant="secondary"
                onPress={() => void toggleActive()}
                disabled={saving}
              />
              <Button title="Eliminar usuario" variant="ghost" onPress={confirmDelete} disabled={saving} />
              <Button title="Cerrar" variant="secondary" onPress={onClose} disabled={saving} />
            </View>
          </View>
        </>
      ) : null}
      <ActionSuccessModal
        visible={!!success}
        title={success?.title ?? ''}
        subtitle={success?.subtitle}
        onDone={dismissSuccess}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
});
