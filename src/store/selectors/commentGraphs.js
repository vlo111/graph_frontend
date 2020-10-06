import { createSelector } from 'reselect';

export const getCommentGraph = (state) => state.commentGraphs;

export const getGraphComments = createSelector(
  getCommentGraph,
  (items) => items.graphComments,
);

export const getGraphCommentParent = createSelector(
  getCommentGraph,
  (items) => items.graphCommentParent,
);
