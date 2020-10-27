import io from 'socket.io-client';
import Api from '../../Api';
import Account from '../../helpers/Account';
import { updateSingleGraph } from './graphs';
import { addNotification } from './notifications';
import { addMyFriends } from './userFriends';

let socket;

export function socketInit() {
  if (!socket) {
    const token = Account.getToken();
    socket = io.connect(Api.url, {
      query: `token=${token}`,
    });
  }
  return (dispatch, getState) => {
    const {
      graphs: { singleGraph },
      account: { myAccount: { id: userId } },
    } = getState();
    socket.on(`graphUpdate-${singleGraph.id}`, (data) => {
      data.id = +data.id;

      return (
        (data.id === singleGraph.id)
        && dispatch(updateSingleGraph(data))
      );
    });

    socket.on(`notificationsListGraphShared-${userId}`, (data) => {
      dispatch(addNotification(data));
    });

    socket.on(`updateUserfriend-${userId}`, (data) => {
      dispatch(addMyFriends(data));
    });
  };
}
