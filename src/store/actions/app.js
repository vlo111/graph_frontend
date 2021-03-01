export const SET_ACTIVE_BUTTON = 'SET_ACTIVE_BUTTON';

export function setActiveButton(button) {
  return {
    type: SET_ACTIVE_BUTTON,
    payload: {
      button,
    },
  };
}

export const PREVIOUS_ACTIVE_BUTTON = 'PREVIOUS_ACTIVE_BUTTON';

export function previousActiveButton() {
  return {
    type: PREVIOUS_ACTIVE_BUTTON,
    payload: {},
  };
}

export const NEW_NODE_MODAL = 'NEW_NODE_MODAL';

export function toggleNodeModal(params = {}) {
  return {
    type: NEW_NODE_MODAL,
    payload: {
      params,
    },
  };
}

export const TOGGLE_GRID = 'TOGGLE_GRID';

export function toggleGrid(grid, index) {
  return {
    type: TOGGLE_GRID,
    payload: {
      grid,
      index,
    },
  };
}

export const SET_GRID_INDEXES = 'SET_GRID_INDEXES';

export function setGridIndexes(grid, indexes = []) {
  return {
    type: SET_GRID_INDEXES,
    payload: { grid, indexes },
  };
}

export const LOADING = 'LOADING';

export function setLoading(isLoading = true) {
  return {
    type: LOADING,
    payload: { isLoading },
  };
}

export const SET_FILTER = 'SET_FILTER';

export function setFilter(key, value, setInitialFilter = false) {
  return {
    type: SET_FILTER,
    payload: { key, value, setInitialFilter },
  };
}

export const RESET_FILTER = 'RESET_FILTER';

export function resetFilter() {
  return {
    type: RESET_FILTER,
    payload: {},
  };
}


export const SET_LEGEND_BUTTON = 'SET_LEGEND_BUTTON';

export function setLegendButton(mode) {
  return {
    type: SET_LEGEND_BUTTON,
    payload: {
      mode,
    },
  };
}

export const ONLINE_USERS = 'ONLINE_USERS';

export function getOnlineUsersRequest(data) {   
  return {
    type: ONLINE_USERS,
    payload: {
      data,
    },
  };
}
