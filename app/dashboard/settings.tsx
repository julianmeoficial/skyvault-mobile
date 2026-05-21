import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Redirect } from 'expo-router';
import api from '../../src/lib/api';
import { API } from '../../src/constants/api';
import { useAuth } from '../../src/features/auth/hooks/useAuth';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { useTheme } from '../../src/theme';

export default function DashboardSettingsScreen() {
  const { isAdmin } = useAuth();
  const { colors, spacing, fontFamily, fontSize } = useTheme();
  const [cacheStats, setCacheStats] = useState<string>('—');

  useEffect(() => {
    if (!isAdmin) return;
    api
      .get(API.ADMIN.CACHE_STATS)
      .then((res) => setCacheStats(JSON.stringify(res.data, null, 2).slice(0, 500)))
      .catch(() => setCacheStats('No disponible'));
  }, [isAdmin]);

  if (!isAdmin) return <Redirect href="/(tabs)" />;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bgMain, padding: spacing.md }}>
      <GlassCard>
        <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold, marginBottom: spacing.sm }}>
          Caché del servidor
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, fontFamily: 'monospace' }}>
          {cacheStats}
        </Text>
      </GlassCard>
      <Text style={{ color: colors.textMuted, marginTop: spacing.lg, fontSize: fontSize.caption }}>
        Configuración avanzada completa disponible en el panel web.
      </Text>
    </ScrollView>
  );
}
