import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip/es';
import Button from './form/Button';
import { ReactComponent as CommentSvg } from '../assets/images/icons/comment.svg';
import CommentModal from './CommentModal';
import { userGraphRequest } from '../store/actions/shareGraphs';
import { getSingleGraph } from '../store/selectors/graphs';

const CommentGraph = ({ setButton }) => {
  const dispatch = useDispatch();
  const [openCommentModal, setOpenCommentModal] = useState(false);
  const singleGraph = useSelector(getSingleGraph);

  const commentGraph = async () => {
    if (window.confirm('Are you sure?')) {
      setOpenCommentModal(true);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    setButton && dispatch(userGraphRequest());
  }, [dispatch, setButton]);

  return (
    <>
      <Tooltip overlay="Comment">
        <Button
          icon={<CommentSvg style={{ height: 30 }} />}
          onClick={commentGraph}
          className="transparent comment"
        />
      </Tooltip>
      {openCommentModal && singleGraph
        && (
          <CommentModal
            closeModal={() => setOpenCommentModal(false)}
          />
        )}
    </>
  );
};

CommentGraph.propTypes = {
  setButton: PropTypes.bool,
};

CommentGraph.defaultProps = {
  setButton: false,
};

export default CommentGraph;
