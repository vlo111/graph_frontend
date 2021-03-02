import React, { useEffect, Suspense, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Tooltip from 'rc-tooltip/es';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
 import { getGraphUsers } from '../../store/selectors/shareGraphs';
 import { graphUsersRequest, updateGraphRequest, updateShareGraphStatusRequest } from '../../store/actions/shareGraphs';
import { getOnlineUsersRequest } from '../../store/actions/app';
import { getOnlineUsers } from '../../store/selectors/app';
 import { getId } from '../../store/selectors/account';   
import ShareTooltipContent from './ShareTooltipContent';  

const TootlipContent = ({ user, role, type , isOwner, objectId  }) => (
    <Suspense fallback={<div>Loading...</div>}>
        <ShareTooltipContent user={user} role={role} type={type} isOwner={isOwner} objectId= {objectId} />
    </Suspense>
);
TootlipContent.propTypes = {
    user: PropTypes.object.isRequired, 
};
const ShareTooltip = React.memo(({ graphId, graphOwner, isOwner }) => { 
    const userId = useSelector(getId);
    const graphUsers = useSelector(getGraphUsers)[graphId]; 
    const onlineUser = useSelector(getOnlineUsers);      
    const dispatch = useDispatch();
    const [owner, setOwner] = useState(false); 
    const [dragRole, setDragRole] = useState();
    const [dropId, setDropId] = useState();
    const [showMore, setShowMore] = useState(false);
    const [limit, setLimit] = useState(3);
 

    useEffect(() => {  
        if(graphId){
            dispatch(graphUsersRequest({ graphId }));    
        }  
        dispatch(getOnlineUsersRequest());
    }, [dispatch, graphId]);
 
    if (graphOwner === undefined) {
        return false;
    }

    const count = graphUsers && Object.keys(graphUsers) && Object.keys(graphUsers).length;
    const countOwner = isOwner ? 1 : 0; 
    const isLabelShare =  graphUsers && graphUsers.some((n) => n.type === 'label' && n.userId === userId ); 
    const graphUsersList =  isLabelShare ? graphUsers.filter((n) => n.type === 'label' && n.userId === userId ) : graphUsers ; 
 
    /**
     * 
     * @param {*} e 
     * @param {*} id 
     * @param {*} role 
     */
    const handleDragStart = (e, id, role ) => { 
       
    	if(graphOwner.id === userId){
             setOwner(true); 
        }
    	setDropId(id);
        setDragRole(role); 
	}
    /**
     * 
     * @param {*} e 
     */
    const handleDragOver = (e) => {
	    e.preventDefault();
	} 
    /**
     * 
     * @param {*} e 
     * @param {*} role 
     */
    const handleDrop = (e, role) => {
       
        let newRole = e.currentTarget.id; 
         if( owner && role === dragRole ) { 
            dispatch(updateGraphRequest(dropId, { role: newRole }));
            toast.success(`You have changed permission from ${dragRole} to ${newRole} `); 
            dispatch(updateShareGraphStatusRequest({graphId}));
            
        } 
    } 
    /**
     * show more data
     */
    const handlerShowMore = () => {
        setShowMore(!showMore)
    }
    /**
     * 
     * @param {*} role 
     * return custom role
     */
    const roleTypeForShareTools = (role) => {
        return ['edit', 'edit_inside', 'admin'].includes(role) ?
         'edit' : 'view';
    }
    /**
     * Add new array role data
     */
    let roles = {
        edit: [],
        view: []
      }
      graphUsersList && graphUsersList.forEach ((item, index) => {
        let shareRole  = roleTypeForShareTools(item.role);

        roles[shareRole].push(
            <Link to={`/profile/${item.user.id}`} target="_blank"
            key={index.toString()} 
            draggable
            onDragStart = {(e) => handleDragStart(e, item.id, shareRole)} 
            >
           <li className="mb-2 mr-2 "  key={index.toString()}        >
               <Tooltip overlay={<TootlipContent user={item.user} role={item.role} type={item.type} objectId= {item.objectId} />}  trigger={['click']} >
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
        );
      });
       const allItemsLimit = roles.view.length > roles.edit.length ? (roles.view.length) : (roles.edit.length);
       const numberOfItems = showMore ? allItemsLimit : limit; 
       const subLimitCount = allItemsLimit - numberOfItems;
       console.log(graphUsersList, 'graphUsersList', roles, 'roles');
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

                        <li className="mb-2 mr-2 " key= '0' >
                            <Tooltip overlay={<TootlipContent user={graphOwner} role='Owner' type='graph' objectId = {null} />} trigger={['hover']} > 
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
                </ul>
                <ul className={"list-style-none d-flex flex-wrap mb-n2 groups " +  (showMore ? " scrollY" : " ")}> 
                <div id="edit" className="group" 
                  onDragOver={(e)=>handleDragOver(e)}
                  onDrop={(e)=>{handleDrop(e, "view")}}
                >
                <span className="group-header">Edit</span>                
                   {roles.edit.slice(0, numberOfItems)} 
                </div>
                <div id="view" className="group"
                  onDragOver={(e)=>handleDragOver(e)}
                  onDrop={(e)=>{handleDrop(e, "edit")}}
                >
                <span className="group-header">View</span>
                   {roles.view.slice(0, numberOfItems)}
                </div>  
            </ul>
             {!isLabelShare && subLimitCount >= 0 ? (
              <a className="more" onClick={handlerShowMore}> {showMore ? '- Less' : ( subLimitCount > 0 ? `+ ${subLimitCount}` : '')}</a>
             ) : null} 
        </div>
        
    )
   
});





export default ShareTooltip;
