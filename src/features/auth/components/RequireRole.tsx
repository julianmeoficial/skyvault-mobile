import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { hasRole } from '../utils/requireRole';
import type { UserRole } from '../types/auth.types';
import { getUserFriendlyError } from '../../../shared/utils/errorMessages';
import { useTheme } from '../../../theme';

interface RequireRoleProps {
  roles: UserRole[];
  children: ReactNode;
  fallbackHref?: string;
}

export function RequireRole({ roles, children, fallbackHref = '/(tabs)' }: RequireRoleProps) {
  const { user, isHydrated } = useAuth();
  const { colors, spacing, fontFamily } = useTheme();

  if (!isHydrated) return null;
  if (!user) return <Redirect href="/(auth)/login" />;
  if (!hasRole(user, roles)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgMain, padding: spacing.lg, justifyContent: 'center' }}>
        <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.bold, textAlign: 'center' }}>
          {getUserFriendlyError({ response: { status: 403 } })}
        </Text>
        <Redirect href={fallbackHref} />
      </View>
    );
  }

  return <>{children}</>;
}
