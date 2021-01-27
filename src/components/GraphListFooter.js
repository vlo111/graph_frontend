import React, {
  useEffect, Suspense, useState,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip/es';
import { ReactComponent as ShareSvg } from '../assets/images/icons/share.svg';
import { ReactComponent as CommentSvg } from '../assets/images/icons/comment.svg';
import { ReactComponent as ViewPassSvg } from '../assets/images/icons/view.svg';
import { getActionsCount } from '../store/selectors/graphs';
import { getActionsCountRequest } from '../store/actions/graphs';
import Button from './form/Button';
import ShareTooltip from './ShareTooltip/ShareTooltip';
import CommentModal from './CommentModal';
import EmbedButton from './embed/EmbedButton';

const TootlipContent = ({ graphId, graphOwner }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <ShareTooltip graphId={graphId} graphOwner={graphOwner}/>
  </Suspense>
);
TootlipContent.propTypes = {
  graphId: PropTypes.object.isRequired,
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
          <Tooltip overlay={<TootlipContent graphId={graph.id}  graphOwner={graph.user} />} trigger={['hover']}>
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
