import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import Button from '../../form/Button';
import { setGraphCommentParent } from '../../../store/actions/commentGraphs';
import { ReactComponent as EditSvg } from '../../../assets/images/icons/edit.svg';

const Owner = ({
  user, date, edit, comment,
}) => {
  const dispatch = useDispatch();

  return (
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
          {edit && (
            <Button
              icon={<EditSvg style={{ height: 17 }} />}
              onClick={() => {
                dispatch(setGraphCommentParent(comment));
                setTimeout(() => {
                  const replyInput = document.getElementById('reply-comment');
                  if (replyInput) replyInput.focus();
                  else document.getElementById('add-comment').focus();
                });
              }}
              className="transparent"
            >
              <spa>reply</spa>
            </Button>
          )}
        </>
      )}
    </div>
  );
};

Owner.propTypes = {
  user: PropTypes.object.isRequired,
  date: PropTypes.string,
  edit: PropTypes.bool,
  comment: PropTypes.object,
};

Owner.defaultProps = {
  date: '',
  edit: false,
  comment: {},
};

export default Owner;
