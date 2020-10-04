import React from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { useSelector } from 'react-redux';

import CommentItem from './partials/CommentItem';
import AddComment from './partials/AddComment';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Button from '../form/Button';
import { getSingleGraph } from '../../store/selectors/graphs';

const CommentModal = React.memo(({ closeModal }) => {
  const afterOpenModal = () => {};
  const singleGraph = useSelector(getSingleGraph);
  return (isEmpty(singleGraph) ? null
    : (
      <Modal
        isOpen
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        contentLabel="Comment"
      >
        <div className="comment-modal__title">
          <h3>Conservative Party</h3>
          <Button
            icon={<CloseSvg style={{ height: 30 }} />}
            onClick={() => closeModal()}
            className="transparent"
          />
        </div>
        <CommentItem />
        <AddComment />
      </Modal>
    )
  );
});

CommentModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
};

export default CommentModal;
