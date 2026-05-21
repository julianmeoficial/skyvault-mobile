import Constants from 'expo-constants';

/** @expo/ui SwiftUI solo funciona en development build, no en Expo Go. */
export function isExpoUiAvailable(): boolean {
  return Constants.executionEnvironment !== 'storeClient';
}
