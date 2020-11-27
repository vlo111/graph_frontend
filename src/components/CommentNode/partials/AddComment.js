import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Owner from './Owner';
import Button from '../../form/Button';
import Input from '../../form/Input';
import { getAccount } from '../../../store/selectors/account';
import { getNodeCommentParent } from '../../../store/selectors/commentNodes';
import { createNodeCommentRequest, setNodeCommentParent } from '../../../store/actions/commentNodes';

const AddComment = ({ graph, node, closeModal, isReply }) => {
  const dispatch = useDispatch();
  const myAccount = useSelector(getAccount);
  const parent = useSelector(getNodeCommentParent);
  const [text, setText] = useState('');

  return (
    <div className={isReply ? 'comment-modal__add-comment-section--reply' : ''}>
      <hr />
      <Input
        textArea
        value={text}
        limit={250}
        onChangeText={(value) => setText(value)}
        className="comment-modal__add-comment-input"
        id={isReply ? 'reply-comment' : 'add-comment'}
        placeholder="Make a comment"
      />
      <div className="comment-modal__add-comment-buttons">
        <Button
          className=" ghButton2 comment-modal__add-comment-cancel"
          onClick={() => {
            if (parent.id) {
              dispatch(setNodeCommentParent({}));
            } else {
              closeModal();
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            text.trim() === '' ?
              alert('Text cannot be blank.')
              :
              dispatch(createNodeCommentRequest(
                {
                  graphId: graph.id,
                  nodeId: node.id,
                  text,
                  parentId: parent.id,
                },
              ));
            setText('');
            dispatch(setNodeCommentParent({}));

          }}
          className=" ghButton2 comment-modal__add-comment-button"
        >
          Comment
        </Button>
      </div>
    </div>
  );
};

AddComment.propTypes = {
  graph: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
  isReply: PropTypes.bool,
};

AddComment.defaultProps = {
  isReply: false,
};

export default AddComment;
