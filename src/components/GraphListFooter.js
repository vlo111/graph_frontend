import React, { useEffect, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip/es';
import { ReactComponent as ShareSvg } from '../assets/images/icons/share.svg';
import { ReactComponent as CommentSvg } from '../assets/images/icons/comment.svg';
import { ReactComponent as ViewPassSvg } from '../assets/images/icons/view.svg';
import { ReactComponent as HeartSvg } from '../assets/images/icons/heart.svg';
import { getActionsCount } from '../store/selectors/graphs';
import { getActionsCountRequest } from '../store/actions/graphs';
import Button from './form/Button';
import ShareTooltip from './ShareTooltip';

const TootlipContent = ({ graphId }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <ShareTooltip graphId={graphId} />
  </Suspense>
);
TootlipContent.propTypes = {
  graphId: PropTypes.number.isRequired,
};

const GraphListFooter = ({ graphId }) => {
  const actionsCountAll = useSelector(getActionsCount);
  const actionsCount = actionsCountAll[graphId];
  const dispatch = useDispatch();

  useEffect(() => {
    if (graphId) {
      dispatch(getActionsCountRequest(graphId));
    }
  }, [dispatch, graphId]);

  return (
    <div className="graphListFooter">
      <Button icon={<HeartSvg style={{ height: 14 }} />} className="transparent footer-icon">
        <span className="graphListFooter__count">{actionsCount?.likes}</span>
      </Button>
      <Button icon={<CommentSvg style={{ height: 14, color: 'red' }} />} className="transparent footer-icon">
        <span className="graphListFooter__count">{actionsCount?.comments}</span>
      </Button>
      <Button icon={<ViewPassSvg style={{ height: 14 }} />} className="transparent footer-icon">
        <span className="graphListFooter__count">{actionsCount?.views}</span>
      </Button>
      {actionsCount?.shares
        ? (
          <Tooltip overlay={<TootlipContent graphId={graphId} />} trigger={['hover']}>
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
  graphId: PropTypes.number.isRequired,
};

export default React.memo(GraphListFooter);
