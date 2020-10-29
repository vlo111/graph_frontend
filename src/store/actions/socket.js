import io from 'socket.io-client';
import Api from '../../Api';
import Account from '../../helpers/Account';
import { updateSingleGraph } from './graphs';
import { addNotification } from './notifications';
import { addMyFriends } from './userFriends';
import Chart from "../../Chart";

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

    socket.on('socketLabelDataChange', (data) => {
      const [, graphId] = window.location.pathname.match(/\/(\d+)$/); // todo write better solution
      if (+data.graphId !== +graphId) {
        let changed = false;
        const embedLabels = Chart.data.embedLabels.map(l => {
          console.log(l.graphId , data.graphId)
          if (+l.graphId === +data.graphId) {
            changed = true;
            l = data;
          }
          return l;
        });
        if (changed) {
          Chart.render({ embedLabels })
        }
      }
    });
  };
}

export const SOCKET_LABEL_DATA_CHANGE = 'SOCKET_LABEL_DATA_CHANGE';

export function socketLabelDataChange(graph) {
  socket.emit('socketLabelDataChange', graph);
  return {
    type: SOCKET_LABEL_DATA_CHANGE,
    payload: {
      graph,
    },
  };
}
