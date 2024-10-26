import {SharedValue} from 'react-native-reanimated';
import {GeneratedSentence} from 'utils/sentencesBuilder';
import {
  TextAlign,
  FontWeight,
  TextDirection,
  SkTypefaceFontProvider,
  Color,
  SkPoint,
} from '@shopify/react-native-skia';

type BaseParagraphProps = {
  currentTime: number;
  sentences: GeneratedSentence[];

  paragraphLayoutWidth: SharedValue<number>;
  x: number;
  y: number;

  setTemplateHeight?: SharedValue<number>;
  setTemplateWidth?: SharedValue<number>;
  setX?: SharedValue<number>;
  setY?: SharedValue<number>;

  notHideSentenceBetweenSentenceInterval?: boolean;

  // THEME
  color: string;
  colorBefore?: string;
  colorAfter?: string;
  activeColor?: string;

  backgroundColor?: string;
  backgroundColorBefore?: string;
  backgroundColorAfter?: string;
  activeBackgroundColor?: string;

  fontSize: number;
  fontSizeBefore?: number;
  fontSizeAfter?: number;
  activeFontSize?: number;

  fontFamily: string;

  weight?: FontWeight;
  fontWeightBefore?: FontWeight;
  fontWeightAfter?: FontWeight;
  activeFontWeight?: FontWeight;

  alignment?: TextAlign;
  textDirection?: TextDirection;

  sentenceBackgroundColor?: string;
  sentenceBackgroundPadding?: number;
  sentenceBackgroundOpacity?: number;
  sentenceBackgroundRadius?: number;

  shadow?: {
    color: string;
    offset?: SkPoint;
    blurRadius?: number;
  }[];
  shadowBefore?: {
    color: string;
    offset?: SkPoint;
    blurRadius?: number;
  }[];
  shadowAfter?: {
    color: string;
    offset?: SkPoint;
    blurRadius?: number;
  }[];
  activeShadow?: {
    color: string;
    offset?: SkPoint;
    blurRadius?: number;
  }[];

  sentenceShadow?: {
    dx: number;
    dy: number;
    color: string;
    blur: number;
  };

  strokeWidth?: number;
  strokeWidthBefore?: number;
  strokeWidthAfter?: number;
  activeStrokeWidth?: number;

  strokeColor?: string;
  strokeColorBefore?: string;
  strokeColorAfter?: string;
  activeStrokeColor?: string;

  effect?: 'karaoke fill' | 'karaoke clip';
  fillColor?: string;

  paused?: SharedValue<boolean>;
  id: string;

  customFontMgr: SkTypefaceFontProvider;

  scale: SharedValue<number>;

  rotation: SharedValue<number>;

  gradient?: {
    colors: Color[];
    positions?: number[];
  };

  letterSpacing?: number;
};

// Utility type to conditionally require certain properties
type RequireIf<T, K extends keyof T, U extends keyof T> = T &
  (undefined extends T[K] ? {} : {[P in U]-?: NonNullable<T[P]>});

// Use the utility type to enforce essential dependencies only
export type OffScreenProps = RequireIf<
  RequireIf<BaseParagraphProps, 'strokeWidth', 'strokeColor'>,
  'effect',
  'fillColor'
>;
