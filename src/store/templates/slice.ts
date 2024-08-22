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
      strokeWidth: 10,
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
      strokeWidth: 3,
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
  },
  allIds: ['1', '2', '3'],
};

const templatesSlice = createSlice({
  name: 'templates',
  initialState: initialTemplatesState,
  reducers: {
    addTemplate: (state, action: PayloadAction<Template>) => {
      const template = action.payload;
      state.byId[template.id] = template;
      console.log('id');
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
