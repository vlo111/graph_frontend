import React from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';

import CommentItems from './partials/CommentItems';
import AddComment from './partials/AddComment';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Button from '../form/Button';

const CommentModal = React.memo(({ closeModal, graph }) => {
  const afterOpenModal = () => {};
  return (isEmpty(graph) ? null
    : (
      <Modal
        isOpen
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        contentLabel="Comment"
        style={{ maxWidth: 900 }}
        id="comment-modal"
      >
        <div className="comment-modal__title">
          <h3>{graph.title}</h3>
          <Button
            icon={<CloseSvg style={{ height: 30 }} />}
            onClick={() => closeModal()}
            className="transparent"
          />
        </div>
        <CommentItems graph={graph} />
        <AddComment
          graph={graph}
          closeModal={closeModal}
        />
      </Modal>
    )
  );
});

CommentModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  graph: PropTypes.object.isRequired,
};

export default CommentModal;
