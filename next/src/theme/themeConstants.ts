declare module "@mui/material/styles" {
  interface SimplePaletteColorOptions {
    pale?: string;
  }
  interface TypeBackground {
    dark?: string;
  }
  interface Theme {
    custom: {
      subTitle: {
        height: string;
        widthXs: number;
        widthSm: number;
        widthMd: number;
        widthLg: number;
      };
      header: {
        height: {
          mobile: number;
          desktop: number;
        };
      };
    };
  }
  interface ThemeOptions {
    custom?: {
      subTitle: {
        height: string;
        widthXs: number;
        widthSm: number;
        widthMd: number;
        widthLg: number;
      };
      header: {
        height: {
          mobile: number;
          desktop: number;
        };
      };
    };
  }
}

export const themeConstants = {
  palette: {
    primary: {
      pale: "#E3F2FD",
      light: "#64B5F6",
      main: "#1565C0",
      dark: "#0D47A1",
      contrastText: "#FFFFFF",
    },
    secondary: {
      pale: "#E0F7FA",
      light: "#4DD0E1",
      main: "#00ACC1",
      dark: "#006064",
      contrastText: "#FFFFFF",
    },
    info: {
      pale: "#FFFFFF",
      light: "#90A4AE",
      main: "#546E7A",
      dark: "#263238",
    },
    warning: {
      pale: "#FFF8E1",
      light: "#FFE082",
      main: "#FFA726",
      dark: "#F57C00",
    },
    error: {
      pale: "#FFEBEE",
      light: "#EF9A9A",
      main: "#EF5350",
      dark: "#C62828",
    },
    background: {
      default: "#FAFBFC",
      paper: "#FFFFFF",
      dark: "#102027",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1200,
      xl: 1536,
    },
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },
  },
  custom: {
    header: {
      height: {
        mobile: 56,
        desktop: 64,
      },
    },
    subTitle: {
      height: "1rem",
      widthXs: 100,
      widthSm: 30,
      widthMd: 30,
      widthLg: 30,
    },
  },
};
