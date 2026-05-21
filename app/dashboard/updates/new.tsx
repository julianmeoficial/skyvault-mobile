import { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { useRouter, Redirect, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../src/features/auth/hooks/useAuth';
import {
  updatesApiService,
  formMetaToCreatePayload,
  type UpdateFormMeta,
  type UpdateType,
  type UpdateAudience,
} from '../../../src/features/dashboard/services/updatesApiService';
import { comparisonService } from '../../../src/features/comparison/services/comparisonService';
import type { AircraftOption } from '../../../src/shared/types/comparison.types';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { LiquidGlassButton } from '../../../src/components/ui/liquid-glass/LiquidGlassButton';
import { SkeletonLoader } from '../../../src/components/native/SkeletonLoader';
import { ActionSuccessModal } from '../../../src/components/feedback/ActionSuccessModal';
import { useMutationFeedback } from '../../../src/features/dashboard/hooks/useMutationFeedback';
import { updatesCopy } from '../../../src/shared/copy/labels';
import { useTheme } from '../../../src/theme';
import { getUserFriendlyError } from '../../../src/shared/utils/errorMessages';

const TYPES: UpdateType[] = ['Feature', 'Security', 'Update', 'Fix'];
const AUDIENCES: UpdateAudience[] = ['All', 'Admin Only', 'Beta'];

const defaultForm = (): UpdateFormMeta => ({
  version: 'v1.0.0',
  type: 'Update',
  title: '',
  description: '',
  audience: 'All',
  aircraftModelId: 0,
  categoryId: 0,
});

export default function NewUpdateScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editId = id ? Number(id) : undefined;
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { colors, spacing, fontFamily, fontSize } = useTheme();
  const { saving, success, dismissSuccess, runMutation } = useMutationFeedback();
  const [aircraftOptions, setAircraftOptions] = useState<AircraftOption[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; description?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [aircraftSearch, setAircraftSearch] = useState('');
  const [form, setForm] = useState<UpdateFormMeta>(defaultForm());

  const loadAircraft = useCallback(async (q: string) => {
    const { options } = await comparisonService.fetchAllAircraftOptions({
      search: q.trim(),
      size: 80,
    });
    setAircraftOptions(options);
    return options;
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const cats = await updatesApiService.listCategories();
        setCategories(cats);
        const opts = await loadAircraft('');
        if (editId) {
          const existing = await updatesApiService.getById(editId);
          setForm({
            version: 'v1.0.0',
            type: 'Update',
            title: existing.title ?? '',
            description: existing.content ?? '',
            audience: 'All',
            aircraftModelId: existing.aircraftModelId ?? 0,
            categoryId: existing.categoryId ?? cats[0]?.id ?? 0,
          });
        } else {
          setForm((f) => ({
            ...f,
            categoryId: cats[0]?.id ?? 0,
            aircraftModelId: opts[0] ? Number(opts[0].id) : 0,
          }));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user, editId, loadAircraft]);

  useEffect(() => {
    const t = setTimeout(() => void loadAircraft(aircraftSearch), 300);
    return () => clearTimeout(t);
  }, [aircraftSearch, loadAircraft]);

  const validate = (): string | null => {
    if (!form.title.trim()) return 'El título es obligatorio.';
    if (!form.description.trim()) return 'La descripción es obligatoria.';
    if (!form.aircraftModelId) return 'Selecciona una aeronave.';
    if (!form.categoryId) return 'Selecciona una categoría.';
    return null;
  };

  const submit = async (publishImmediately = false) => {
    const err = validate();
    if (err) {
      Alert.alert('Revisa el formulario', err);
      return;
    }
    const payload = formMetaToCreatePayload(form);
    try {
      await runMutation(
        async () => {
          if (editId) {
            await updatesApiService.update(editId, payload);
          } else {
            const created = await updatesApiService.create(payload);
            if (publishImmediately && isAdmin) {
              await updatesApiService.approve(created.id);
            }
          }
        },
        {
          successTitle: editId
            ? 'Reporte actualizado'
            : publishImmediately
              ? 'Reporte publicado'
              : 'Reporte enviado',
          successSubtitle: editId
            ? 'Los cambios quedaron guardados'
            : publishImmediately
              ? 'Aprobado al instante'
              : 'Tu sugerencia está en revisión',
          onDone: () => router.replace('/dashboard/updates'),
        },
      );
    } catch (e) {
      Alert.alert('Error', getUserFriendlyError(e));
    }
  };

  if (!user) return <Redirect href="/(auth)/login" />;
  if (loading) return <SkeletonLoader />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bgMain }} contentContainerStyle={{ padding: spacing.md }}>
      <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.bold, fontSize: fontSize.h5 }}>
        {editId ? 'Editar reporte' : updatesCopy.user.create}
      </Text>

      <Input
        label="Versión"
        value={form.version}
        onChangeText={(version) => setForm((f) => ({ ...f, version }))}
        placeholder="Ej. v2.1.5"
      />
      <Text style={{ color: colors.textMuted, marginTop: spacing.sm }}>Tipo</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: spacing.xs }}>
        {TYPES.map((t) => (
          <LiquidGlassButton
            key={t}
            title={t}
            variant={form.type === t ? 'primary' : 'secondary'}
            onPress={() => setForm((f) => ({ ...f, type: t }))}
          />
        ))}
      </View>
      <Text style={{ color: colors.textMuted, marginTop: spacing.sm }}>Audiencia</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: spacing.xs }}>
        {AUDIENCES.map((a) => (
          <LiquidGlassButton
            key={a}
            title={a}
            variant={form.audience === a ? 'primary' : 'secondary'}
            onPress={() => setForm((f) => ({ ...f, audience: a }))}
          />
        ))}
      </View>

      <Input label="Título" value={form.title} onChangeText={(title) => setForm((f) => ({ ...f, title }))} />
      <Input
        label="Descripción"
        value={form.description}
        onChangeText={(description) => setForm((f) => ({ ...f, description }))}
        multiline
      />

      <Input
        label="Buscar aeronave"
        value={aircraftSearch}
        onChangeText={setAircraftSearch}
        placeholder="Nombre o modelo…"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: spacing.sm }}>
        <View style={{ flexDirection: 'row', gap: 6, paddingRight: spacing.md }}>
          {aircraftOptions.map((a) => (
            <LiquidGlassButton
              key={a.id}
              title={a.displayName}
              variant={form.aircraftModelId === Number(a.id) ? 'primary' : 'secondary'}
              onPress={() => setForm((f) => ({ ...f, aircraftModelId: Number(a.id) }))}
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
            variant={form.categoryId === c.id ? 'primary' : 'secondary'}
            onPress={() => setForm((f) => ({ ...f, categoryId: c.id }))}
          />
        ))}
      </View>
      {categories.find((c) => c.id === form.categoryId)?.description ? (
        <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, marginBottom: spacing.sm }}>
          {categories.find((c) => c.id === form.categoryId)?.description}
        </Text>
      ) : null}

      <Button
        title={saving ? 'Guardando…' : editId ? 'Guardar cambios' : 'Enviar a revisión'}
        onPress={() => void submit(false)}
      />
      {isAdmin && !editId ? (
        <Button
          title="Publicar al instante"
          variant="secondary"
          onPress={() => void submit(true)}
          style={{ marginTop: spacing.sm }}
        />
      ) : null}

      <ActionSuccessModal
        visible={!!success}
        title={success?.title ?? ''}
        subtitle={success?.subtitle}
        onDone={dismissSuccess}
      />
    </ScrollView>
  );
}
