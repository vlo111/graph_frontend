import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '../../form/Button';
import { getAccount } from '../../../store/selectors/account';
import { getGraphCommentParent } from '../../../store/selectors/commentGraphs';
import { createGraphCommentRequest, setGraphCommentParent } from '../../../store/actions/commentGraphs';
import JoditEditor from "jodit-react";  


const AddComment = ({ graph, closeModal, isReply }) => {
  const dispatch = useDispatch();
  const myAccount = useSelector(getAccount);
  const parent = useSelector(getGraphCommentParent);
  const [text, setText] = useState('');
  const editor = useRef(null) 
  return (
    <div className={isReply ? 'comment-modal__add-comment-section--reply' : ''}>
      <hr />
     
      <JoditEditor
        id={isReply ? 'reply-comment' : 'add-comment'}
        class='comment-modal__add-comment-input'
        ref={editor}
        value={text}
        tabIndex={2} // tabIndex of textarea
        // onBlur={value => setText(value)}  
        onChange={(value) => setText(value)}
        onChangeText={(value) => setText(value)}
        limit={250}
      /> 
      <div className="comment-modal__add-comment-buttons">
        <Button
          className=" ghButton2 comment-modal__add-comment-cancel"
          onClick={() => {
            if (parent.id) {
              dispatch(setGraphCommentParent({}));
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
              dispatch(createGraphCommentRequest(
                {
                  graphId: graph.id,
                  text,
                  parentId: parent.id,
                },
              ));
            setText('');
            dispatch(setGraphCommentParent({}));
          }}
          className="ghButton2 comment-modal__add-comment-button"
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
