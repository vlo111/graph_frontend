import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import SocketContext from './context/Socket';
import { getSingleGraph } from './store/selectors/graphs';
import { updateSingleGraph } from './store/actions/graphs';
import { addNotification } from './store/actions/notifications';
import { getId } from './store/selectors/account';

const Socket = ({ socket, children }) => {
  const dispatch = useDispatch();
  const userId = useSelector(getId);
  const singleGraph = useSelector(getSingleGraph);

  useEffect(() => {
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

    return () => socket.disconnect();
  }, []);

  return children;
};

export default (props) => (
  <SocketContext.Consumer>
    {(socket) => <Socket {...props} socket={socket} />}
  </SocketContext.Consumer>
);
