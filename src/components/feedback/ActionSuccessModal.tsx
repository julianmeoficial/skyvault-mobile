import { Modal, View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { LiquidGlassSurface } from '../ui/liquid-glass/LiquidGlassSurface';
import { LiquidGlassButton } from '../ui/liquid-glass/LiquidGlassButton';
import { useTheme } from '../../theme';

interface ActionSuccessModalProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  onDone: () => void;
}

export function ActionSuccessModal({ visible, title, subtitle, onDone }: ActionSuccessModalProps) {
  const { colors, spacing, fontSize, fontFamily } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone}>
      <View style={styles.backdrop}>
        <Animated.View entering={ZoomIn.springify()}>
          <LiquidGlassSurface borderRadius={24} style={{ padding: spacing.lg, minWidth: 280 }}>
            <Animated.View entering={FadeIn.delay(100)} style={styles.check}>
              <Text style={{ fontSize: 48 }}>✓</Text>
            </Animated.View>
            <Text
              style={{
                color: colors.textPrimary,
                fontFamily: fontFamily.bold,
                fontSize: fontSize.h5,
                textAlign: 'center',
                marginTop: spacing.md,
              }}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={{
                  color: colors.textMuted,
                  textAlign: 'center',
                  marginTop: spacing.xs,
                  fontSize: fontSize.bodySmall,
                }}
              >
                {subtitle}
              </Text>
            ) : null}
            <LiquidGlassButton title="Listo" onPress={onDone} style={{ marginTop: spacing.lg }} />
          </LiquidGlassSurface>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  check: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(34,197,94,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
