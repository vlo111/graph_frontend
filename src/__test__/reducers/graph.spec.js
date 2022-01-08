import reducer, { initialState } from '../../store/reducers/graphs';

describe('graph reducer', () => {
  it('convert graph request', () => {
    const action = {
      type: 'DELETE_GRAPH_QUERY_SUCCESS',
      payload: {
        data: {
          query: {
            query: 'queryString',
          },
        },
      },
    };

    expect(reducer(initialState, action)).toEqual({
      ...initialState,
      query: { queryList: { query: 'queryString' } }
    });
  });
});
