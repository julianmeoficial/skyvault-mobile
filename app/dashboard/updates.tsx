import { useCallback, useEffect, useState } from 'react';
import { FlatList, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { updatesApiService } from '../../src/features/dashboard/services/updatesApiService';
import { useAuth } from '../../src/features/auth/hooks/useAuth';
import type { AircraftUpdateDto } from '../../src/features/dashboard/types/dashboard.types';
import { UpdateDetailModal } from '../../src/features/dashboard/components/UpdateDetailModal';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Button } from '../../src/components/ui/Button';
import { SkeletonLoader } from '../../src/components/native/SkeletonLoader';
import { EmptyState } from '../../src/components/native/EmptyState';
import { useTheme } from '../../src/theme';
import { getUserFriendlyError } from '../../src/shared/utils/errorMessages';
import { updatesCopy } from '../../src/shared/copy/labels';

type Segment = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MINE';

export default function DashboardUpdatesScreen() {
  const { isAdmin, isModerator } = useAuth();
  const router = useRouter();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const canModerate = isAdmin || isModerator;
  const [segment, setSegment] = useState<Segment>(canModerate ? 'PENDING' : 'MINE');
  const [items, setItems] = useState<AircraftUpdateDto[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AircraftUpdateDto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      if (silent && items.length > 0) setRefreshing(true);
      else setLoading(true);
      setError(null);
      if (canModerate) {
        const [p, a, r] = await Promise.all([
          updatesApiService.listByStatus('PENDING'),
          updatesApiService.listByStatus('APPROVED'),
          updatesApiService.listByStatus('REJECTED'),
        ]);
        setCounts({
          pending: p.content.length,
          approved: a.content.length,
          rejected: r.content.length,
        });
        const active =
          segment === 'PENDING' ? p : segment === 'APPROVED' ? a : segment === 'REJECTED' ? r : p;
        setItems(active.content);
      } else {
        const res = await updatesApiService.listMine();
        setItems(res.content);
      }
    } catch (err) {
      setError(getUserFriendlyError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [canModerate, segment, items.length]);

  useEffect(() => {
    void load();
  }, [load]);

  const openDetail = (item: AircraftUpdateDto) => {
    setSelected(item);
    setModalOpen(true);
  };

  const segments: { key: Segment; label: string }[] = canModerate
    ? [
        { key: 'PENDING', label: `${updatesCopy.staff.pending} (${counts.pending})` },
        { key: 'APPROVED', label: `${updatesCopy.staff.approved} (${counts.approved})` },
        { key: 'REJECTED', label: `${updatesCopy.staff.rejected} (${counts.rejected})` },
      ]
    : [{ key: 'MINE', label: updatesCopy.user.title }];

  if (loading && items.length === 0) return <SkeletonLoader />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
      {!canModerate ? (
        <View style={{ padding: spacing.md }}>
          <Button title={updatesCopy.user.create} onPress={() => router.push('/dashboard/updates/new')} />
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: spacing.md, paddingBottom: 0 }}>
        {segments.map((s) => (
          <Pressable key={s.key} onPress={() => setSegment(s.key)}>
            <Text
              style={{
                color: segment === s.key ? colors.primary : colors.textMuted,
                fontFamily: fontFamily.semibold,
                fontSize: fontSize.caption,
              }}
            >
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.md }}
        onRefresh={() => void load(true)}
        refreshing={refreshing}
        ListEmptyComponent={
          <EmptyState
            title={canModerate ? 'Sin resultados' : 'Sin envíos'}
            message={error ?? 'No hay actualizaciones en este segmento.'}
            actionLabel="Reintentar"
            onAction={load}
          />
        }
        renderItem={({ item }) => (
          <GlassCard style={{ marginBottom: spacing.sm }}>
            <Pressable onPress={() => openDetail(item)}>
              <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold }}>{item.title}</Text>
              <Text style={{ color: colors.textMuted, marginTop: 4 }}>{item.aircraftModelName}</Text>
              <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, marginTop: 4 }}>
                {item.status} · {item.categoryName}
              </Text>
            </Pressable>
            {!canModerate && item.status === 'PENDING' ? (
              <Button
                title="Editar"
                variant="secondary"
                onPress={() => router.push(`/dashboard/updates/new?id=${item.id}`)}
                style={{ marginTop: spacing.sm }}
              />
            ) : null}
          </GlassCard>
        )}
      />
      <UpdateDetailModal
        visible={modalOpen}
        update={selected}
        canModerate={canModerate}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        onMutated={() => void load(true)}
      />
    </View>
  );
}
