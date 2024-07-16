import {FontWeightsType} from 'theme/type';

// Centralized typography settings
export const FONTS_FAMILY = {
  REGULAR: 'Inter-Regular',
  SEMI_BOLD: 'Inter-SemiBold',
  BOLD: 'Inter-Bold',
} as const;

const fontWeights: FontWeightsType = {
  regular: 400,
  semiBold: 600,
  bold: 700,
};

const darkTheme = {
  colors: {
    primary: '#3377FF', // Primary Color
    secondary: '#F2994A', // Secondary Color
    info: '#2F80ED', // Info Color
    success: '#27AE60', // Success Color
    warning: '#E2B93B', // Warning Color
    error: '#EB5757', // Error Color

    black1: '#020202', // Black 1
    black2: '#090909', // Black 2
    black3: '#282828', // Black 3
    black4: '#282828',

    grey1: '#333333', // Grey 1
    grey2: '#4F4F4F', // Grey 2
    grey3: '#828282', // Grey 3
    grey4: '#BDBDBD', // Grey 4
    grey5: '#E0E0E0', // Grey 5

    white: '#FFFFFF', // White

    transparent: 'transparent',
  },
  typography: {
    header: {
      large: {
        fontFamily: FONTS_FAMILY.BOLD,
        fontSize: 32,
        fontWeight: fontWeights.bold,
        lineHeight: 40,
      },
      medium: {
        fontFamily: FONTS_FAMILY.BOLD,
        fontSize: 24,
        fontWeight: fontWeights.bold,
        lineHeight: 32,
      },
      small: {
        fontFamily: FONTS_FAMILY.BOLD,
        fontSize: 18,
        fontWeight: fontWeights.bold,
        lineHeight: 24,
      },
    },
    subheader: {
      large: {
        fontFamily: FONTS_FAMILY.SEMI_BOLD,
        fontSize: 16,
        fontWeight: fontWeights.semiBold,
        lineHeight: 24,
      },
      small: {
        fontFamily: FONTS_FAMILY.SEMI_BOLD,
        fontSize: 14,
        fontWeight: fontWeights.semiBold,
        lineHeight: 20,
      },
    },
    body: {
      large: {
        fontFamily: FONTS_FAMILY.REGULAR,
        fontSize: 16,
        fontWeight: fontWeights.regular,
        lineHeight: 24,
      },
      medium: {
        fontFamily: FONTS_FAMILY.REGULAR,
        fontSize: 14,
        fontWeight: fontWeights.regular,
        lineHeight: 20,
      },
      small: {
        fontFamily: FONTS_FAMILY.REGULAR,
        fontSize: 12,
        fontWeight: fontWeights.regular,
        lineHeight: 16,
      },
    },
    caption: {
      fontFamily: FONTS_FAMILY.REGULAR,
      fontSize: 10,
      fontWeight: fontWeights.regular,
      lineHeight: 12,
    },
  },
  spacing: {
    xsmall: 4,
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
    xxlarge: 48,
    xxxlarge: 64,
    huge: 80,
    xhuge: 96,
    xxhuge: 128,
  },
};

export {darkTheme};
