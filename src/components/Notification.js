import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import NotifyMe from 'react-notification-timeline';
import { listNotificationsRequest, NotificationsUpdateRequest, addNotification } from '../store/actions/notifications';
import { notificationsList } from '../store/selectors/notifications';
import SocketContext from '../context/Socket';

const NotificationList = (props) => {
  const dispatch = useDispatch();
  const list = useSelector(notificationsList);

  useEffect(() => {
    dispatch(listNotificationsRequest());

    props.socket.on('notificationsListGraphShared', (data) => {
      dispatch(addNotification(data));
    });
  }, [dispatch]);

  return (
    <NotifyMe
      data={list}
      notific_key="createdAt"
      notific_value="text"
      heading="Notification Alerts"
      sortedByKey={false}
      showDate
      size={30}
      color="white"
      onMarkAsRead={() => { dispatch(NotificationsUpdateRequest()); }}
    />
  );
};

const Notification = (props) => (
  <SocketContext.Consumer>
    {(socket) => <NotificationList {...props} socket={socket} />}
  </SocketContext.Consumer>
);

Notification.propTypes = {
  socket: PropTypes.object.isRequired,
};

export default Notification;
