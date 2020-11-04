import React, { useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import AddFriend from '../addFriend';
import { getUserSearch } from '../../../store/selectors/account';
import { getUsersByTextRequest } from '../../../store/actions/account';
import { myFriendsRequest } from '../../../store/actions/userFriends';

const Users = React.memo(({ setLimit }) => {
  const dispatch = useDispatch();
  const useSearch = useSelector(getUserSearch);
  const { page = 1, s: searchParam } = queryString.parse(window.location.search);

  useEffect(() => {
    dispatch(getUsersByTextRequest(searchParam));
  }, [dispatch, searchParam]);

  useEffect(() => {
    dispatch(myFriendsRequest());
  }, [dispatch, myFriendsRequest]);

  return (
    <Suspense fallback={<div>Loading users...</div>}>
      {useSearch && useSearch.length ? (
        <div className="searchData__wrapper">
          <h3>{ `${useSearch.length > 1 ? 'People' : 'Person'}`}</h3>
          {useSearch.slice(0, 5).map((user) => (
            <article key={user.id} className="searchData__graph">
              <div className="searchData__graphInfo">
                <img
                  className="avatar"
                  src={user.avatar}
                  alt={user.firstName}
                />
                <div className="searchData__graphInfo-details">
                  <Link to={`/user/preview/${user.id}`}>
                    {`${user.firstName} ${user.lastName}`}
                  </Link>
                  <span className="description">
                    {user.email}
                  </span>
                </div>
              </div>
              <div>
                <AddFriend user={user} />
              </div>
            </article>
          ))}
          {
            setLimit && useSearch.length > 5
            && <div className="viewAll"><Link to={`search-people?s=${searchParam}`}>View all</Link></div>
          }
        </div>
      ) : ((!setLimit && <h3>No User Found</h3>) || null)}
    </Suspense>
  );
});

Users.propTypes = {
  setLimit: PropTypes.bool.isRequired,
};

Users.defaultProp = {
  setLimit: false,
};

export default Users;
