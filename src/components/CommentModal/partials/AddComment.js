import React, {useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Owner from './Owner';
import Button from '../../form/Button';
import Input from '../../form/Input';
import { getSingleGraph } from '../../../store/selectors/graphs';
import { getAccount } from '../../../store/selectors/account';
import { createGraphCommentRequest } from '../../../store/actions/commentGraphs';

export default () => {
  const dispatch = useDispatch();
  const singleGraph = useSelector(getSingleGraph);
  const myAccount = useSelector(getAccount);
  const [text, setText] = useState('');

  return (
    <div className="comment-modal__add-comment-section">
      <Owner user={myAccount.myAccount} />
      <Input textArea onChangeText={(value) => setText(value)} className="comment-modal__add-comment-input" />
      <div className="comment-modal__add-comment-buttons">
        <Button className="comment-modal__add-comment-cancel">
          Cancel
        </Button>
        <Button
          onClick={() => (
            dispatch(createGraphCommentRequest(
              { graphId: singleGraph.id, text },
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
