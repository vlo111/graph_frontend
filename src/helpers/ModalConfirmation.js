import React, {useEffect} from 'react';
import Modal from 'react-modal';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import {ReactComponent as CloseSvg} from '../assets/images/icons/close.svg';
import Button from '../components/form/Button';

const ModalConfirmation = React.memo(({yes, no, onAccept, onCancel, title, description}) => {

    return(
    <Modal
        className="ghModal deleteModal"
        overlayClassName="ghModalOverlay"
        isOpen
        onRequestClose={onCancel}
    >
        <div className="containerModal">
            <Button color="transparent" className="close" icon={<CloseSvg/>} onClick={onCancel}/>
            <div className="form">
                <h2>{title}</h2>
                <p>
                    {description}
                </p>
                <div className="buttons">
                    <button className="btn-delete" onClick={onCancel}>
                        {no}
                    </button>
                    <button className="btn-classic" onClick={onAccept}>
                        {yes}
                    </button>
                </div>
            </div>
        </div>
    </Modal>)
});

export default ModalConfirmation;
