import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import NotifyMe from 'react-notification-timeline';
import { listNotificationsRequest, NotificationsUpdateRequest } from '../store/actions/notifications';
import { notificationsList } from '../store/selectors/notifications';

const NotifyLink = ({ url, children }) => (url ? <Link to={url}>{children}</Link> : <>{children}</>);
NotifyLink.defaultProps = {
  url: '',
};
NotifyLink.propTypes = {
  url: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default () => {
  const dispatch = useDispatch();
  const list = useSelector(notificationsList);

  useEffect(() => {
    dispatch(listNotificationsRequest());
  }, [dispatch]);

  list.forEach((item) => {
    item.link = `/graphs/preview/${item.graphId}`;
  });

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
