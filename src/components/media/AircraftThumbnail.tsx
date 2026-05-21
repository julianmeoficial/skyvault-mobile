import { View, Image, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Plane } from 'lucide-react-native';
import { useTheme } from '../../theme';

interface AircraftThumbnailProps {
  uri?: string | null;
  size?: number;
  height?: number;
  width?: number | '100%';
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function AircraftThumbnail({
  uri,
  size = 88,
  height,
  width,
  borderRadius = 8,
  style,
  accessibilityLabel = 'Imagen de aeronave',
}: AircraftThumbnailProps) {
  const { colors } = useTheme();
  const boxHeight = height ?? size;
  const boxWidth = width ?? size;

  const frameStyle: ViewStyle = {
    width: boxWidth,
    height: boxHeight,
    borderRadius,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: colors.bgSection,
  };

  if (!uri?.trim()) {
    return (
      <View style={[frameStyle, styles.placeholder, style]} accessibilityLabel={accessibilityLabel}>
        <Plane color={colors.primary} size={Math.min(boxHeight * 0.36, 32)} />
      </View>
    );
  }

  return (
    <View style={[frameStyle, style]} accessibilityLabel={accessibilityLabel}>
      <Image
        source={{ uri: uri.trim() }}
        style={styles.image}
        resizeMode="cover"
        resizeMethod="resize"
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: StyleSheet.absoluteFillObject,
  placeholder: { alignItems: 'center', justifyContent: 'center' },
});
