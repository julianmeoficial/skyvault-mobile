/**
 * Wrapper SwiftUI — requiere @expo/ui instalado.
 * Si no está disponible, PlatformFilterForm usa FilterForm RN.
 */
import { FilterForm } from '../native/FilterForm';
import type { AircraftFilters } from '../../shared/types/aircraft.types';

interface Props {
  filters: AircraftFilters;
  onChange: (partial: Partial<AircraftFilters>) => void;
}

export function FilterFormSwift(props: Props) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Host, Form, Section, Toggle, Text } = require('@expo/ui/swift-ui');

    return (
      <Host style={{ minHeight: 120 }}>
        <Form>
          <Section>
            <Toggle
              label="Solo en producción"
              isOn={props.filters.onlyActive ?? true}
              onIsOnChange={(v: boolean) => props.onChange({ onlyActive: v })}
            />
          </Section>
        </Form>
      </Host>
    );
  } catch {
    return <FilterForm {...props} />;
  }
}
