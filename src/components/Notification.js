import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import NotifyMe from 'react-notification-timeline';
import { listNotificationsRequest, NotificationsUpdateRequest, addNotification } from '../store/actions/notifications';
import { notificationsList } from '../store/selectors/notifications';
import SocketContext from '../context/Socket';
import { getId } from '../store/selectors/account';

const NotifyLink = ({ url, children }) => (url ? <Link to={url}>{children}</Link> : <>{children}</>);
NotifyLink.defaultProps = {
  url: '',
};
NotifyLink.propTypes = {
  url: PropTypes.string,
  children: PropTypes.node.isRequired,
};

const NotificationList = (props) => {
  const userId = useSelector(getId);
  const dispatch = useDispatch();
  const list = useSelector(notificationsList);

  useEffect(() => {
    dispatch(listNotificationsRequest());
  }, [dispatch]);

  useEffect(() => {
    props.socket.on(`notificationsListGraphShared-${userId}`, (data) => {
      dispatch(addNotification(data));
    });
  }, [userId, dispatch, props.socket]);
  
  list.forEach(item => item.link = `/graphs/preview/${item.graphId}`)

  return (
    <NotifyMe
      data={list}
      notific_key="createdAt"
      link="link"
      notifyLink={NotifyLink}
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

NotificationList.propTypes = {
  socket: PropTypes.object.isRequired,
};

export default (props) => (
  <SocketContext.Consumer>
    {(socket) => <NotificationList {...props} socket={socket} />}
  </SocketContext.Consumer>
);
