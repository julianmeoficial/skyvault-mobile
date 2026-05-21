import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import LogoSvg from '../../../assets/SkyVaultLogoPLB.svg';

interface SkyVaultLogoProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkyVaultLogo({ size = 100, style }: SkyVaultLogoProps) {
  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <LogoSvg width={size} height={size} accessibilityLabel="SkyVault" />
    </View>
  );
}
