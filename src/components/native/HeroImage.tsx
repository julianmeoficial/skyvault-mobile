import { Image, View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

interface HeroImageProps {
  uri?: string;
  height?: number;
}

export function HeroImage({ uri, height = 240 }: HeroImageProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { height }]}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bgSection }]} />
      )}
      <LinearGradient
        colors={['transparent', colors.bgMain + 'EE']}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    overflow: 'hidden',
  },
});
