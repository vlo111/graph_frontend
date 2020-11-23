import io from 'socket.io-client';
import Chart from '../../Chart';
import Api from '../../Api';
import Account from '../../helpers/Account';
import { updateSingleGraph } from './graphs';
import { addNotification } from './notifications';
import { addMyFriends } from './userFriends';
import Utils from '../../helpers/Utils';

let socket;
const notPushedEmits = [];

export function socketEmit(...params) {
  if (socket?.init) {
    socket.emit(...params);
  } else {
    notPushedEmits.push(params);
  }
}

export const SOCKET_LABEL_EMBED_COPY = 'SOCKET_LABEL_EMBED_COPY';

export function socketInit() {
  return (dispatch, getState) => {
    if (socket) {
      return;
    }
    const {
      graphs: { singleGraph },
      account: { myAccount: { id: userId } },
    } = getState();
    const token = Account.getToken();

    socket = io.connect(Api.url, {
      query: `token=${token}`,
    });

    socket.on('connect', () => {
      const graphId = Utils.getGraphIdFormUrl();
      if (graphId) {
        dispatch(socketSetActiveGraph(graphId));
      }
      setTimeout(() => {
        socket.init = true;
        notPushedEmits.forEach((params) => {
          socket.emit(...params);
        });
      }, 500);
    });

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
        if (l.id === labelEmbed.id) {
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
      const graphId = Utils.getGraphIdFormUrl();
      const { app: { filters } } = getState();
      if (+data.sourceId === graphId) {
        return;
      }
      if (!Chart.getLabels().some((l) => l.id === data.label.id)) {
        return;
      }
      let changed = false;
      const embedLabels = Chart.data.embedLabels.map((l) => {
        if (+l.sourceId === +data.sourceId) {
          changed = true;
          return data;
        }
        return l;
      });
      if (!changed) {
        embedLabels.push(data);
      }
      Chart.render({ embedLabels }, { filters });
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
