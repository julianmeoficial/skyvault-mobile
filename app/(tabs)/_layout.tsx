import { Tabs } from 'expo-router';
import { Home, Search, GitCompare, BarChart3, Heart, User } from 'lucide-react-native';
import { useAuth } from '../../src/features/auth/hooks/useAuth';
import { useTheme } from '../../src/theme';
import { TabHeaderRight } from '../../src/components/navigation/TabHeaderRight';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { user, isAdmin } = useAuth();

  const fourthTabTitle = !user || !isAdmin ? 'Favoritos' : 'Estadísticas';
  const FourthIcon = !user || !isAdmin ? Heart : BarChart3;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        animation: 'shift',
        headerStyle: { backgroundColor: colors.bgMain },
        headerTintColor: colors.primary,
        headerShadowVisible: false,
        headerRight: () => <TabHeaderRight />,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        sceneStyle: { backgroundColor: colors.bgMain },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: 'Comparar',
          tabBarIcon: ({ color, size }) => <GitCompare color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: fourthTabTitle,
          tabBarIcon: ({ color, size }) => <FourthIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
