import React from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { useSelector } from 'react-redux';

import CommentItems from './partials/CommentItems';
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
        style={{ maxWidth: 900 }}
      >
        <div className="comment-modal__title">
          <h3>{singleGraph.title}</h3>
          <Button
            icon={<CloseSvg style={{ height: 30 }} />}
            onClick={() => closeModal()}
            className="transparent"
          />
        </div>
        <CommentItems />
        <AddComment />
      </Modal>
    )
  );
});

CommentModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
};

export default CommentModal;
