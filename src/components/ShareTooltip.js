import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { getGraphUsers } from '../store/selectors/shareGraphs';
import { graphUsersRequest } from '../store/actions/shareGraphs';

const ShareTooltip = React.memo(({ graphId }) => {
    const graphUsers = useSelector(getGraphUsers)[graphId];
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(graphUsersRequest({graphId}));
    }, [dispatch, graphId]);

return <div style={{ display: 'flex', flexDirection: 'column' }}>{graphUsers && graphUsers.map(item => <div>{item}</div>)}</div>
});

ShareTooltip.propTypes = {
    graphId: PropTypes.number.isRequired,
}

export default ShareTooltip;