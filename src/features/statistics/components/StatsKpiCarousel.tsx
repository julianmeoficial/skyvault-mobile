import { useRef, useEffect } from 'react';
import { View, Text, Dimensions, FlatList, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { LiquidGlassSurface } from '../../../components/ui/liquid-glass/LiquidGlassSurface';
import { useTheme } from '../../../theme';
import type { StatsSegment } from './StatsSegmentSlider';

export interface KpiCardData {
  id: string;
  title: string;
  value: string;
  unit?: string;
  trend?: string;
  leaderName?: string;
  leaderValue?: string;
  progress?: number;
}

interface StatsKpiCarouselProps {
  cards: KpiCardData[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
}

const CARD_WIDTH = Dimensions.get('window').width - 48;
const CARD_MIN_HEIGHT = 172;
const SEGMENTS: StatsSegment[] = ['range', 'seats', 'efficiency'];

export function StatsKpiCarousel({ cards, activeIndex, onIndexChange }: StatsKpiCarouselProps) {
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const snap = CARD_WIDTH + spacing.sm;
  const listRef = useRef<FlatList<KpiCardData>>(null);
  const scrollingFromUser = useRef(false);

  useEffect(() => {
    if (scrollingFromUser.current) {
      scrollingFromUser.current = false;
      return;
    }
    if (activeIndex >= 0 && activeIndex < cards.length) {
      listRef.current?.scrollToIndex({ index: activeIndex, animated: true });
    }
  }, [activeIndex, cards.length]);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / snap);
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    scrollingFromUser.current = true;
    onIndexChange(clamped);
  };

  return (
    <View>
      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={cards}
        keyExtractor={(c) => c.id}
        snapToInterval={snap}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={{ paddingRight: spacing.md }}
        getItemLayout={(_, index) => ({
          length: snap,
          offset: snap * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH, marginRight: spacing.sm }}>
            <LiquidGlassSurface borderRadius={20} style={styles.cardOuter}>
              <View style={styles.cardInner}>
                <Text style={{ color: colors.textMuted, fontFamily: fontFamily.medium, fontSize: fontSize.caption }}>
                  {item.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.sm, flexWrap: 'wrap' }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.h3, fontFamily: fontFamily.bold }}>
                    {item.value}
                  </Text>
                  {item.unit ? (
                    <Text style={{ color: colors.textMuted, marginLeft: 4, fontSize: fontSize.bodySmall }}>
                      {item.unit}
                    </Text>
                  ) : null}
                </View>
                {item.trend ? (
                  <Text
                    style={{ color: colors.textSecondary, marginTop: spacing.xs, fontSize: fontSize.caption }}
                    numberOfLines={2}
                  >
                    {item.trend}
                  </Text>
                ) : (
                  <View style={{ height: fontSize.caption + spacing.xs }} />
                )}
                <View style={[styles.progressBlock, { marginTop: spacing.md }]}>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: colors.glassBorder,
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (item.progress ?? 0) * 100)}%`,
                        backgroundColor: colors.primary,
                      }}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                    <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, flex: 1 }} numberOfLines={1}>
                      {item.leaderName ?? ' '}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: fontSize.caption }}>
                      {item.leaderValue ?? ' '}
                    </Text>
                  </View>
                </View>
              </View>
            </LiquidGlassSurface>
          </View>
        )}
      />
      <View style={styles.dots}>
        {SEGMENTS.map((seg, i) => (
          <View
            key={seg}
            style={[
              styles.dot,
              { backgroundColor: i === activeIndex ? colors.primary : colors.glassBorder },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardOuter: { padding: 0, minHeight: CARD_MIN_HEIGHT },
  cardInner: {
    padding: 16,
    minHeight: CARD_MIN_HEIGHT,
    justifyContent: 'space-between',
  },
  progressBlock: { minHeight: 28 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12, marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
