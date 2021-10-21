import React, {
  useState, useCallback,
} from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import Popover from '../form/Popover';
import { deleteGraphRequest, getGraphsListRequest } from '../../store/actions/graphs';
import { deleteGraphRequest as DeleteShareGraphRequest } from '../../store/actions/shareGraphs';
import { ReactComponent as EllipsisVSvg } from '../../assets/images/icons/ellipsis.svg';
import ShareModal from '../ShareModal';
import EditGraphModal from '../chart/EditGraphModal';

const GraphListHeader = ({ graph, headerTools, updateGraph }) => {
  const dispatch = useDispatch();
  // const [openEditModal, setOpenEditModal] = useState(false);
  const [openEditGraphModal, setOpenEditGraphModal] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const history = useHistory();
  const { page = 1, s: searchParam } = queryString.parse(window.location.search);
  const notification = false;

  async function deleteGraph(graphId) {
    //  select data from localStorage
    const order = JSON.parse(localStorage.getItem('/')) || 'newest';
    try {
      if (graphId) {
        await dispatch(deleteGraphRequest(graph.id));
        // use selector

        await dispatch(getGraphsListRequest(page, { s: searchParam }));
      } else if (window.confirm('Are you sure?')) {
        await dispatch(deleteGraphRequest(graph.id));
        // use selector
        toast.info('Successfully deleted');
        await dispatch(getGraphsListRequest(page, { s: searchParam, filter: order }));

        history.push('/');
      }
    } catch (e) {
    }
  }

  const handleDeleteShareGraph = useCallback((shareGraphId) => {
    if (window.confirm('Are you sure?')) {
      // delete
      dispatch(DeleteShareGraphRequest(shareGraphId, notification));
      history.push('/');
      toast.info('Successfully deleted');
    }
  }, [dispatch]);

  return (
    <div className="graphListHeader">
      <div>
      {headerTools !== 'public'  ? (
        <Popover
          showArrow
          triggerNode={<div className="ar-popover-trigger"><EllipsisVSvg /></div>}
          trigger="click"
        >
          <div className="ar-popover-list">
            {headerTools === 'shared' ? (
              <div
                onClick={() => handleDeleteShareGraph(graph?.share.id)}
                className="child dashboard-delete"
              >
                <span className="dashboard-delete">
                  Delete
                </span>
              </div>
            ) : (
              <>
                <div
                  className="child "
                  onClick={() => setOpenEditGraphModal(true)}
                >
                  <span>
                    Edit
                  </span>
                </div>
                <div
                  className="child "
                  onClick={() => setOpenShareModal(true)}
                >
                  <span>
                    Share
                  </span>
                </div>
                <div
                  onClick={() => deleteGraph(false)}
                  className="child dashboard-delete"
                >
                  <span className="dashboard-delete">
                    Delete
                  </span>
                </div>
              </>
            )}
          </div>
        </Popover>
        ): null}
      </div>
      {openShareModal && (
        <ShareModal
          closeModal={() => setOpenShareModal(false)}
          graph={graph}
          setButton
        />
      )}
      {openEditGraphModal && (
        <EditGraphModal
          toggleModal={(value) => setOpenEditGraphModal(value)}
          graph={graph}
          deleteGraph={(graphId) => deleteGraph(graphId)}
          updateGraph={updateGraph}
        />
      )}
    </div>
  );
};

GraphListHeader.propTypes = {
  graph: PropTypes.object.isRequired,
};

export default React.memo(GraphListHeader);
