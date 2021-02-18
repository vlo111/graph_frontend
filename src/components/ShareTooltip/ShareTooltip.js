import React, { useEffect, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getGraphUsers } from '../../store/selectors/shareGraphs';
import { graphUsersRequest } from '../../store/actions/shareGraphs';
import { getOnlineUsersRequest } from '../../store/actions/app';
import { getOnlineUsers } from '../../store/selectors/app';
import { getId } from '../../store/selectors/account'; 
import { getSingleGraphOwner } from '../../store/selectors/graphs'; 
import Tooltip from 'rc-tooltip/es';
import ShareTooltipContent from './ShareTooltipContent'; 
 
const TootlipContent = ({ user, role, type , isOwner }) => (
    <Suspense fallback={<div>Loading...</div>}>
        <ShareTooltipContent user={user} role={role} type={type} isOwner={isOwner} />
    </Suspense>
);
TootlipContent.propTypes = {
    user: PropTypes.object.isRequired,
};
const ShareTooltip = React.memo(({ graphId, graphOwner, isOwner }) => { 
    const userId = useSelector(getId);
    const graphUsers = useSelector(getGraphUsers)[graphId]; 
    const onlineUser = useSelector(getOnlineUsers);  
    const ownerUserId = useSelector(getSingleGraphOwner);  
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(graphUsersRequest({ graphId })); 
    }, [dispatch, graphId]);

    useEffect(() => { 
        dispatch(getOnlineUsersRequest());
    }, [dispatch]);

    if (graphOwner === undefined) {
        return false;
    }

    const count = graphUsers && Object.keys(graphUsers) && Object.keys(graphUsers).length;
    const countOwner = isOwner ? 1 : 0; 
    const isLabelShare =  graphUsers && graphUsers.some((n) => n.type === 'label' && n.userId === userId ); 
    return (

        <div className="contributors-container">
            <p className="h4 mb-3 title"> {isOwner ? `Contributors:` : `Shared with : `}
                {count &&  !isLabelShare ? (
                    <span className="counter"> { count + countOwner} </span>
                ) : null}
            </p>
            <ul className="list-style-none d-flex flex-wrap mb-n2">

                {isOwner && (
                    <Link to={`/profile/${graphOwner.id}`} target="_blank">

                        <li className="mb-2 mr-2" key= '0' >
                            <Tooltip overlay={<TootlipContent user={graphOwner} role='Owner' type='graph' />} trigger={['hover']} > 
                            <div className="icon-container">                                   
                                        <img className="avatar-user d-block" src={graphOwner.avatar} alt="" />
                                        { onlineUser && onlineUser.some((n) => n.userId === graphOwner.id ) ? (   
                                        <div class="status-online ">
                                             { onlineUser && onlineUser.some((n) => (n.userId === graphOwner.id && n.activeGraphId === parseInt(graphId, 10))) ? (
                                                <div class="status-in-graph "></div>
                                             ): ''}                                            
                                        </div>
                                        ) : ''}
                                    </div>                        
                            </Tooltip>

                        </li>
                    </Link>
                )} 
                 { !isLabelShare && (
                     graphUsers && graphUsers.map((item, index) =>  
                        <Link to={`/profile/${item.user.id}`} target="_blank" key={index.toString()}>
                        <li className="mb-2 mr-2 "  key={index.toString()} >
                            <Tooltip overlay={<TootlipContent user={item.user} role={item.role} type={item.type} />} trigger={['hover']}>
                                <div className="icon-container">                                   
                                    <img className="avatar-user d-block" src={item.user.avatar} alt={item.user.id} />
                                    { onlineUser && onlineUser.some((n) => n.userId === item.user.id ) ? (   
                                    <div class="status-online ">
                                        { onlineUser && onlineUser.some((n) => n.userId === item.user.id && n.activeGraphId === parseInt(graphId, 10)) ? (
                                            <div class="status-in-graph "></div>
                                        ): ''}                                            
                                    </div>
                                    ) : ''}
                                </div>
                            </Tooltip>
                        </li>
                    </Link>
                    ))}
            </ul>
        </div>
    )
});
export default ShareTooltip;
