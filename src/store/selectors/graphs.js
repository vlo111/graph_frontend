import { createSelector } from 'reselect';

export const getGraph = (state) => state.graphs;

export const getSingleGraph = createSelector(
  getGraph,
  (items) => items.singleGraph,
);

export const getActionsCount = createSelector(
  getGraph,
  (items) => items.actionsCount,
);

export const getList = createSelector(
  getGraph,
  (items) => items.graphsList,
);

export const getListInfo = createSelector(
  getGraph,
  (items) => items.graphsListInfo,
);

export const getSingleGraphOwner = createSelector(
  getGraph,
  (items) => items.singleGraph.userId,
);
export const getMouseMoveTracker = createSelector(
  getGraph,
  (items) => items.mouseMoveTracker,
);
export const getGraphsCount = createSelector(
  getGraph,
  (items) => items.allGraghsCount,
);
