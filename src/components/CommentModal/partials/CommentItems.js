import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { getGraphComments } from '../../../store/selectors/commentGraphs';
import { getGraphCommentsRequest } from '../../../store/actions/commentGraphs';
import { getSingleGraph } from '../../../store/selectors/graphs';
import Owner from './Owner';

export default () => {
  const dispatch = useDispatch();
  const graphComments = useSelector(getGraphComments);
  const singleGraph = useSelector(getSingleGraph);

  useEffect(() => {
    dispatch(getGraphCommentsRequest({ graphId: singleGraph.id }));
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
