import React from 'react';
import Modal from 'react-modal';
import { ReactComponent as TabExpandSvg } from '../../assets/images/icons/tab_expand_header.svg';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Button from '../form/Button';

const NodeExpand = ({ html, name, onClose }) => (
  <Modal
    className="ghModal expandTabNode"
    overlayClassName="ghModalOverlay"
    isOpen
  >
    <Button color="transparent" className="close" icon={<CloseSvg />} onClick={onClose} />
    <div className="tab-expand-node">
      <strong className="name">{name}</strong>
      <div className="info">
        <p className="create-by">Created by: Grig Melkonyan</p>
        <p className="create-data">12/03/2021</p>
      </div>
      <div className="header">
        <TabExpandSvg />
      </div>
      <div className="container">
        <div className="content" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  </Modal>
);

export default NodeExpand;
