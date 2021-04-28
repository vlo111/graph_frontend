import React, {
  useState, useCallback
} from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from "react-router-dom";
import PropTypes from 'prop-types';
import queryString from 'query-string';

import { toast } from 'react-toastify';
import Button from './form/Button';
import { updateGraphRequest } from '../store/actions/shareGraphs';
import UpdateGraphModal from './chart/UpdateGraphModal';
import { deleteGraphRequest } from '../store/actions/graphs';
import {deleteGraphRequest as DeleteShareGraphRequest} from '../store/actions/shareGraphs';

import { ReactComponent as TrashSvg } from '../assets/images/icons/trash.svg';
import { ReactComponent as EditSvg } from '../assets/images/icons/edit.svg';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { getGraphsListRequest } from '../store/actions/graphs';

const GraphListHeader = ({ graph, headerTools }) => {
  const dispatch = useDispatch();
  const [openEditModal, setOpenEditModal] = useState(false);
  const history = useHistory()
  const { page = 1, s: searchParam } = queryString.parse(window.location.search); 
  const notification = false;
  
  async function deleteGraph(event) {
    event.preventDefault();
    try {

      if (window.confirm('Are you sure?')) {
        await dispatch(deleteGraphRequest(graph.id));
        // use selector
        await dispatch(getGraphsListRequest(page, { s: searchParam }));

        history.push("/");
        toast.info('Successfully deleted');
      }
    } catch (e) {


    }
  }

  const handleDeleteShareGraph = useCallback((shareGraphId) => {

    if (window.confirm('Are you sure?')) { 
      //delete
      dispatch(DeleteShareGraphRequest(shareGraphId, notification));
      history.push("/");
      toast.info('Successfully deleted');
    }
  }, [dispatch]); 
  
  return (
   
    <div className="graphListHeader">
      {headerTools ? (
        <Button
          icon={<TrashSvg style={{ height: 30 }} />}
          onClick={() => handleDeleteShareGraph(graph?.share.id)}
          className="transparent delete" />
      ) : (
          <DropdownButton
            iconClass="fa list-ul"
            alignRight
            // drop={"left"}
            title={
              <span><i className="fa fa-bars fa-ellipsis-v "></i> </span> // fa-fw 
            }
            id="dropdown-graphListHeader"
          >
            <Button
              icon={<EditSvg style={{ height: 30 }} />}
              className="transparent edit"
              onClick={() => setOpenEditModal(true)} />
            <Button
              icon={<TrashSvg style={{ height: 30 }} />}
              onClick={deleteGraph}
              className="transparent delete" />
          </DropdownButton>
        )}
      {openEditModal && (
        <UpdateGraphModal
          closeModal={() => setOpenEditModal(false)}
          graph={graph}
        />
      )}
    </div>
  );
};

GraphListHeader.propTypes = {
  graph: PropTypes.object.isRequired, 
};

export default React.memo(GraphListHeader);
