import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import Button from '../../form/Button';
import { setNodeCommentParent, deleteNodeComment } from '../../../store/actions/commentNodes';
import { ReactComponent as ReplySvg } from '../../../assets/images/icons/reply.svg';
import { ReactComponent as RemoveSvg } from '../../../assets/images/icons/trash.svg';

const Owner = ({
  user, date, edit, remove, comment,
}) => {
  const ownerStyles = {
    owner: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: '10px 30px',
    },
    logo: {
      height: '40px',
      width: '40px',
    },
    user_info: {
      display: 'flex',
      flexDirection: 'column',
    },
    user_name: {
      color: '#6356ff',
      fontSize: '15px',
      fontWeight: 600,
    },
    user_date: {
      fontSize: '13px',
      color: '#424242',
    },
    settings: {
      marginBottom: '0',
      fontWeight: 600,
      fontSize: '1rem',
    },
  };

  const dispatch = useDispatch();

  return (
    <div style={ownerStyles.owner} className="owner">
      {user && (
        <>
          <img
            style={ownerStyles.logo}
            className="avatar circle"
            src={user && user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
          />
          <span style={ownerStyles.user_info}>
            <span style={ownerStyles.user_name}>
              {`${user.firstName} ${user.lastName}`}
            </span>
            <span style={ownerStyles.user_date}>{date}</span>
          </span>
          <div className="settings">
            {edit && (
            <Button
              icon={<ReplySvg style={{ height: 17 }} />}
              onClick={() => {
                dispatch(setNodeCommentParent(comment));
                setTimeout(() => {
                  const replyInput = document.getElementById('reply-comment');
                  // if (replyInput) replyInput.focus();
                  // else document.getElementById('add-comment').focus();
                });
              }}
              className="transparent reply"
              title="reply"
            />
            )}
            {remove && (
            <Button
              icon={<RemoveSvg style={{ height: 17 }} />}
              onClick={() => {
                dispatch(deleteNodeComment(comment.id));
              }}
              className="transparent remove"
              title="Remove"
            />
            )}
          </div>
        </>
      )}
    </div>
  );
};

Owner.propTypes = {
  user: PropTypes.object.isRequired,
  date: PropTypes.string,
  edit: PropTypes.bool,
  remove: PropTypes.bool,
  comment: PropTypes.object,
};

Owner.defaultProps = {
  date: '',
  edit: false,
  remove: false,
  comment: {},
};

export default Owner;
