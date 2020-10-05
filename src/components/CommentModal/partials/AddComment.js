import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Owner from './Owner';
import Button from '../../form/Button';
import Input from '../../form/Input';
import { getAccount } from '../../../store/selectors/account';
import { createGraphCommentRequest } from '../../../store/actions/commentGraphs';

const AddComment = ({ graph, closeModal }) => {
  const dispatch = useDispatch();
  const myAccount = useSelector(getAccount);
  const [text, setText] = useState('');

  return (
    <div className="comment-modal__add-comment-section">
      <Owner user={myAccount.myAccount} />
      <Input textArea onChangeText={(value) => setText(value)} className="comment-modal__add-comment-input" />
      <div className="comment-modal__add-comment-buttons">
        <Button
          className="comment-modal__add-comment-cancel"
          onClick={() => closeModal()}
        >
          Cancel
        </Button>
        <Button
          onClick={() => (
            dispatch(createGraphCommentRequest(
              { graphId: graph.id, text },
            ))
          )}
          className="comment-modal__add-comment-button"
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
};

export default AddComment;
