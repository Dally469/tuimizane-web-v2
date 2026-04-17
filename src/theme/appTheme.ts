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

const primaryMain = '#f97316';
const primaryDark = '#c2410c';
const primaryLight = '#fb923c';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primaryMain,
      light: primaryLight,
      dark: primaryDark,
      contrastText: '#ffffff',
      soft: '#fff1e8',
    },
    secondary: {
      main: '#ea580c',
      light: '#fdba74',
      dark: '#9a3412',
      contrastText: '#ffffff',
      soft: '#fff4ed',
    },
    success: {
      main: '#16a34a',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#dc2626',
    },
    background: {
      default: '#fffaf5',
      paper: 'rgba(255,255,255,0.78)',
      soft: '#fff4eb',
      warm: '#fff8f1',
    },
    text: {
      primary: '#2b2118',
      secondary: '#72574a',
    },
    divider: 'rgba(138, 94, 62, 0.12)',
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
            'radial-gradient(circle at top left, rgba(249,115,22,0.12), transparent 28%), radial-gradient(circle at top right, rgba(251,146,60,0.16), transparent 24%), linear-gradient(180deg, #fffaf5 0%, #fff4eb 48%, #fffdfb 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(255,255,255,0.72)',
          backgroundImage: 'none',
          boxShadow: '0 24px 70px -30px rgba(90, 44, 12, 0.18)',
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
          boxShadow: '0 18px 40px -20px rgba(249,115,22,0.65)',
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
          backgroundColor: '#fed7aa',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          background: 'rgba(255, 250, 245, 0.96)',
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
            backgroundColor: '#fff1e8',
            color: '#9a3412',
          },
        },
      },
    },
  },
});
