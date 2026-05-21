import { Platform } from 'react-native';

/**
 * En iOS Simulator, localhost apunta al simulador — usar la IP LAN del Mac.
 * En Android Emulator, 10.0.2.2 es el host de la máquina de desarrollo.
 */
export function getApiHostHint(): string {
  if (Platform.OS === 'android') {
    return '10.0.2.2:8080';
  }
  return '<IP-LAN-de-tu-Mac>:8080';
}

export const API_SETUP_NOTES = `
Configura EXPO_PUBLIC_API_BASE_URL en .env:
- iOS Simulator: http://${getApiHostHint()}/api/v1
- Dispositivo físico / staging: URL pública del backend
`.trim();
