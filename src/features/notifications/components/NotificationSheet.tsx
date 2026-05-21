import {
  Modal,
  SectionList,
  Pressable,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { X, FileText, Plane, Info } from 'lucide-react-native';
import { useMemo } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { EmptyState } from '../../../components/native/EmptyState';
import { LiquidGlassSurface } from '../../../components/ui/liquid-glass/LiquidGlassSurface';
import { Button } from '../../../components/ui/Button';
import { getNotificationDisplayCopy } from '../../../shared/copy/notificationCopy';
import type { UserNotificationDto, UserNotificationType } from '../types/notification.types';
import { useTheme } from '../../../theme';

function iconForType(type: UserNotificationType) {
  if (type.startsWith('UPDATE')) return FileText;
  if (type.startsWith('AIRCRAFT')) return Plane;
  return Info;
}

export function NotificationSheet() {
  const {
    panelOpen,
    togglePanel,
    items,
    loading,
    listError,
    refreshList,
    markAllRead,
    dismiss,
    openNotification,
  } = useNotifications();
  const { colors, spacing, fontFamily, fontSize } = useTheme();

  const sections = useMemo(() => {
    const unread = items.filter((n) => !n.read);
    const read = items.filter((n) => n.read);
    const out: { title: string; data: UserNotificationDto[] }[] = [];
    if (unread.length) out.push({ title: 'Sin leer', data: unread });
    if (read.length) out.push({ title: 'Leídas', data: read });
    return out;
  }, [items]);

  return (
    <Modal visible={panelOpen} animationType="slide" transparent onRequestClose={togglePanel}>
      <Pressable style={styles.backdrop} onPress={togglePanel} />
      <View style={[styles.sheet, { backgroundColor: colors.bgCard }]}>
        <View style={styles.header}>
          <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.bold, fontSize: fontSize.h5 }}>
            Notificaciones
          </Text>
          <Pressable onPress={togglePanel} hitSlop={12}>
            <X color={colors.textMuted} size={24} />
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
          <Button title="Marcar todas como leídas" variant="secondary" onPress={() => void markAllRead()} />
        </View>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            stickySectionHeadersEnabled
            contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
            ListEmptyComponent={
              listError ? (
                <EmptyState
                  title="No se pudieron cargar"
                  message={listError}
                  actionLabel="Reintentar"
                  onAction={() => void refreshList()}
                />
              ) : (
                <Text style={{ color: colors.textMuted, textAlign: 'center' }}>Sin notificaciones</Text>
              )
            }
            renderSectionHeader={({ section: { title } }) => (
              <Text
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.semibold,
                  fontSize: fontSize.caption,
                  marginBottom: spacing.xs,
                  marginTop: spacing.sm,
                }}
              >
                {title}
              </Text>
            )}
            renderItem={({ item }) => {
              const copy = getNotificationDisplayCopy(item.type, item.title, item.message);
              const Icon = iconForType(item.type);
              return (
                <Pressable
                  onPress={() => openNotification(item)}
                  onLongPress={() => void dismiss(item.id)}
                  style={{ marginBottom: spacing.sm }}
                >
                  <LiquidGlassSurface borderRadius={14} style={{ opacity: item.read ? 0.8 : 1 }}>
                    <View style={styles.row}>
                      <View style={[styles.iconBox, { backgroundColor: colors.primary + '18' }]}>
                        <Icon color={colors.primary} size={18} />
                        {!item.read ? (
                          <View
                            style={[
                              styles.dot,
                              { backgroundColor: item.priority === 'HIGH' ? colors.error : colors.primary },
                            ]}
                          />
                        ) : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold }}>
                          {copy.title}
                        </Text>
                        <Text
                          style={{
                            color: colors.textMuted,
                            fontSize: fontSize.caption,
                            marginTop: 4,
                          }}
                          numberOfLines={3}
                        >
                          {copy.message}
                        </Text>
                      </View>
                    </View>
                  </LiquidGlassSurface>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    maxHeight: '78%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: 4 },
});
