import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import Wrapper from '../../components/Wrapper';
import Header from '../../components/Header';
import { getUserRequest } from '../../store/actions/profile';
import { getFriendsRequest } from '../../store/actions/userFriends';
import { getProfile } from '../../store/selectors/profile';
import { getUserFriendsList } from '../../store/selectors/userFriends';
import AddButton from '../search/addFriend';
import { friendType } from '../../data/friend';

const Profile = React.memo((props) => {
  const { userId } = props.match.params;
  const dispatch = useDispatch();
  const profile = useSelector(getProfile);
  const friends = useSelector(getUserFriendsList);
  useEffect(() => {
    dispatch(getUserRequest(userId));
    dispatch(getFriendsRequest(userId));
  }, [dispatch, getUserRequest]);

  return (
    <Wrapper>
      <Header />
      <div className="profile">
        {profile.id && (
          <>
            <h3 className="profile__title">{`Welcome to ${profile.firstName} ${profile.lastName}'s profile page`}</h3>
            <div className="profile__my">
              <article key={profile.id}>
                <img
                  className="profile__avatar"
                  src={profile.avatar}
                  alt={profile.firstName}
                />
                <div className="profile__user">

                  <div className="profile__user-details">
                    <h1>{`${profile.firstName} ${profile.lastName}`}</h1>
                    {/* <div style={{ position: 'absolute', right: '500px' }}>
                      <AddButton user={profile} />
                    </div> */}

                    <span className="email">
                      <strong>Email : </strong> {profile.email}
                    </span>
                    <span className="website">
                      <strong>Website : </strong> {profile.website}
                    </span>
                    <span className="profile__description">
                      <span> <strong>Short description/ bio : </strong>   {profile.bio} </span>
                    </span>

                  </div>
                </div>

              </article>
            </div>
          </>
        )}
        {/* <div className="profile__friends">
          <h4>Friend requests</h4>
          {friends && friends.length ? (
            friends.map((friendship) => {
              const { senderUser } = friendship;
              const userIsSender = senderUser.id === userId;
              const friend = !userIsSender ? friendship.receiverUser : senderUser;

              return (
                friendship.status === friendType.pending && (
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
                )
              );
            })
          ) : null}
        </div> */}
      </div>
    </Wrapper>
  );
});

Profile.propTypes = {
  match: PropTypes.object.isRequired,
};

export default withRouter(Profile);
