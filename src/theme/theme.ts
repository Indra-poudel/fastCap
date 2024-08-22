import {verticalScale} from 'react-native-size-matters';
import {scale} from 'react-native-size-matters/extend';
import {FontWeightsType} from 'theme/type';

// Centralized typography settings
export const FONTS_FAMILY = {
  REGULAR: 'Inter-Regular',
  SEMI_BOLD: 'Inter-SemiBold',
  BOLD: 'Inter-Bold',
} as const;

const fontWeights: FontWeightsType = {
  regular: '400',
  semiBold: '600',
  bold: '700',
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
        fontSize: scale(32),
        fontWeight: fontWeights.bold,
        lineHeight: verticalScale(40),
      },
      medium: {
        fontFamily: FONTS_FAMILY.BOLD,
        fontSize: scale(24),
        fontWeight: fontWeights.bold,
        lineHeight: verticalScale(32),
      },
      small: {
        fontFamily: FONTS_FAMILY.BOLD,
        fontSize: scale(18),
        fontWeight: fontWeights.bold,
        lineHeight: verticalScale(24),
      },
    },
    subheader: {
      large: {
        fontFamily: FONTS_FAMILY.SEMI_BOLD,
        fontSize: scale(16),
        fontWeight: fontWeights.semiBold,
        lineHeight: verticalScale(24),
      },
      small: {
        fontFamily: FONTS_FAMILY.SEMI_BOLD,
        fontSize: scale(14),
        fontWeight: fontWeights.semiBold,
        lineHeight: verticalScale(20),
      },
    },
    body: {
      large: {
        fontFamily: FONTS_FAMILY.REGULAR,
        fontSize: scale(16),
        fontWeight: fontWeights.regular,
        lineHeight: verticalScale(24),
      },
      medium: {
        fontFamily: FONTS_FAMILY.REGULAR,
        fontSize: scale(14),
        fontWeight: fontWeights.regular,
        lineHeight: verticalScale(20),
      },
      small: {
        fontFamily: FONTS_FAMILY.REGULAR,
        fontSize: scale(12),
        fontWeight: fontWeights.regular,
        lineHeight: verticalScale(16),
      },
    },
    caption: {
      fontFamily: FONTS_FAMILY.REGULAR,
      fontSize: scale(10),
      fontWeight: fontWeights.regular,
      lineHeight: verticalScale(12),
    },
  },
  spacing: {
    xsmall: {
      v: verticalScale(4),
      h: scale(4),
    },
    small: {
      v: verticalScale(8),
      h: scale(8),
    },
    medium: {
      v: verticalScale(16),
      h: scale(16),
    },
    large: {
      v: verticalScale(24),
      h: scale(24),
    },
    xlarge: {
      v: verticalScale(32),
      h: scale(32),
    },
    xxlarge: {
      v: verticalScale(48),
      h: scale(48),
    },
    xxxlarge: {
      v: verticalScale(64),
      h: scale(64),
    },
    huge: {
      v: verticalScale(80),
      h: scale(80),
    },
    xhuge: {
      v: verticalScale(96),
      h: scale(96),
    },
    xxhuge: {
      v: verticalScale(128),
      h: scale(128),
    },
  },
};

export {darkTheme};
