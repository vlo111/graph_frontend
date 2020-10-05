import React, { useEffect, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip/es';
import { ReactComponent as ShareSvg } from '../assets/images/icons/share.svg';
import { ReactComponent as CommentSvg } from '../assets/images/icons/comment.svg';
import { ReactComponent as ViewPassSvg } from '../assets/images/icons/view.svg';
import { ReactComponent as HeartSvg } from '../assets/images/icons/heart.svg';
import { getActionsCount, getGraphsList, getSingleGraph } from '../store/selectors/graphs';
import { getActionsCountRequest } from '../store/actions/graphs';
import Button from './form/Button';
import ShareTooltip from './ShareTooltip';

const TootlipContent = ({ graphId }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <ShareTooltip graphId={graphId} />
  </Suspense>
);
TootlipContent.propTypes = {
  graphId: PropTypes.object.isRequired,
};

const GraphListFooter = ({ graph }) => {
  const actionsCountAll = useSelector(getActionsCount);
  const actionsCount = actionsCountAll[graph.id];
  const dispatch = useDispatch();

  useEffect(() => {
    if (graph.id) {
      dispatch(getActionsCountRequest(graph.id));
    }
  }, [dispatch, graph.id]);
  return (
    <div className="graphListFooter">
      <Button icon={<HeartSvg style={{ height: 14 }} />} className="transparent footer-icon">
        <span className="graphListFooter__count">{actionsCount?.likes}</span>
      </Button>
      <Button icon={<CommentSvg style={{ height: 14, color: 'red' }} />} className="transparent footer-icon">
        <span className="graphListFooter__count">{actionsCount?.comments}</span>
      </Button>
      <Button icon={<ViewPassSvg style={{ height: 14 }} />} className="transparent footer-icon">
        <span className="graphListFooter__count">{graph?.views || 0}</span>
      </Button>
      {actionsCount?.shares
        ? (
          <Tooltip overlay={<TootlipContent graphId={graph.id} />} trigger={['hover']}>
            <Button icon={<ShareSvg style={{ height: 14 }} />} className="transparent footer-icon">
              <span className="graphListFooter__count">{actionsCount?.shares}</span>
            </Button>
          </Tooltip>
        )
        : (
          <Button icon={<ShareSvg style={{ height: 14 }} />} className="transparent footer-icon">
            <span className="graphListFooter__count">{actionsCount?.shares}</span>
          </Button>
)}
    </div>
  );
};

GraphListFooter.propTypes = {
  graph: PropTypes.object.isRequired,
};

export default React.memo(GraphListFooter);
