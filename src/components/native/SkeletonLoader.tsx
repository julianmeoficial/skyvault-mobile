import { View } from 'react-native';
import { SkeletonCard } from '../ui/Skeleton';
import { useTheme } from '../../theme';

export function SkeletonLoader({ count = 4 }: { count?: number }) {
  const { spacing } = useTheme();
  return (
    <View style={{ padding: spacing.md }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}
