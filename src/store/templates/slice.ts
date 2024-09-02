import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {TemplatesSliceState, Template, TemplateId} from './type';
import {FontWeight, TextAlign} from '@shopify/react-native-skia';
import {FONT_FAMILY} from 'constants/fonts';

const initialTemplatesState: TemplatesSliceState = {
  byId: {
    ['1']: {
      id: '1',
      name: 'Simple',
      alignment: TextAlign.Center,
      color: 'white',
      fontSize: 24,
      fontFamily: FONT_FAMILY.EuclidCircularA,
      weight: FontWeight.Bold,
      sentenceBackgroundColor: 'black',
      sentenceBackgroundOpacity: 0.5,
      sentenceBackgroundPadding: 8,
      maxWords: 5,
      activeColor: '#c6fd78',
      sentenceShadow: {
        dx: 0,
        dy: 0,
        blur: 5,
        color: '#000000',
      },
    },
    ['2']: {
      id: '2',
      name: 'Glow',
      alignment: TextAlign.Center,
      color: 'white',
      fontSize: 48,
      fontFamily: FONT_FAMILY.HandMarker,
      weight: FontWeight.Normal,
      strokeColor: '#B82851',
      strokeWidth: 8,
      effect: 'karaoke clip',
      sentenceShadow: {
        dx: 0,
        dy: 0,
        blur: 3,
        color: '#B82851',
      },
      // this font goes little up and cut the top so to fix that giving padding
      sentenceBackgroundOpacity: 0,
      sentenceBackgroundPadding: 8,
      maxWords: 3,
    },

    ['3']: {
      id: '3',
      name: 'Extra',
      alignment: TextAlign.Center,
      color: 'white',
      activeColor: '#FFD700',
      fontSize: 28,
      fontFamily: FONT_FAMILY.Montserrat,
      weight: FontWeight.ExtraBold,
      strokeColor: '#000000',
      strokeWidth: 5,
      sentenceShadow: {
        dx: 3,
        dy: 3,
        blur: 0,
        color: '#000000',
      },
      // this font goes little up and cut the top so to fix that giving padding
      sentenceBackgroundOpacity: 0,
      sentenceBackgroundPadding: 0,
      maxWords: 4,
    },
    ['4']: {
      id: '4',
      name: 'Gradient',
      alignment: TextAlign.Center,
      color: 'white',
      activeColor: 'white',
      fontSize: 36,
      fontFamily: FONT_FAMILY.LuckiestGuy,
      weight: FontWeight.ExtraBold,
      strokeColor: '#000000',
      strokeWidth: 10,
      sentenceShadow: {
        dx: 0,
        dy: 0,
        blur: 0,
        color: '#000000',
      },
      // this font goes little up and cut the top so to fix that giving padding
      sentenceBackgroundOpacity: 0,
      sentenceBackgroundPadding: 10,
      maxWords: 1,
      gradient: {
        colors: ['#ffffff', '#4da6ff', '#0066cc'],
        positions: [0.2, 0.5, 1],
      },
      letterSpacing: 2,
    },

    ['5']: {
      id: '5',
      name: 'Opacity',
      alignment: TextAlign.Center,
      color: 'black',
      fontSize: 24,
      fontFamily: FONT_FAMILY.Helvetica,
      weight: FontWeight.Bold,
      sentenceBackgroundColor: 'white',
      sentenceBackgroundOpacity: 1,
      sentenceBackgroundPadding: 8,
      sentenceBackgroundRadius: 8,
      maxWords: 4,
      colorAfter: 'rgba(0,0,0,0.3)',
    },

    ['6']: {
      id: '6',
      name: 'love',
      alignment: TextAlign.Center,
      color: '#e6116a',
      strokeColor: 'white',
      strokeWidth: 5,
      fontSize: 42,
      fontFamily: FONT_FAMILY.CherryBombOne,
      weight: FontWeight.Normal,
      maxWords: 1,
    },

    ['7']: {
      id: '7',
      name: 'led',
      alignment: TextAlign.Center,
      color: '#ffffff',
      fontSize: 36,
      fontFamily: FONT_FAMILY.DOTCIRFUL,
      weight: FontWeight.Bold,
      maxWords: 4,
      shadow: [
        {
          color: SkiaApi.Color('#782a9f'),
          offset: {
            y: 2,
            x: 2,
          },
          blurRadius: 10,
        },
        {
          color: SkiaApi.Color('#782a9f'),
          offset: {
            y: -2,
            x: -2,
          },
          blurRadius: 10,
        },
      ],

      activeShadow: [
        {
          color: SkiaApi.Color('#dc5050'),
          offset: {
            y: 2,
            x: 2,
          },
          blurRadius: 10,
        },
        {
          color: SkiaApi.Color('#dc5050'),
          offset: {
            y: -2,
            x: -2,
          },
          blurRadius: 10,
        },
      ],
      strokeColor: '#bb46cc',
      activeStrokeColor: '#dc5050',
      sentenceBackgroundColor: 'black',
      sentenceBackgroundPadding: 4,
      sentenceBackgroundOpacity: 0.3,
      strokeWidth: 2,
      sentenceShadow: {
        dx: 4,
        dy: 4,
        blur: 10,
        color: '#b547c6',
      },
    },
  },
  allIds: ['1', '2', '3', '4', '5', '6', '7'],
};

const templatesSlice = createSlice({
  name: 'templates',
  initialState: initialTemplatesState,
  reducers: {
    addTemplate: (state, action: PayloadAction<Template>) => {
      const template = action.payload;
      state.byId[template.id] = template;
      state.allIds.unshift(template.id);
    },
    removeTemplate: (state, action: PayloadAction<TemplateId>) => {
      const templateId = action.payload;
      delete state.byId[templateId];
      state.allIds = state.allIds.filter(id => id !== templateId);
    },
    updateTemplate: (state, action: PayloadAction<Template>) => {
      const template = action.payload;
      if (state.byId[template.id]) {
        state.byId[template.id] = template;
      }
    },
  },
});

export const {addTemplate, removeTemplate, updateTemplate} =
  templatesSlice.actions;
export default templatesSlice.reducer;
