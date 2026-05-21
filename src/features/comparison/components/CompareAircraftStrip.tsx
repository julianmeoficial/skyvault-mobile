import { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import type { ComparisonItem } from '../../../shared/types/comparison.types';
import { ImagePreviewModal } from '../../../components/media/ImagePreviewModal';
import { COMPARE_COLORS } from './ComparisonSection';
import { useTheme } from '../../../theme';

interface CompareAircraftStripProps {
  items: ComparisonItem[];
}

export function CompareAircraftStrip({ items }: CompareAircraftStripProps) {
  const { colors, spacing, fontSize, fontFamily, radius } = useTheme();
  const [preview, setPreview] = useState<{ uri: string; title: string } | null>(null);

  if (items.length === 0) return null;

  const gap = spacing.sm;
  const colFlex = items.length === 2 ? 1 : 1;

  return (
    <>
      <View style={[styles.row, { gap }]}>
        {items.map((item, index) => {
          const img =
            item.thumbnailUrl ??
            item.images?.find((i) => i.isPrimary)?.url ??
            item.images?.[0]?.url;
          const bg = COMPARE_COLORS[index % COMPARE_COLORS.length];

          return (
            <View
              key={item.id}
              style={[
                styles.col,
                {
                  flex: colFlex,
                  backgroundColor: bg,
                  borderRadius: radius.md,
                  borderColor: colors.border,
                },
              ]}
            >
              {img ? (
                <Pressable onPress={() => setPreview({ uri: img, title: item.displayName ?? item.name })}>
                  <Image source={{ uri: img }} style={styles.image} />
                </Pressable>
              ) : (
                <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: colors.bgSection }]} />
              )}
              <Text
                style={{
                  color: colors.textPrimary,
                  fontFamily: fontFamily.bold,
                  fontSize: fontSize.bodySmall,
                  marginTop: spacing.xs,
                }}
                numberOfLines={2}
              >
                {item.displayName ?? item.name}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: fontSize.caption }} numberOfLines={1}>
                {item.manufacturer?.name}
              </Text>
            </View>
          );
        })}
      </View>
      <ImagePreviewModal
        visible={preview != null}
        uri={preview?.uri}
        title={preview?.title}
        onClose={() => setPreview(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 12 },
  col: {
    padding: 10,
    borderWidth: 1,
    minWidth: 0,
  },
  image: { width: '100%', height: 88, borderRadius: 8 },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
});
