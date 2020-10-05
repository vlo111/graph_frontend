import React from 'react';
import PropTypes from 'prop-types';

const Owner = ({ user, date }) => (
  <div className="comment-modal__owner">
    {user && (
      <>
        <img
          className="avatar circle comment-modal__owner-logo"
          src={user && user.avatar}
          alt={`${user.firstName} ${user.lastName}`}
        />
        <span>
          {`${user.firstName} ${user.lastName}`}
          <br />
          <span className="comment-modal__comment-date">{date}</span>
        </span>
      </>
    )}
  </div>
);

Owner.propTypes = {
  user: PropTypes.object.isRequired,
  date: PropTypes.string,
};

export default Owner;
