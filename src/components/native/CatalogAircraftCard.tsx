import { memo, useState } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Plane } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LiquidGlassSurface } from '../ui/liquid-glass/LiquidGlassSurface';
import { ImagePreviewModal } from '../media/ImagePreviewModal';
import { AircraftThumbnail } from '../media/AircraftThumbnail';
import { useTheme } from '../../theme';
import type { AircraftCardDto } from '../../shared/types/aircraft.types';

interface CatalogAircraftCardProps {
  aircraft: AircraftCardDto;
}

function CatalogAircraftCardInner({ aircraft }: CatalogAircraftCardProps) {
  const router = useRouter();
  const { colors, fontSize, fontFamily, spacing, radius } = useTheme();
  const [previewOpen, setPreviewOpen] = useState(false);

  const imageUri =
    aircraft.thumbnailUrl ?? (aircraft as { mainImageUrl?: string }).mainImageUrl;

  const onPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/aircraft/${aircraft.id}`);
  };

  return (
    <>
      <View style={{ marginBottom: spacing.md }}>
        <LiquidGlassSurface style={{ padding: 0 }} borderRadius={radius.lg}>
          <View style={styles.row}>
            {imageUri ? (
              <Pressable
                onPress={() => setPreviewOpen(true)}
                accessibilityLabel="Ver imagen"
                style={[styles.thumbWrap, { borderRadius: radius.md }]}
              >
                <AircraftThumbnail uri={imageUri} size={88} borderRadius={radius.md} />
              </Pressable>
            ) : (
              <View
                style={[
                  styles.thumbWrap,
                  styles.thumbPlaceholder,
                  { backgroundColor: colors.bgSection, borderRadius: radius.md },
                ]}
              >
                <Plane color={colors.primary} size={32} />
              </View>
            )}
            <Pressable onPress={onPress} style={styles.info}>
              <Text
                style={{ color: colors.textPrimary, fontSize: fontSize.h6, fontFamily: fontFamily.bold }}
                numberOfLines={1}
              >
                {aircraft.displayName ?? aircraft.name}
              </Text>
              <Text
                style={{ color: colors.textMuted, fontSize: fontSize.bodySmall, marginTop: 4 }}
                numberOfLines={1}
              >
                {aircraft.manufacturer?.name}
                {aircraft.family?.name ? ` · ${aircraft.family.name}` : ''}
              </Text>
            </Pressable>
            {aircraft.rangeKm ? (
              <Pressable onPress={onPress} style={styles.range}>
                <Plane color={colors.textMuted} size={16} />
                <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, marginTop: 2 }}>
                  Alcance
                </Text>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontFamily: fontFamily.semibold,
                    fontSize: fontSize.bodySmall,
                  }}
                >
                  {aircraft.rangeKm.toLocaleString('es-ES')} km
                </Text>
              </Pressable>
            ) : null}
          </View>
        </LiquidGlassSurface>
      </View>
      <ImagePreviewModal
        visible={previewOpen}
        uri={imageUri}
        title={aircraft.displayName ?? aircraft.name}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}

const THUMB_SIZE = 88;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', padding: 14, alignItems: 'center' },
  thumbWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    flexShrink: 0,
    overflow: 'hidden',
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  range: { alignItems: 'flex-end', marginLeft: 8 },
});

export const CatalogAircraftCard = memo(CatalogAircraftCardInner);
