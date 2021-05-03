import React, {
  useState, useCallback
} from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from "react-router-dom";
import PropTypes from 'prop-types';
import queryString from 'query-string';
 import Popover from './form/Popover';
import Button from './form/Button';
import { toast } from 'react-toastify'; 
import UpdateGraphModal from './chart/UpdateGraphModal';
import { deleteGraphRequest } from '../store/actions/graphs';
import {deleteGraphRequest as DeleteShareGraphRequest} from '../store/actions/shareGraphs';
import { ReactComponent as TrashSvg } from '../assets/images/icons/trash.svg';
import { ReactComponent as EditSvg } from '../assets/images/icons/edit.svg'; 
import { ReactComponent as EllipsisVSvg } from '../assets/images/icons/ellipsis.svg'; 
import { getGraphsListRequest } from '../store/actions/graphs';
import ShareModal from './ShareModal';

const GraphListHeader = ({ graph, headerTools }) => {
  const dispatch = useDispatch();
  const [openEditModal, setOpenEditModal] = useState(false); 
  const [openShareModal, setOpenShareModal] = useState(false); 
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
          className="delete" />
      ) : (
       <div>         
          <Popover
            showArrow
            triggerNode={<Button className="ar-popover-trigger" ><EllipsisVSvg style={{ height: 23 }} /></Button>}
            trigger='click'
          >
            <div className="ar-popover-list">
                <Button
                  // icon={<EditSvg style={{ height: 30 }} />}
                  className="child "
                  onClick={() => setOpenEditModal(true)} > 
                  Rename
                  </Button>             
                <Button
                  // icon={<EditSvg style={{ height: 30 }} />}
                  className="child "
                  onClick={() => setOpenShareModal(true)} > 
                  Share
                  </Button>             
                <Button
                  // icon={<TrashSvg style={{ height: 30 }} />}
                  onClick={deleteGraph}
                  className="child dashboard-delete" >  
                  Delete
                  </Button>
              </div>
            </Popover>
         </div>
        )}
      {openEditModal && (
        <UpdateGraphModal
          closeModal={() => setOpenEditModal(false)}
          graph={graph}
        />
      )}
      {openShareModal && (
        <ShareModal 
          closeModal={() => setOpenShareModal(false)} 
          graph={graph} 
          setButton
        />
     )}
    </div>
  );
};

GraphListHeader.propTypes = {
  graph: PropTypes.object.isRequired, 
};

export default React.memo(GraphListHeader);
