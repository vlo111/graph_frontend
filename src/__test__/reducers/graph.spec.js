import reducer, { initialState } from '../../store/reducers/graphs';

describe('graph reducer', () => {
  it('sign in request', () => {
    const action = {
      type: 'SIGN_IN_REQUEST',
    };

    expect(reducer(initialState, action)).toEqual({
      ...initialState,
      token: '',
    });
  });
});
