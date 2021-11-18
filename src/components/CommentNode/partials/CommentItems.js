import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';
import { getNodeCommentParent, getNodeComments } from '../../../store/selectors/commentNodes';
import { getId } from '../../../store/selectors/account';
import { getNodeCommentsRequest, getActionsCountRequest } from '../../../store/actions/commentNodes';

import Owner from './Owner';
import AddComment from './AddComment';

const CommentItem = ({ comment, isReply }) => {
  const userId = useSelector(getId);
  const [compressComment, setCompressComment] = useState('');

  const moreBtn = '<button class="more-btn">more</button>';
  const lessBtn = '<button class="less-btn">less</button>';

  useEffect(() => {
    const commentHtml = document.createElement('div');
    commentHtml.innerHTML = comment.text;

    if (commentHtml.innerText.length > 60) {
      let commentText = controlLink(comment.text);

      commentText += `... ${moreBtn}`;
      setCompressComment(commentText);
    } else {
      setCompressComment(comment.text);
    }
    window.scrollTo(0, document.body.scrollHeight);
  }, []);

  const expandText = (ev) => {
    const { target } = ev;

    if (target.className === 'more-btn') {
      setCompressComment(`${comment.text.substr(0, comment.text.length - 4)} ${lessBtn}`);
    } else if (target.className === 'less-btn') {
      setCompressComment(`${controlLink(comment.text).substr(0, 400)}... ${moreBtn}`);
    }
  };

  const controlLink = (commentText) => {
    let modifiedComment;

    modifiedComment = commentText.substr(0, 400);

    const link = modifiedComment.split('<a href');

    const subComment = link[link.length - 1];

    if (!subComment.includes('</a>')) {
      modifiedComment = modifiedComment.replace(`<a href${subComment}`, '');
    }

    return modifiedComment;
  };

  return (
    <div className={`comment-content-wrapper-item ${isReply ? '--reply' : ''}`} key={`comment-${comment.id}`}>
      <div className="owner">
        <Owner
          user={comment.user}
          date={moment.utc(comment.createdAt).format('DD.MM.YYYY')}
          comment={comment}
          edit={!isReply}
          remove={userId === comment.user.id}
        />
        <div className="comment-text" onClick={expandText} dangerouslySetInnerHTML={{ __html: compressComment || comment.text }} />
      </div>
    </div>
  );
};

const CommentItems = ({
  graph, node, closeModal, graphComments,
}) => {
  const dispatch = useDispatch();
  const parent = useSelector(getNodeCommentParent);

  useEffect(() => {
    dispatch(getNodeCommentsRequest({ graphId: graph.id, nodeId: node.id }));
  }, []);

  /* @todo get document elements size
  * 56 graph header height
  * 58 - tab header node info
  * 40 - switch tabs header
  * 20 - self padding
  *  */

  const addCommentHeight = document.querySelector('.commentWrite')?.offsetHeight;

  const height = window.innerHeight - addCommentHeight - 56 - 58 - 40 - 20;

  const heightStyle = {
    height,
  };

  return heightStyle ? (
    <div className="comment-content-wrapper" style={heightStyle}>
      {graphComments.map((comment) => (
        <>
          <CommentItem comment={comment} />
          {comment.children?.map((reply) => (
            <CommentItem comment={reply} isReply />
          ))}
          {parent && parent.id === comment.id && (
            <AddComment
              graph={graph}
              node={node}
              closeModal={closeModal}
              isReply
            />
          )}
        </>
      ))}
    </div>
  ) : <></>;
};

CommentItems.propTypes = {
  graph: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
};

CommentItem.propTypes = {
  comment: PropTypes.object.isRequired,
  isReply: PropTypes.bool,
};

CommentItem.defaultProps = {
  isReply: false,
};

export default CommentItems;
