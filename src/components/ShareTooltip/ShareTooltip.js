import React, { useEffect, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getGraphUsers } from '../../store/selectors/shareGraphs';
import { graphUsersRequest } from '../../store/actions/shareGraphs';
import Tooltip from 'rc-tooltip/es';
import ShareTooltipContent from './ShareTooltipContent';
import { ReactComponent as ShareSvg } from '../../assets/images/icons/share.svg';


const TootlipContent = ({ user, role, isOwner }) => (
    <Suspense fallback={<div>Loading...</div>}>
        <ShareTooltipContent user={user} role={role} isOwner={isOwner} />
    </Suspense>
);
TootlipContent.propTypes = {
    graphId: PropTypes.object.isRequired,
};
const ShareTooltip = React.memo(({ graphId, graphOwner, isOwner }) => {
    const graphUsers = useSelector(getGraphUsers)[graphId];


    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(graphUsersRequest({ graphId }));
    }, [dispatch, graphId]);
    if (graphOwner === undefined) {
        return false;
    }

    const count = graphUsers && Object.keys(graphUsers) && Object.keys(graphUsers).length;
    const countOwner = isOwner ? 1 : 0;

    return (

        <div className="contributors-container">
            <p className="h4 mb-3 title"> {isOwner ? `Contributors:` : `Shared with : `}
                {count ? (
                    <span className="counter"> { count + countOwner} </span>
                ) : null}
            </p>
            <ul className="list-style-none d-flex flex-wrap mb-n2">

                {isOwner && (
                    <Link to={`/profile/${graphOwner.id}`} target="_blank">
                        <li className="mb-2 mr-2">
                            <Tooltip overlay={<TootlipContent user={graphOwner} role='Owner' />} trigger={['hover']} >
                                 
                                    <img className="avatar-user d-block" src={graphOwner.avatar} alt="" />
                                    {/* <img icon="fa-star" className=" edit" /> */}
                                
                            </Tooltip>

                        </li>
                    </Link>
                )}

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
