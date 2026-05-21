import { View } from 'react-native';
import type { ComparisonItem } from '../../../shared/types/comparison.types';
import { ComparisonSection } from './ComparisonSection';
import { COMPARISON_SPEC_SECTIONS } from '../utils/comparisonSpecLabels';

interface ComparisonGridProps {
  items: ComparisonItem[];
}

export function ComparisonGrid({ items }: ComparisonGridProps) {
  if (items.length === 0) return null;

  return (
    <View>
      {COMPARISON_SPEC_SECTIONS.map((section) => (
        <ComparisonSection
          key={section.title}
          title={section.title}
          items={items}
          specs={section.specs}
        />
      ))}
    </View>
  );
}
