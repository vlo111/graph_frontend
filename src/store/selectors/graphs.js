import { createSelector } from 'reselect';

export const getGraph = (state) => state.graphs;

export const getSingleGraph = createSelector(
  getGraph,
  (items) => items.singleGraph,
);
