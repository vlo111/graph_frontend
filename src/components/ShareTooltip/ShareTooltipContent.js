import React from 'react';

const ShareTooltipContent = React.memo(({ user, role, type }) => {
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
                    <div class="role">Shared  -  {type}</div>
                    <div class="role">Role  -  {role}</div>
                    <div class="email">{user.email}</div>
                </div>

            </article>

        </div>
    )
});


export default ShareTooltipContent;