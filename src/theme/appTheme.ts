import { alpha, createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface TypeBackground {
    soft: string;
    warm: string;
  }

  interface PaletteColor {
    soft?: string;
  }

  interface SimplePaletteColorOptions {
    soft?: string;
  }
}

const primaryMain = '#00466e';
const primaryDark = '#003a5b';
const primaryLight = '#1e6f96';
const accentMain = '#f2a900';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primaryMain,
      light: primaryLight,
      dark: primaryDark,
      contrastText: '#ffffff',
      soft: '#e7f2f8',
    },
    secondary: {
      main: accentMain,
      light: '#f7c74d',
      dark: '#c68800',
      contrastText: '#1f2937',
      soft: '#fff6dd',
    },
    success: {
      main: '#16a34a',
    },
    warning: {
      main: '#f2a900',
    },
    error: {
      main: '#dc2626',
    },
    background: {
      default: '#f6f9fb',
      paper: 'rgba(255,255,255,0.78)',
      soft: '#eef5f9',
      warm: '#f7fafc',
    },
    text: {
      primary: '#133348',
      secondary: '#4c6a7c',
    },
    divider: 'rgba(0, 70, 110, 0.12)',
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    h1: {
      fontFamily: '"Space Grotesk", "Plus Jakarta Sans", system-ui, sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontFamily: '"Space Grotesk", "Plus Jakarta Sans", system-ui, sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h3: {
      fontFamily: '"Space Grotesk", "Plus Jakarta Sans", system-ui, sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(circle at top left, rgba(0,70,110,0.13), transparent 28%), radial-gradient(circle at top right, rgba(242,169,0,0.12), transparent 24%), linear-gradient(180deg, #f6f9fb 0%, #f2f7fa 48%, #fbfdff 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(255,255,255,0.72)',
          backgroundImage: 'none',
          boxShadow: '0 24px 70px -30px rgba(0, 50, 78, 0.2)',
          backdropFilter: 'blur(18px)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingInline: 20,
          minHeight: 48,
        },
        contained: {
          background: `linear-gradient(135deg, ${primaryDark} 0%, ${primaryMain} 55%, ${primaryLight} 100%)`,
          boxShadow: '0 18px 40px -20px rgba(0,70,110,0.45)',
        },
        outlined: {
          borderColor: alpha(primaryMain, 0.24),
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
          minHeight: 30,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: 'rgba(255,255,255,0.78)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 10,
          borderRadius: 999,
          backgroundColor: '#d5e8f2',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          background: 'rgba(246, 249, 251, 0.96)',
          backdropFilter: 'blur(22px)',
          padding: 8,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          '&.Mui-selected': {
            backgroundColor: '#e7f2f8',
            color: '#003a5b',
          },
        },
      },
    },
  },
});
