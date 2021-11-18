import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import AddComment from '../../CommentNode/partials/AddComment';
import CommentItems from '../../CommentNode/partials/CommentItems';
import { getNodeComments } from '../../../store/selectors/commentNodes';

const Comment = ({ node, graph }) => {
  const graphComments = useSelector(getNodeComments);

  return (
    <div className="comment">
      <div className="comment-content">
        {!graphComments.length ? <div className="notComment">zaza you have no comment yet</div>
          : <CommentItems graph={graph} node={node} graphComments={graphComments} />}
        <AddComment
          graph={graph}
          node={node}
        />
      </div>
    </div>
  );
};

Comment.propTypes = {
  node: PropTypes.object.isRequired,
  graph: PropTypes.object.isRequired,
};

export default Comment;
