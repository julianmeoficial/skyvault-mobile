import { useCallback, useState } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../../stores/authStore';
import { useFavorites } from '../hooks/useFavorites';
import { useTheme } from '../../../theme';

interface FavoriteToggleProps {
  aircraftId: number;
  variant?: 'hero' | 'surface';
}

export function FavoriteToggle({ aircraftId, variant = 'hero' }: FavoriteToggleProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const { isFavorite, toggleFavorite, error, isLoading: favoritesLoading } = useFavorites({
    enabled: !!user,
  });
  const [isPending, setIsPending] = useState(false);

  const favorited = !!user && isFavorite(aircraftId);
  const isBusy = favoritesLoading || isPending;

  const handlePress = useCallback(async () => {
    if (isBusy) return;

    if (!user) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.push('/(auth)/login');
      return;
    }

    setIsPending(true);
    try {
      await toggleFavorite(aircraftId);
      void Haptics.impactAsync(
        favorited ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium,
      );
    } finally {
      setIsPending(false);
    }
  }, [aircraftId, favorited, isBusy, router, toggleFavorite, user]);

  const isHero = variant === 'hero';

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => void handlePress()}
        disabled={!!user && isBusy}
        accessibilityRole="button"
        accessibilityLabel={favorited ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        accessibilityState={{ selected: favorited, busy: isBusy }}
        style={[
          styles.toggle,
          {
            backgroundColor: isHero ? colors.glassBackground : colors.bgCard,
            borderColor: colors.glassBorder,
            padding: spacing.sm,
          },
        ]}
      >
        <Heart
          size={22}
          color={favorited ? colors.error : colors.primary}
          fill={favorited ? colors.error : 'transparent'}
        />
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: fontSize.caption,
            fontFamily: fontFamily.medium,
            marginLeft: spacing.xs,
          }}
        >
          {favorited ? 'En favoritos' : 'Añadir a favoritos'}
        </Text>
      </Pressable>
      {error && user ? (
        <Text style={{ color: colors.error, fontSize: fontSize.caption, marginTop: spacing.xs }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignSelf: 'flex-start' },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
});
