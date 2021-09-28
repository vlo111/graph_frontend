import React, {
  useEffect, Suspense, useState,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip/es';
import { ReactComponent as ShareSvg } from '../../assets/images/icons/shareGraph.svg';
import { ReactComponent as CommentSvg } from '../../assets/images/icons/commentGraph.svg';
import { ReactComponent as ViewPassSvg } from '../../assets/images/icons/viewGraph.svg';
import { getActionsCount } from '../../store/selectors/graphs';
import { getActionsCountRequest } from '../../store/actions/graphs';
import Button from '../form/Button';
import ShareTooltip from '../Contributors/ShareTooltip';
import CommentModal from '../CommentModal';
import EmbedButton from '../embed/EmbedButton';

const TooltipContent = ({ graphId, graphOwner }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <ShareTooltip graphId={graphId} graphOwner={graphOwner}/>
  </Suspense>
);
TooltipContent.propTypes = {
  graphId: PropTypes.number.isRequired,
};

const GraphListFooter = ({ graph }) => {
  const actionsCountAll = useSelector(getActionsCount);
  const actionsCount = actionsCountAll[graph.id];
  const dispatch = useDispatch();
  const [openCommentModal, setOpenCommentModal] = useState(false);

  useEffect(() => {
    if (graph.id) {
      dispatch(getActionsCountRequest(graph.id));
    }
  }, [dispatch, graph.id]);
  return (
    <div className="graphListFooter">
      {/* <Button icon={<HeartSvg />} className="transparent footer-icon"> */}
      {/*  <span className="graphListFooter__count">{actionsCount?.likes}</span> */}
      {/* </Button> */}
      <Button
        icon={<CommentSvg />}
        className="transparent footer-icon"
        onClick={() => setOpenCommentModal(true)}
      >
        <span className="graphListFooter__count">{actionsCount?.comments}</span>
      </Button>
      <Button icon={<ViewPassSvg />} className="transparent footer-icon">
        <span className="graphListFooter__count">{graph?.views || 0}</span>
      </Button>
      {actionsCount?.shares
        ? (
          <Tooltip  overlay={<TooltipContent graphId={graph.id}  graphOwner={graph.user} />} trigger={['click']}  placement={["topLeft"]} id="tooltipPoupap" >
            <Button icon={<ShareSvg />} className="transparent footer-icon">
              <span className="graphListFooter__count">{actionsCount?.shares}</span>
            </Button>
          </Tooltip>
        )
        : (
          <Button icon={<ShareSvg />} className="transparent footer-icon">
            <span className="graphListFooter__count">{actionsCount?.shares}</span>
          </Button>
        )}
      {openCommentModal && (
        <CommentModal
          closeModal={() => setOpenCommentModal(false)}
          graph={graph}
        />
      )}
      <EmbedButton graph={graph} />
    </div>
  );
};

GraphListFooter.propTypes = {
  graph: PropTypes.object.isRequired,
};

export default React.memo(GraphListFooter);
