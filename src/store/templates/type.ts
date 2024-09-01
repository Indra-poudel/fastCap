import {
  Color,
  FontWeight,
  SkTextShadow,
  TextAlign,
  TextDirection,
} from '@shopify/react-native-skia';

export type TemplateId = string;

export type Template = {
  id: TemplateId;
  name: string;
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

  shadow?: SkTextShadow[];
  shadowBefore?: SkTextShadow[];
  shadowAfter?: SkTextShadow[];
  activeShadow?: SkTextShadow[];

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

  maxWords: number;

  gradient?: {
    colors: Color[];
    positions?: number[];
  };

  letterSpacing?: number;
};

export interface TemplatesSliceState {
  byId: Record<TemplateId, Template>;
  allIds: TemplateId[];
  selectedTemplateId?: TemplateId;
}
