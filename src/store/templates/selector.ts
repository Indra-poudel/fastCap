// templatesSelectors.ts
import {createSelector} from 'reselect';
import {RootState} from 'store';
import {selectSelectedVideo} from 'store/videos/selector';

const selectTemplatesState = (state: RootState) => state.templates;

export const selectTemplateForSelectedVideo = createSelector(
  [selectTemplatesState, selectSelectedVideo],
  (templatesState, selectedVideo) =>
    selectedVideo?.templateId
      ? templatesState.byId[selectedVideo.templateId]
      : undefined,
);

export const selectAllTemplates = createSelector(
  selectTemplatesState,
  templateState => {
    return templateState.allIds.map(id => templateState.byId[id]);
  },
);
