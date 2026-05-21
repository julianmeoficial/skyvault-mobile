import { Redirect } from 'expo-router';

/** Ruta legada: la edición vive en /dashboard/aircraft + AircraftFormModal. */
export default function AircraftFormScreen() {
  return <Redirect href="/dashboard/aircraft" />;
}
