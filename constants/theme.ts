export const theme = {
  colors: {
    background: '#000000',
    surface: '#0A0A0A',
    card: '#141414',
    cardBorder: '#1F1F1F',
    
    primary: '#00D4FF',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    
    gradients: {
      chase: ['#003D82', '#0066CC'] as const,
      amex: ['#006FCF', '#0088FF'] as const,
      citi: ['#003B70', '#0066B3'] as const,
      wellsfargo: ['#D71921', '#FF4444'] as const,
      bankofamerica: ['#E31837', '#FF4466'] as const,
      capitalone: ['#004879', '#0066AA'] as const,
      discover: ['#FF6000', '#FF8833'] as const,
      usbank: ['#005A2B', '#008844'] as const,
    }
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    card: 20,
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  }
};