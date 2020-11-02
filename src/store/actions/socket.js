import io from 'socket.io-client';
import Chart from '../../Chart';
import Api from '../../Api';
import Account from '../../helpers/Account';
import { updateSingleGraph } from './graphs';
import { addNotification } from './notifications';
import { addMyFriends } from './userFriends';

export const SOCKET_LABEL_EMBED_COPY = 'SOCKET_LABEL_EMBED_COPY';

export function socketEmit(...params) {
  const socket = getSocket();
  const interval = setInterval(emit, 200);
  emit();

  function emit() {
    if (socket?.id) {
      socket.emit(...params);
      clearInterval(interval);
    }
  }
}

let s;

export function getSocket() {
  if (!s) {
    const token = Account.getToken();
    s = io.connect(Api.url, {
      query: `token=${token}`,
    });
  }
  return s;
}

export function socketInit() {
  const socket = getSocket();
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

    socket.on('labelEmbedCopy', (labelEmbed) => {
      Chart.data.labels = Chart.data.labels.map((l) => {
        if (l.name === labelEmbed.name) {
          l.hasInEmbed = true;
        }
        return l;
      });
      dispatch({
        type: SOCKET_LABEL_EMBED_COPY,
        payload: {
          labelEmbed,
        },
      });
    });

    socket.on('embedLabelDataChange', (data) => {
      const [, graphId] = window.location.pathname.match(/\/(\d+)$/) || [0, 0]; // todo write better solution
      if (+data.graphId === +graphId) {
        return;
      }
      let changed = false;
      const embedLabels = Chart.data.embedLabels.map((l) => {
        if (+l.graphId === +data.graphId) {
          changed = true;
          data.sourceId = data.graphId;
          l = data;
        }
        return l;
      });
      if (!changed) {
        embedLabels.push(data);
      }
      Chart.render({ embedLabels });
    });
  };
}

export const SOCKET_LABEL_DATA_CHANGE = 'SOCKET_LABEL_DATA_CHANGE';

export function socketLabelDataChange(graph) {
  socketEmit('labelDataChange', graph);
  return {
    type: SOCKET_LABEL_DATA_CHANGE,
    payload: {
      graph,
    },
  };
}

export const SOCKET_SET_ACTIVE_GRAPH = 'SOCKET_SET_ACTIVE_GRAPH';

export function socketSetActiveGraph(graphId) {
  socketEmit('setActiveGraph', { graphId });
  return {
    type: SOCKET_SET_ACTIVE_GRAPH,
    payload: {
      graphId,
    },
  };
}
