import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import { getGraphComments } from '../../../store/selectors/commentGraphs';
import { getGraphCommentsRequest } from '../../../store/actions/commentGraphs';
import Owner from './Owner';

const CommentItems = ({ graph }) => {
  const dispatch = useDispatch();
  const graphComments = useSelector(getGraphComments);

  useEffect(() => {
    dispatch(getGraphCommentsRequest({ graphId: graph.id }));
  }, []);

  return (
    <div className="comment-modal__comments-wrapper">
      {graphComments.map((comment) => (
        <div className="comment-modal__comment-item" key={`comment-${comment.id}`}>
          <Owner
            user={comment.user}
            date={moment.utc(comment.createdAt).format('DD.MM.YYYY')}
          />
          {comment.text}
        </div>
      ))}
    </div>
  );
};

CommentItems.propTypes = {
  graph: PropTypes.object.isRequired,
};

export default CommentItems;
