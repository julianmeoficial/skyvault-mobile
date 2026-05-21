import { useEffect, useState, useCallback, useRef } from 'react';
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
import { aircraftService } from '../services/aircraftService';
import { familyService } from '../../families/services/familyService';
import type { AircraftCreatePayload, CatalogSummaryDto, ManufacturerSummaryDto } from '../../../shared/types/aircraft.types';
import type { FamilyDto } from '../../families/types/family.types';
import { Input } from '../../../components/ui/Input';
import { LiquidGlassButton } from '../../../components/ui/liquid-glass/LiquidGlassButton';
import { useMutationFeedback } from '../../dashboard/hooks/useMutationFeedback';
import { ActionSuccessModal } from '../../../components/feedback/ActionSuccessModal';
import { useAuth } from '../../auth/hooks/useAuth';
import { useTheme } from '../../../theme';
import { getUserFriendlyError } from '../../../shared/utils/errorMessages';
import {
  applyCargoPassengers,
  detailToCreatePayload,
  resolveIsCargoType,
  validateAircraftForm,
  validateAircraftFormStep,
} from '../utils/aircraftFormUtils';

const ADMIN_STEPS = ['Identidad', 'Catálogos', 'Rendimiento', 'Imagen', 'Resumen'] as const;
const MOD_STEPS = ['Edición moderador'] as const;

const defaultForm = (): AircraftCreatePayload => ({
  name: '',
  model: '',
  displayName: '',
  description: '',
  manufacturerId: 0,
  familyId: 0,
  typeId: 0,
  productionStateId: 0,
  sizeCategoryId: 0,
  introductionYear: new Date().getFullYear(),
  firstFlightDate: '',
  typicalPassengers: 150,
  maxPassengers: 180,
  rangeKm: 5000,
  cruiseSpeedKnots: 450,
  serviceCeilingFt: undefined,
  minCrew: 2,
  isActive: true,
  primaryImageUrl: '',
});

interface AircraftFormModalProps {
  visible: boolean;
  editId?: number;
  onClose: () => void;
  onSaved?: () => void;
}

function ChipRow({
  items,
  selectedId,
  onSelect,
}: {
  items: { id: number; name: string }[];
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  const { spacing } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6, paddingVertical: spacing.xs }}
    >
      {items.map((item) => (
        <LiquidGlassButton
          key={item.id}
          title={item.name}
          variant={selectedId === item.id ? 'primary' : 'secondary'}
          onPress={() => onSelect(item.id)}
        />
      ))}
    </ScrollView>
  );
}

export function AircraftFormModal({ visible, editId, onClose, onSaved }: AircraftFormModalProps) {
  const { isAdmin, isModerator } = useAuth();
  const { colors, spacing, fontFamily, fontSize } = useTheme();
  const { saving, success, dismissSuccess, runMutation } = useMutationFeedback();
  const moderatorOnly = isModerator && !isAdmin && !!editId;
  const steps = moderatorOnly ? MOD_STEPS : ADMIN_STEPS;
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<CatalogSummaryDto | null>(null);
  const [manufacturers, setManufacturers] = useState<ManufacturerSummaryDto[]>([]);
  const [families, setFamilies] = useState<FamilyDto[]>([]);
  const [form, setForm] = useState<AircraftCreatePayload>(defaultForm());
  const sizeSuggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;
    setStep(0);
    setForm(defaultForm());
    (async () => {
      setLoading(true);
      try {
        const [cat, mans] = await Promise.all([
          aircraftService.getCatalogSummary(),
          aircraftService.getManufacturers(false),
        ]);
        setCatalog(cat);
        setManufacturers(mans);
        if (editId) {
          const detail = await aircraftService.getAircraftDetail(editId);
          let next = detailToCreatePayload(detail);
          next = applyCargoPassengers(next, cat.types);
          setForm(next);
          if (detail.manufacturer?.id) {
            setFamilies(await familyService.getFamiliesSummary(detail.manufacturer.id));
          }
        } else if (isAdmin && mans[0]) {
          const fams = await familyService.getFamiliesSummary(mans[0].id);
          setFamilies(fams);
          setForm({
            ...defaultForm(),
            manufacturerId: mans[0].id,
            familyId: fams[0]?.id ?? 0,
            typeId: cat.types[0]?.id ?? 0,
            productionStateId: cat.productionStates[0]?.id ?? 0,
            sizeCategoryId: cat.sizeCategories[0]?.id ?? 0,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [visible, editId, isAdmin]);

  const onManufacturerChange = async (manufacturerId: number) => {
    setForm((f) => ({ ...f, manufacturerId, familyId: 0 }));
    const fams = await familyService.getFamiliesSummary(manufacturerId);
    setFamilies(fams);
    if (fams[0]) setForm((f) => ({ ...f, manufacturerId, familyId: fams[0].id }));
  };

  const onTypeChange = (typeId: number) => {
    if (!catalog) {
      setForm((f) => ({ ...f, typeId }));
      return;
    }
    setForm((f) => applyCargoPassengers({ ...f, typeId }, catalog.types));
  };

  const suggestSizeCategory = useCallback(
    (typicalPassengers: number) => {
      if (!catalog || resolveIsCargoType(form.typeId, catalog.types)) return;
      if (sizeSuggestTimer.current) clearTimeout(sizeSuggestTimer.current);
      sizeSuggestTimer.current = setTimeout(() => {
        void (async () => {
          try {
            const cat = await aircraftService.determineSizeCategory(typicalPassengers);
            if (cat?.id) setForm((f) => ({ ...f, sizeCategoryId: cat.id }));
          } catch {
            /* ignore */
          }
        })();
      }, 400);
    },
    [catalog, form.typeId],
  );

  const goNext = () => {
    if (moderatorOnly) {
      void save();
      return;
    }
    const err = validateAircraftFormStep(step, form, catalog);
    if (err) {
      Alert.alert('Revisa el formulario', err);
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const save = async () => {
    if (moderatorOnly && editId) {
      try {
        await runMutation(
          async () => {
            await aircraftService.updateAircraft(editId, {
              name: form.name,
              model: form.model,
              displayName: form.displayName,
              isActive: form.isActive,
            });
          },
          {
            successTitle: 'Aeronave guardada',
            successSubtitle: 'Los cambios ya están en el catálogo',
            onDone: () => {
              onClose();
              onSaved?.();
            },
          },
        );
      } catch (err) {
        Alert.alert('Error', getUserFriendlyError(err));
      }
      return;
    }

    const err = validateAircraftForm(form, catalog);
    if (err) {
      Alert.alert('Revisa el formulario', err);
      return;
    }

    const payload = catalog ? applyCargoPassengers(form, catalog.types) : form;
    const body: AircraftCreatePayload = { ...payload };
    if (!body.primaryImageUrl?.trim()) delete body.primaryImageUrl;
    if (!body.firstFlightDate?.trim()) delete body.firstFlightDate;
    if (!body.displayName?.trim()) delete body.displayName;
    if (!body.description?.trim()) delete body.description;

    try {
      await runMutation(
        async () => {
          if (editId) {
            await aircraftService.updateAircraft(editId, body);
          } else if (isAdmin) {
            await aircraftService.createAircraft(body);
          }
        },
        {
          successTitle: editId ? 'Aeronave guardada' : 'Aeronave creada',
          successSubtitle: 'Los cambios ya están en el catálogo',
          onDone: () => {
            onClose();
            onSaved?.();
          },
        },
      );
    } catch (err) {
      Alert.alert('Error', getUserFriendlyError(err));
    }
  };

  const showForm = !success;

  const renderModeratorStep = () => (
    <>
      <Input label="Nombre" value={form.name} onChangeText={(name) => setForm((f) => ({ ...f, name }))} />
      <Input label="Modelo" value={form.model} onChangeText={(model) => setForm((f) => ({ ...f, model }))} />
      <Input
        label="Nombre visible"
        value={form.displayName ?? ''}
        onChangeText={(displayName) => setForm((f) => ({ ...f, displayName }))}
      />
      <Pressable
        onPress={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
        style={{ marginTop: spacing.md }}
      >
        <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.medium }}>
          Activa en catálogo: {form.isActive ? 'Sí' : 'No'}
        </Text>
      </Pressable>
    </>
  );

  const renderStep = () => {
    if (moderatorOnly) return renderModeratorStep();
    if (!catalog) return null;

    switch (step) {
      case 0:
        return (
          <>
            <Input label="Nombre" value={form.name} onChangeText={(name) => setForm((f) => ({ ...f, name }))} />
            <Input label="Modelo" value={form.model} onChangeText={(model) => setForm((f) => ({ ...f, model }))} />
            <Input
              label="Nombre visible"
              value={form.displayName ?? ''}
              onChangeText={(displayName) => setForm((f) => ({ ...f, displayName }))}
            />
            <Input
              label="Descripción"
              value={form.description ?? ''}
              onChangeText={(description) => setForm((f) => ({ ...f, description }))}
              multiline
            />
          </>
        );
      case 1:
        return (
          <>
            <Text style={{ color: colors.textMuted, marginBottom: spacing.xs }}>Fabricante</Text>
            <ChipRow
              items={manufacturers}
              selectedId={form.manufacturerId}
              onSelect={(id) => void onManufacturerChange(id)}
            />
            <Text style={{ color: colors.textMuted, marginTop: spacing.sm }}>Familia</Text>
            <ChipRow
              items={families}
              selectedId={form.familyId}
              onSelect={(familyId) => setForm((f) => ({ ...f, familyId }))}
            />
            <Text style={{ color: colors.textMuted, marginTop: spacing.sm }}>Tipo</Text>
            <ChipRow items={catalog.types} selectedId={form.typeId} onSelect={onTypeChange} />
            <Text style={{ color: colors.textMuted, marginTop: spacing.sm }}>Estado de producción</Text>
            <ChipRow
              items={catalog.productionStates}
              selectedId={form.productionStateId}
              onSelect={(productionStateId) => setForm((f) => ({ ...f, productionStateId }))}
            />
            <Text style={{ color: colors.textMuted, marginTop: spacing.sm }}>Categoría de tamaño</Text>
            <ChipRow
              items={catalog.sizeCategories}
              selectedId={form.sizeCategoryId}
              onSelect={(sizeCategoryId) => setForm((f) => ({ ...f, sizeCategoryId }))}
            />
          </>
        );
      case 2:
        return (
          <>
            <Input
              label="Año de introducción"
              value={String(form.introductionYear)}
              onChangeText={(v) =>
                setForm((f) => ({ ...f, introductionYear: Number(v) || new Date().getFullYear() }))
              }
              keyboardType="numeric"
            />
            <Input
              label="Primer vuelo (AAAA-MM-DD)"
              value={form.firstFlightDate ?? ''}
              onChangeText={(firstFlightDate) => setForm((f) => ({ ...f, firstFlightDate }))}
            />
            <Input
              label="Pasajeros típicos"
              value={String(form.typicalPassengers)}
              onChangeText={(v) => {
                const typicalPassengers = Number(v) || 0;
                setForm((f) => ({ ...f, typicalPassengers }));
                suggestSizeCategory(typicalPassengers);
              }}
              keyboardType="numeric"
            />
            <Input
              label="Pasajeros máximos"
              value={String(form.maxPassengers)}
              onChangeText={(v) => setForm((f) => ({ ...f, maxPassengers: Number(v) || 0 }))}
              keyboardType="numeric"
            />
            <Input
              label="Alcance (km)"
              value={String(form.rangeKm)}
              onChangeText={(v) => setForm((f) => ({ ...f, rangeKm: Number(v) || 0 }))}
              keyboardType="numeric"
            />
            <Input
              label="Velocidad crucero (nudos)"
              value={String(form.cruiseSpeedKnots)}
              onChangeText={(v) => setForm((f) => ({ ...f, cruiseSpeedKnots: Number(v) || 0 }))}
              keyboardType="numeric"
            />
            <Input
              label="Techo de servicio (ft)"
              value={form.serviceCeilingFt != null ? String(form.serviceCeilingFt) : ''}
              onChangeText={(v) =>
                setForm((f) => ({
                  ...f,
                  serviceCeilingFt: v.trim() ? Number(v) : undefined,
                }))
              }
              keyboardType="numeric"
            />
            <Input
              label="Tripulación mínima"
              value={form.minCrew != null ? String(form.minCrew) : ''}
              onChangeText={(v) =>
                setForm((f) => ({ ...f, minCrew: v.trim() ? Number(v) : undefined }))
              }
              keyboardType="numeric"
            />
            <Pressable
              onPress={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              style={{ marginTop: spacing.md }}
            >
              <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.medium }}>
                Activa en catálogo: {form.isActive ? 'Sí' : 'No'}
              </Text>
            </Pressable>
          </>
        );
      case 3:
        return (
          <Input
            label="URL imagen principal (https)"
            value={form.primaryImageUrl ?? ''}
            onChangeText={(primaryImageUrl) => setForm((f) => ({ ...f, primaryImageUrl }))}
            autoCapitalize="none"
          />
        );
      case 4:
        return (
          <View style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.bold, fontSize: fontSize.h5 }}>
              {form.displayName || form.name}
            </Text>
            <Text style={{ color: colors.textMuted }}>{form.model}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.bodySmall }}>
              {form.description || 'Sin descripción'}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.caption }}>
              {form.typicalPassengers}–{form.maxPassengers} pax · {form.rangeKm} km ·{' '}
              {form.isActive ? 'Activa' : 'Inactiva'}
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {showForm ? (
        <KeyboardAvoidingView
          style={[styles.container, { backgroundColor: colors.bgMain }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.bold, fontSize: fontSize.h5 }}>
              {editId ? 'Editar aeronave' : 'Nueva aeronave'}
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X color={colors.textMuted} size={24} />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stepsScroll}>
            <View style={styles.steps}>
              {steps.map((label, i) => (
                <Text
                  key={label}
                  style={{
                    color: i === step ? colors.primary : colors.textMuted,
                    fontFamily: fontFamily.semibold,
                    fontSize: fontSize.caption,
                    marginRight: spacing.md,
                  }}
                >
                  {i + 1}. {label}
                </Text>
              ))}
            </View>
          </ScrollView>
          {loading ? (
            <Text style={{ color: colors.textMuted, padding: spacing.md }}>Cargando…</Text>
          ) : (
            <ScrollView
              contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              {renderStep()}
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, flexWrap: 'wrap' }}>
                {step > 0 && !moderatorOnly ? (
                  <LiquidGlassButton title="Atrás" variant="secondary" onPress={() => setStep((s) => s - 1)} />
                ) : null}
                {moderatorOnly || step < steps.length - 1 ? (
                  <LiquidGlassButton title="Siguiente" onPress={goNext} />
                ) : (
                  <LiquidGlassButton
                    title={saving ? 'Guardando…' : 'Guardar'}
                    onPress={() => void save()}
                  />
                )}
              </View>
            </ScrollView>
          )}
        </KeyboardAvoidingView>
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
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  stepsScroll: { maxHeight: 28, marginBottom: 8 },
  steps: { flexDirection: 'row', paddingHorizontal: 12 },
});
