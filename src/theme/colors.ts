// Extraído de DESIGN.MD SkyVault V2.6 Stable — Light y Dark

export const Colors = {
    light: {
      // Superficies
      bgMain:      '#D3E9FF',
      bgWhite:     '#FFFFFF',
      bgSection:   '#F8FCFF',
      bgCard:      '#FFFFFF',
      bgHover:     '#F0F9FF',
  
      // Primarios
      primary:     '#0D4B7A',
      primaryDark: '#083554',
      accent:      '#0D4B7A',
      accentLight: '#B2E5FF',
      accentLighter:'#D3E9FF',
  
      // Texto
      textPrimary:   '#1D1D1F',
      textSecondary: '#0D4B7A',
      textMuted:     '#6E6E73',
  
      // Bordes
      border:        'rgba(13, 75, 122, 0.15)',
      borderLight:   'rgba(13, 75, 122, 0.08)',
      borderStrong:  'rgba(13, 75, 122, 0.30)',
  
      // Sombras (como string para StyleSheet)
      shadowColor:   '#0D4B7A',
  
      // Estado
      success: '#10B981',
      error:   '#EF4444',
      warning: '#F59E0B',
      info:    '#3B82F6',
  
      // Liquid Glass — mayor contraste sobre bgMain azul claro
      glassBackground: 'rgba(255, 255, 255, 0.55)',
      glassBorder:     'rgba(13, 75, 122, 0.22)',
    },
    dark: {
      // Superficies
      bgMain:      '#0A1929',
      bgWhite:     '#132F4C',
      bgSection:   '#1A2332',
      bgCard:      '#1A2D42',
      bgHover:     '#2A3F52',
  
      // Primarios
      primary:     '#4A9FD8',
      primaryDark: '#2E7BAF',
      accent:      '#4A9FD8',
      accentLight: '#1E5A7D',
      accentLighter:'#2A3F52',
  
      // Texto
      textPrimary:   '#E3E8EF',
      textSecondary: '#B2E5FF',
      textMuted:     '#9AADBE',
  
      // Bordes
      border:        'rgba(178, 229, 255, 0.15)',
      borderLight:   'rgba(172, 211, 246, 0.40)',
      borderStrong:  'rgba(178, 229, 255, 0.30)',
  
      // Sombras
      shadowColor:   '#000000',
  
      // Estado
      success: '#10B981',
      error:   '#EF4444',
      warning: '#F59E0B',
      info:    '#3B82F6',
  
      // Liquid Glass dark
      glassBackground: 'rgba(255, 255, 255, 0.08)',
      glassBorder:     'rgba(178, 229, 255, 0.18)',
    },
  } as const;
  
  export type ColorScheme = keyof typeof Colors;
  export type ThemeColors = (typeof Colors)[ColorScheme];