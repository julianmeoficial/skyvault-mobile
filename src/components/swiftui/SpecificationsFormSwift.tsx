import { SpecificationsList } from '../native/SpecificationsList';
import type { AircraftDetailDto } from '../../shared/types/aircraft.types';

export function SpecificationsFormSwift({ aircraft }: { aircraft: AircraftDetailDto }) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Host, Form, Section, Text, HStack } = require('@expo/ui/swift-ui');
    const specs = aircraft.specifications;

    const Row = ({ label, value }: { label: string; value: string }) => (
      <HStack>
        <Text>{label}</Text>
        <Text>{value}</Text>
      </HStack>
    );

    return (
      <Host style={{ minHeight: 200 }}>
        <Form>
          <Section title="Rendimiento">
            <Row label="Alcance" value={aircraft.rangeKm ? `${aircraft.rangeKm} km` : '—'} />
          </Section>
          {specs ? (
            <Section title="Dimensiones">
              <Row label="Envergadura" value={String(specs.wingspanM ?? '—')} />
              <Row label="Longitud" value={String(specs.lengthM ?? '—')} />
            </Section>
          ) : null}
        </Form>
      </Host>
    );
  } catch {
    return (
      <SpecificationsList
        specs={aircraft.specifications}
        serviceCeilingFt={aircraft.serviceCeilingFt}
        typicalPassengers={aircraft.typicalPassengers}
        maxPassengers={aircraft.maxPassengers}
        rangeKm={aircraft.rangeKm}
      />
    );
  }
}
