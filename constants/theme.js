export const theme = {
    colors: {
        primary: '#2563EB', // Travel Blue
        secondary: '#10B981', // Success Green
        accent: '#F59E0B', // Highlight/Warning
        background: '#F3F4F6', // Lighter Gray-Blue for better contrast
        surface: '#FFFFFF', // White
        text: '#111827', // Dark Gray (Primary Text)
        textSecondary: '#6B7280', // Light Gray (Secondary Text)
        textWhite: '#FFFFFF',
        error: '#EF4444', // Red
        success: '#10B981', // Green
        warning: '#F59E0B', // Orange
        info: '#3B82F6', // Blue
        border: '#E5E7EB', // Light Border
        inputBg: '#FFFFFF',
        gradientStart: '#2563EB',
        gradientEnd: '#1D4ED8',
        gradientSecondaryStart: '#10B981',
        gradientSecondaryEnd: '#059669',
        cardBorder: 'rgba(0,0,0,0.05)',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
        xxxl: 32,
        section: 48,
    },
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: '800',
            color: '#111827',
            textAlign: 'center',
            marginBottom: 12,
            lineHeight: 40,
            letterSpacing: -0.5,
        },
        h2: {
            fontSize: 24,
            fontWeight: '700',
            color: '#111827',
            marginBottom: 16,
            lineHeight: 32,
            letterSpacing: -0.3,
        },
        h3: {
            fontSize: 20,
            fontWeight: '600',
            color: '#111827',
            marginBottom: 12,
            lineHeight: 28,
        },
        subtitle: {
            fontSize: 16,
            color: '#6B7280',
            textAlign: 'center',
            marginBottom: 32,
            lineHeight: 24,
        },
        body: {
            fontSize: 16,
            color: '#374151',
            lineHeight: 24,
        },
        caption: {
            fontSize: 14,
            color: '#6B7280',
            lineHeight: 20,
        },
        buttonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#FFFFFF',
            textAlign: 'center',
            letterSpacing: 0.5,
        },
    },
    layout: {
        borderRadius: 16,
        inputRadius: 12,
        containerPadding: 20,
        cardPadding: 20,
        modalRadius: 24,
    },
    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
        },
        lg: {
            shadowColor: '#6B7280',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 10,
        },
        primary: {
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8,
        },
    },
};
