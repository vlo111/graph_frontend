import React from 'react';
import ChartUtils from '../../helpers/ChartUtils';

const ShareTooltipContent = React.memo(({ user, role, type, objectId }) => {

    const findLabelInDom = ( id ) => {
    
         ChartUtils.findLabelInDom(id);
    }
    return (
        <div className="contributors-container">
            <article key={user.id} className="tooltiptext">

                <img
                    className="avatar"
                    src={user.avatar}
                    alt={user.firstName}
                />
                <div className="info">
                    <div class="username">{`${user.firstName} ${user.lastName}`}</div>
                    <div class="role">Shared  -  { !!(objectId) ? (<a className="tooltipLabel" onClick={() => findLabelInDom(objectId)}>{type}</a>) : ( type )}</div>
                    <div class="role">Role  -  {role}</div>
                    <div class="email">{user.email}</div>
                </div>

            </article>

        </div>
    )
});


export default ShareTooltipContent;