import { useState } from 'react';
import { FlatList, View, Text, StyleSheet, Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import { RequireRole } from '../../src/features/auth/components/RequireRole';
import { useAuth } from '../../src/features/auth/hooks/useAuth';
import { useAdminAircraftList } from '../../src/features/aircraft/hooks/useAdminAircraftList';
import { AircraftFormModal } from '../../src/features/aircraft/components/AircraftFormModal';
import { AdminAircraftRow } from '../../src/components/native/AdminAircraftRow';
import { SkeletonLoader } from '../../src/components/native/SkeletonLoader';
import { Input } from '../../src/components/ui/Input';
import { useTheme } from '../../src/theme';
import { FLAT_LIST_PERF } from '../../src/shared/constants/flatListPerf';

export default function DashboardAircraftScreen() {
  const { isAdmin } = useAuth();
  const { colors, spacing } = useTheme();
  const { aircraft, isLoading, isRefreshing, error, searchQuery, setSearchQuery, refresh } =
    useAdminAircraftList();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | undefined>();

  const openEdit = (id?: number) => {
    setEditId(id);
    setModalOpen(true);
  };

  if (isLoading && aircraft.length === 0) return <SkeletonLoader />;

  return (
    <RequireRole roles={['ROLE_ADMIN', 'ROLE_MODERATOR']}>
      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
          <Input
            label="Buscar en listado"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Nombre, modelo, fabricante…"
          />
        </View>
        <FlatList
          data={aircraft}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 80 }}
          onRefresh={() => void refresh()}
          refreshing={isRefreshing}
          ListEmptyComponent={
            error ? (
              <Text style={{ color: colors.textMuted, padding: spacing.md, textAlign: 'center' }}>
                {error}
              </Text>
            ) : null
          }
          {...FLAT_LIST_PERF}
          renderItem={({ item }) => (
            <AdminAircraftRow aircraft={item} onPress={() => openEdit(item.id)} />
          )}
        />
        {isAdmin ? (
          <Pressable
            style={[styles.fab, { backgroundColor: colors.primary }]}
            onPress={() => openEdit(undefined)}
          >
            <Plus color="#fff" size={28} />
          </Pressable>
        ) : null}
        <AircraftFormModal
          visible={modalOpen}
          editId={editId}
          onClose={() => setModalOpen(false)}
          onSaved={() => void refresh()}
        />
      </View>
    </RequireRole>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
