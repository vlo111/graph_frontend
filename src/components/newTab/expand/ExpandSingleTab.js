import React from 'react';
import Modal from 'react-modal';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { getSingleGraph } from '../../../store/selectors/graphs';
import { ReactComponent as CloseSvg } from '../../../assets/images/icons/close.svg';
import Button from '../../form/Button';
import { ReactComponent as TabExpandSvg } from '../../../assets/images/icons/tab_expand_header.svg';

const ExpandSingleTab = ({
  html, name, onClose, created,
}) => {
  const { user: { firstName, lastName } } = useSelector(getSingleGraph);

  return (
    <Modal
      className="ghModal expandTabNode"
      overlayClassName="ghModalOverlay"
      isOpen
    >
      <Button color="transparent" className="close" icon={<CloseSvg />} onClick={onClose} />
      <div className="tab-expand-node">
        <strong className="name">{name === '_description' ? 'Description' : name}</strong>
        <div className="info">
          <p className="create-by">
            Created by:
            {` ${firstName} ${lastName}`}
          </p>
          <p className="create-data">{created}</p>
        </div>
        <div className="header">
          <TabExpandSvg />
        </div>
        <div className="tab-expand-container">
          <div className="content" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </Modal>
  );
};

ExpandSingleTab.propTypes = {
  html: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  created: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ExpandSingleTab;
