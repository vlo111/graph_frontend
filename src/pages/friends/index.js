import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Wrapper from '../../components/Wrapper';
import Header from '../../components/Header';
import { getUserFriendsList } from '../../store/selectors/userFriends';
import { getFriendsRequest, myFriendsRequest } from '../../store/actions/userFriends';
import { getId } from '../../store/selectors/account';
import AddButton from '../search/addFriend';

const Search = React.memo(() => {
  const dispatch = useDispatch();
  const friends = useSelector(getUserFriendsList);
  const userId = useSelector(getId);

  useEffect(() => {
    dispatch(myFriendsRequest());
  }, [dispatch, myFriendsRequest]);

  useEffect(() => {
    dispatch(getFriendsRequest());
  }, [dispatch]);

  return (
    <Wrapper>
      <Header />
      <div className="friends-list">
        <h3>{ `Found ${friends.length} ${friends.length > 1 ? 'People' : 'Person'}`}</h3>
        {friends && friends.length ? (
          friends.map((friendship) => {
            const { senderUser } = friendship;
            const userIsSender = senderUser.id === userId;
            const friend = !userIsSender ? senderUser : friendship.receiverUser;

            return (
              <article key={friend.id} className="searchData__graph">
                <div className="searchData__graphInfo">
                  <img
                    className="avatar"
                    src={friend.avatar}
                    alt={friend.firstName}
                  />
                  <div className="searchData__graphInfo-details">
                    <Link to={`/user/preview/${friend.id}`}>
                      {`${friend.firstName} ${friend.lastName}`}
                    </Link>
                    <span className="description">
                      {friend.email}
                    </span>
                  </div>
                </div>
                <AddButton user={friend} />
              </article>
            );
          })
        ) : 'No Person Found'}
      </div>
    </Wrapper>
  );
});

export default Search;
