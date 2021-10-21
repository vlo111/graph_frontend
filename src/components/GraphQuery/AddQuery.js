import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { toast } from 'react-toastify';
import Button from '../form/Button';
import Input from '../form/Input';
import ChartUtils from '../../helpers/ChartUtils';
import { createGraphQueryRequest } from '../../store/actions/query';

import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';

const AddQuery = ({ closeModal, graph }) => {
  const [query, setQuery] = useState({
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const afterOpenModal = () => { };
  const nodes = ChartUtils.getNodeIdList();
  const [data, setData] = useState(nodes.length);
  const links = ChartUtils.getLinksId() || [];
  const dispatch = useDispatch();
  const handleChange = (e) => {
    e.preventDefault();
    setQuery({ ...query, [e.target.name]: e.target.value });
  };
  const validate = (values) => {
    const error = {};
    if (!values.title) {
      error.title = 'Title is required';
    }
    return error;
  };
  const handlerSumbit = (e) => {
    e.preventDefault();
    setErrors(validate(query));
    if (data === 0) {
      toast.error('You have no data');
    }
    if (query.title !== '') { saveGraphQuery(); }
  };
  const saveGraphQuery = () => {
    dispatch(createGraphQueryRequest({
      graphId: graph.id, title: query.title, description: query.description, nodes, links,
    }));
    closeModal();
  };
  return (isEmpty(graph) ? null
    : (
      <Modal
        isOpen
        onAfterOpen={afterOpenModal}
        contentLabel="Query"
        id="query-modal"
        className="ghModal createQueryModal"
        overlayClassName="ghModalOverlay  graphQueryOverlay"
      >
        <div className="query-modal__title">
          <h3>Query</h3>
          <Button
            icon={<CloseSvg style={{ height: 30 }} />}
            onClick={() => closeModal()}
            className="transparent"
          />
        </div>
        <div className="query">
          <form onSubmit={handlerSumbit}>
            <div className="title">
              <Input
                label="Title"
                className={`title input ${errors.title && 'is-danger'}`}
                name="title"
                value={query.title}
                onChange={handleChange}
                error={errors.title}
                limit={15}
              />
            </div>
            <div className="textareaEdit">
              <Input
                label="Description"
                className="description"
                name="description"
                value={query.description}
                onChange={handleChange}
                textArea
                limit={50}
              />
            </div>
            <Button
              className="btn-classic"
              type="submit"
              disabled={!data}
            >
              Save
            </Button>

          </form>
        </div>
      </Modal>
    )
  );
};
AddQuery.propTypes = {
  graph: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
};
export default AddQuery;
