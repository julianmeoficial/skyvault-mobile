import { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import {
  updatesApiService,
  formMetaToCreatePayload,
  type UpdateFormMeta,
} from '../services/updatesApiService';
import type { AircraftUpdateDto } from '../types/dashboard.types';
import { comparisonService } from '../../comparison/services/comparisonService';
import type { AircraftOption } from '../../../shared/types/comparison.types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { LiquidGlassButton } from '../../../components/ui/liquid-glass/LiquidGlassButton';
import { useMutationFeedback } from '../hooks/useMutationFeedback';
import { ActionSuccessModal } from '../../../components/feedback/ActionSuccessModal';
import { useTheme } from '../../../theme';
import { getUserFriendlyError } from '../../../shared/utils/errorMessages';
import { updatesCopy } from '../../../shared/copy/labels';

export type UpdateModalMode = 'detail' | 'reject' | 'edit';

interface UpdateDetailModalProps {
  visible: boolean;
  update: AircraftUpdateDto | null;
  canModerate: boolean;
  onClose: () => void;
  onMutated: () => void;
}

function statusLabel(status: AircraftUpdateDto['status']): string {
  if (status === 'APPROVED') return 'Aprobado';
  if (status === 'PENDING') return 'Pendiente';
  return 'Rechazado';
}

export function UpdateDetailModal({
  visible,
  update,
  canModerate,
  onClose,
  onMutated,
}: UpdateDetailModalProps) {
  const { colors, spacing, fontFamily, fontSize } = useTheme();
  const { saving, success, dismissSuccess, runMutation } = useMutationFeedback();
  const [mode, setMode] = useState<UpdateModalMode>('detail');
  const [rejectReason, setRejectReason] = useState('');
  const [aircraftOptions, setAircraftOptions] = useState<AircraftOption[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [aircraftSearch, setAircraftSearch] = useState('');

  const [editForm, setEditForm] = useState<UpdateFormMeta>({
    version: 'v1.0.0',
    type: 'Update',
    title: '',
    description: '',
    audience: 'All',
    aircraftModelId: 0,
    categoryId: 0,
  });

  useEffect(() => {
    if (!visible || !update) return;
    setMode('detail');
    setRejectReason('');
    setEditForm({
      version: 'v1.0.0',
      type: 'Update',
      title: update.title,
      description: update.content,
      audience: 'All',
      aircraftModelId: update.aircraftModelId,
      categoryId: update.categoryId ?? 0,
    });
    void (async () => {
      const [opts, cats] = await Promise.all([
        comparisonService.fetchAllAircraftOptions({ search: '', size: 80 }),
        updatesApiService.listCategories(),
      ]);
      setAircraftOptions(opts.options);
      setCategories(cats);
    })();
  }, [visible, update]);

  const loadAircraft = useCallback(async (q: string) => {
    const { options } = await comparisonService.fetchAllAircraftOptions({
      search: q.trim(),
      size: 80,
    });
    setAircraftOptions(options);
  }, []);

  useEffect(() => {
    if (!visible || mode !== 'edit') return;
    const t = setTimeout(() => void loadAircraft(aircraftSearch), 300);
    return () => clearTimeout(t);
  }, [aircraftSearch, visible, mode, loadAircraft]);

  const close = () => {
    setMode('detail');
    onClose();
  };

  const approve = async () => {
    if (!update) return;
    try {
      await runMutation(
        async () => {
          await updatesApiService.approve(update.id);
        },
        {
          successTitle: 'Reporte aprobado',
          successSubtitle: 'Ya está publicado en el flujo de moderación',
          onDone: () => {
            onMutated();
            close();
          },
        },
      );
    } catch (err) {
      Alert.alert('Error', getUserFriendlyError(err));
    }
  };

  const confirmReject = async () => {
    if (!update) return;
    const reason = rejectReason.trim();
    if (!reason) {
      Alert.alert('Motivo obligatorio', 'Indica por qué se rechaza el reporte.');
      return;
    }
    if (reason.length > 500) {
      Alert.alert('Motivo demasiado largo', 'Máximo 500 caracteres.');
      return;
    }
    try {
      await runMutation(
        async () => {
          await updatesApiService.reject(update.id, { reason });
        },
        {
          successTitle: 'Reporte rechazado',
          successSubtitle: 'El autor verá el motivo en su notificación',
          onDone: () => {
            onMutated();
            close();
          },
        },
      );
    } catch (err) {
      Alert.alert('Error', getUserFriendlyError(err));
    }
  };

  const saveEdit = async () => {
    if (!update) return;
    if (!editForm.title.trim() || !editForm.description.trim()) {
      Alert.alert('Completa título y descripción');
      return;
    }
    if (!editForm.aircraftModelId || !editForm.categoryId) {
      Alert.alert('Selecciona aeronave y categoría');
      return;
    }
    try {
      await runMutation(
        async () => {
          await updatesApiService.update(update.id, formMetaToCreatePayload(editForm));
        },
        {
          successTitle: 'Reporte actualizado',
          onDone: () => {
            onMutated();
            close();
          },
        },
      );
    } catch (err) {
      Alert.alert('Error', getUserFriendlyError(err));
    }
  };

  if (!update) return null;

  const showModerationActions =
    canModerate && update.status === 'PENDING' && mode === 'detail';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.bgMain }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.bold, fontSize: fontSize.h5 }}>
            {mode === 'reject' ? 'Rechazar reporte' : mode === 'edit' ? 'Editar reporte' : update.title}
          </Text>
          <Pressable onPress={close} hitSlop={12}>
            <X color={colors.textMuted} size={24} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {mode === 'detail' ? (
            <>
              <Text style={{ color: colors.textMuted, fontSize: fontSize.caption }}>
                {statusLabel(update.status)} · {update.categoryName ?? '—'} · {update.aircraftModelName ?? '—'}
              </Text>
              {update.createdAt ? (
                <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, marginTop: 4 }}>
                  Creado: {new Date(update.createdAt).toLocaleString('es')}
                </Text>
              ) : null}
              <Text
                style={{
                  color: colors.textPrimary,
                  marginTop: spacing.md,
                  lineHeight: 22,
                  fontSize: fontSize.bodySmall,
                }}
              >
                {update.content}
              </Text>
              {update.status === 'REJECTED' && update.rejectionReason ? (
                <View
                  style={{
                    marginTop: spacing.md,
                    padding: spacing.md,
                    backgroundColor: colors.bgSection,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold }}>
                    Motivo de rechazo
                  </Text>
                  <Text style={{ color: colors.textMuted, marginTop: spacing.xs }}>{update.rejectionReason}</Text>
                </View>
              ) : null}
            </>
          ) : null}

          {mode === 'reject' ? (
            <>
              <Text style={{ color: colors.textMuted, marginBottom: spacing.sm }}>
                El autor recibirá este motivo (máx. 500 caracteres).
              </Text>
              <Input
                label="Motivo de rechazo"
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                placeholder="Explica qué falta o por qué no se aprueba…"
              />
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
                <LiquidGlassButton title="Cancelar" variant="secondary" onPress={() => setMode('detail')} />
                <LiquidGlassButton
                  title={saving ? 'Rechazando…' : 'Confirmar rechazo'}
                  onPress={() => void confirmReject()}
                />
              </View>
            </>
          ) : null}

          {mode === 'edit' ? (
            <>
              <Input
                label="Título"
                value={editForm.title}
                onChangeText={(title) => setEditForm((f) => ({ ...f, title }))}
              />
              <Input
                label="Contenido / descripción"
                value={editForm.description}
                onChangeText={(description) => setEditForm((f) => ({ ...f, description }))}
                multiline
              />
              <Input
                label="Buscar aeronave"
                value={aircraftSearch}
                onChangeText={setAircraftSearch}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: spacing.sm }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {aircraftOptions.map((a) => (
                    <LiquidGlassButton
                      key={a.id}
                      title={a.displayName}
                      variant={editForm.aircraftModelId === Number(a.id) ? 'primary' : 'secondary'}
                      onPress={() => setEditForm((f) => ({ ...f, aircraftModelId: Number(a.id) }))}
                    />
                  ))}
                </View>
              </ScrollView>
              <Text style={{ color: colors.textMuted }}>Categoría</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: spacing.sm }}>
                {categories.map((c) => (
                  <LiquidGlassButton
                    key={c.id}
                    title={c.name}
                    variant={editForm.categoryId === c.id ? 'primary' : 'secondary'}
                    onPress={() => setEditForm((f) => ({ ...f, categoryId: c.id }))}
                  />
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
                <LiquidGlassButton title="Cancelar" variant="secondary" onPress={() => setMode('detail')} />
                <LiquidGlassButton title={saving ? 'Guardando…' : 'Guardar'} onPress={() => void saveEdit()} />
              </View>
            </>
          ) : null}

          {showModerationActions ? (
            <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
              <Button title={updatesCopy.staff.approve} onPress={() => void approve()} />
              <Button title={updatesCopy.staff.reject} variant="ghost" onPress={() => setMode('reject')} />
              <Button title="Editar" variant="secondary" onPress={() => setMode('edit')} />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
});
