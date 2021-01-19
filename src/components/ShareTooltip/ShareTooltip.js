import React, { useEffect, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getGraphUsers } from '../../store/selectors/shareGraphs';
import { graphUsersRequest } from '../../store/actions/shareGraphs';
import Tooltip from 'rc-tooltip/es';
import ShareTooltipContent from './ShareTooltipContent';


const TootlipContent = ({ user, role }) => (
    <Suspense fallback={<div>Loading...</div>}>
        <ShareTooltipContent user={user} role={role} />
    </Suspense>
);
TootlipContent.propTypes = {
    graphId: PropTypes.object.isRequired,
};
const ShareTooltip = React.memo(({ graphId, graphOwner }) => {
    const graphUsers = useSelector(getGraphUsers)[graphId];


    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(graphUsersRequest({ graphId }));
    }, [dispatch, graphId]); 
    if (graphOwner === undefined) {
        return false;
    } 
    return (

        <div className="contributors-container">
            <hr />
            <p className="h4 mb-3 title b"> Contributors </p>
           
            <ul className="list-style-none d-flex flex-wrap mb-n2">
                <Link to={`/profile/${graphOwner.id}`} target="_blank">
                    <li className="mb-2 mr-2"> 
                        <Tooltip overlay={<TootlipContent user={graphOwner} role='Owner' />} trigger={['hover']}>
                            <img className="avatar-user d-block" src={graphOwner.avatar} alt="" />
                        </Tooltip>

                    </li>
                </Link>
            </ul>
            <hr />
            <ul className="list-style-none d-flex flex-wrap mb-n2">

                {
                    graphUsers && graphUsers.map(item =>
                        <Link to={`/profile/${item.user.id}`} target="_blank">

                            <li className="mb-2 mr-2">
                                <Tooltip overlay={<TootlipContent user={item.user} role={item.role} />} trigger={['hover']}>
                                    <img className="avatar-user d-block" src={item.user.avatar} alt="" />
                                </Tooltip>

                            </li>
                        </Link>
                    )
                }


            </ul>
        </div>
    )
});

ShareTooltip.propTypes = {
    graphId: PropTypes.number.isRequired,
}

export default ShareTooltip;