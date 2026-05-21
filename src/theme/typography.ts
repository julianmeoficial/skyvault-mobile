// Escala tipográfica extraída de DESIGN.MD SkyVault V2.6

export const FontSize = {
    caption:   12,  // Meta información
    bodySmall: 14,  // Ayuda, muted, botones
    body:      16,  // Texto estándar
    bodyLarge: 18,  // Textos destacados
    h6:        20,
    h5:        22,
    h4:        26,
    h3:        30,
    h2:        34,
    h1:        40,
  } as const;
  
  export const FontWeight = {
    normal:   '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
  } as const;
  
  export const LineHeight = {
    tight:      1.2,
    heading:    1.3,
    body:       1.6,
  } as const;
  
  // Inter es el --font-primary de SkyVault (DESIGN.MD)
  // Se carga vía expo-font en app/_layout.tsx
  export const FontFamily = {
    regular:  'Inter_400Regular',
    medium:   'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold:     'Inter_700Bold',
  } as const;