import { Modal, View, Image, Pressable, StyleSheet, Text } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../../theme';

interface ImagePreviewModalProps {
  visible: boolean;
  uri: string | null | undefined;
  title?: string;
  onClose: () => void;
}

export function ImagePreviewModal({ visible, uri, title, onClose }: ImagePreviewModalProps) {
  const { fontFamily, fontSize } = useTheme();

  if (!uri) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.header}>
          {title ? (
            <Text
              style={{ color: '#fff', fontFamily: fontFamily.semibold, fontSize: fontSize.bodySmall, flex: 1 }}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          <Pressable onPress={onClose} hitSlop={16} accessibilityLabel="Cerrar">
            <X color="#fff" size={28} />
          </Pressable>
        </View>
        <Pressable style={styles.imageWrap} onPress={(e) => e.stopPropagation()}>
          <Image source={{ uri }} style={styles.image} resizeMode="contain" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  imageWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '70%',
  },
});
