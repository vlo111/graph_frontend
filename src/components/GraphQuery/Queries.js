import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-modal';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import EditableLabel from 'react-editable-label';
import Button from '../form/Button';
import {
  getGraphQueryRequest, deleteGraphQueryRequest,
  getGraphQueryDataRequest, updateGraphQueryRequest,
} from '../../store/actions/query';
import { graphQueryLIst } from '../../store/selectors/query';
import ChartUtils from '../../helpers/ChartUtils';
import Chart from '../../Chart';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { ReactComponent as EditSvg } from '../../assets/images/icons/edit.svg';
import { ReactComponent as DeleteSvg } from '../../assets/images/icons/delete.svg';
import { ReactComponent as QuerySvg } from '../../assets/images/icons/query.svg';

const Queries = ({ closeModal, graphId }) => {
  const dispatch = useDispatch();
  const afterOpenModal = () => { };
  const queryLIst = useSelector(graphQueryLIst);
  useEffect(() => {
    if (graphId) {
      dispatch(getGraphQueryRequest(graphId));
    }
  }, [dispatch, graphId]);
  const handleDelete = useCallback((id) => {
    if (window.confirm('Are you sure?')) {
      dispatch(deleteGraphQueryRequest(id));
    }
  }, [dispatch]);
  const showQueryData = async (id) => {
    let nodes = [];
    let links = [];
    const { payload: { data } } = await dispatch(getGraphQueryDataRequest(id, graphId));
    if (data.status === 'ok') {
      nodes = data.nodes;
      links = data.links;
      links = ChartUtils.cleanLinks(links, nodes);
    }
    Chart.render({ nodes, links }, { ignoreAutoSave: true });
  };
  const handleEdit = useCallback((id, title, description) => {
    if (title.trim() === '') {
      return;
    }
    dispatch(updateGraphQueryRequest(id, title, description));
  }, [dispatch]);
  return (isEmpty(graphId) ? null
    : (
      <Modal
        isOpen
        onAfterOpen={afterOpenModal}
        contentLabel="Query"
        id="query-modal"
        className="ghModal queriesModal"
        overlayClassName="ghModalOverlay  graphQueryOverlay"
      >
        <div className="query-modal__title">
          <h3 className="name">Query</h3>
          <Button
            icon={<CloseSvg style={{ height: 30 }} />}
            onClick={() => closeModal()}
            className="transparent"
          />
        </div>
        <div className="query-modal__list">
          {queryLIst && queryLIst.map((item, index) => (

            <div className="query__list" key={index}>
              <Button
                icon={<QuerySvg style={{ height: 30 }} />}
                className="transparent"
                onClick={() => showQueryData(item.id)}
              />
              <EditableLabel
                labelClass="labelClass"
                inputClass="inputClass "
                heading={item.title}
                initialValue={item.title}
                save={(title) => handleEdit(item.id, title, item.description)}
              />
              <EditableLabel
                labelClass="labelClass"
                inputClass="inputClass "
                heading={item.description}
                initialValue={item.description}
                save={(description) => handleEdit(item.id, item.title, description)}
              />
              {/* <Button
                icon={<EditSvg style={{ height: 30 }} />}
                className="transparent"
                onClick={(e) => handleEditClick()}
                title="Edit"
              /> */}
              <Button
                icon={<DeleteSvg style={{ height: 30 }} />}
                className="transparent delete"
                onClick={() => handleDelete(item.id)}
                title="Delete"
              />
            </div>
          ))}
        </div>
      </Modal>
    )
  );
};
Queries.propTypes = {
  graphId: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
};
export default Queries;
