import React from 'react';
import PropTypes from 'prop-types';
import AddComment from '../../CommentNode/partials/AddComment';
import CommentItems from '../../CommentNode/partials/CommentItems';


const Comment = ({ node, graph }) => (
  <div className="comment">
    <div className="comment-content">
      <CommentItems graph={graph} node={node} />
      <AddComment
        graph={graph}
        node={node}
      />
    </div>
  </div>
);

Comment.propTypes = {
  node: PropTypes.object.isRequired,
  graph: PropTypes.object.isRequired,
};

export default Comment;
