import React, {
  useMemo, useCallback, useContext, useEffect,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import find from 'lodash/find';
import { getId } from '../../store/selectors/account';
import Button from '../../components/form/Button';
import Select from '../../components/form/Select';
import {
  AddFriendRequest, removeFriendRequest, acceptFriendRequest,
} from '../../store/actions/userFriends';
import { friendsList } from '../../store/selectors/userFriends';

const selectOptions = [
  { value: 'accept', label: 'Accept' },
  { value: 'reject', label: 'Reject' },
];

const AddFriend = React.memo(({ user }) => {
  const { id } = user;
  const dispatch = useDispatch();
  const loggedInUserId = useSelector(getId);
  const myFriends = useSelector(friendsList);

  const selectAction = useCallback(
    async (action, actionUserId) => {
      if (action.value === 'accept') {
        await dispatch(acceptFriendRequest({ receiverUserId: id }, actionUserId));
      } else {
        await dispatch(removeFriendRequest(actionUserId));
      }
    },
    [dispatch],
  );

  const getButtonClick = useMemo(() => {
    const matchUser = find(myFriends, (it) => it.friendUserId === id);
    if (matchUser) {
      switch (matchUser.status) {
        case 'pending':
          if (matchUser.isSender) {
            return <Button onClick={() => dispatch(removeFriendRequest(matchUser.id))}>Cancel</Button>;
          }
          return (
            <Select
              options={selectOptions}
              onChange={(action) => selectAction(action, matchUser.id)}
            />
          );
        case 'accepted':
          return <Button onClick={() => dispatch(removeFriendRequest(matchUser.id))}>Remove</Button>;
        case 'rejected':
          return <Button onClick={() => dispatch(AddFriendRequest({ receiverUserId: id }))}>Connect</Button>;
        default:
          return <Button onClick={() => dispatch(AddFriendRequest({ receiverUserId: id }))}>Connect</Button>;
      }
    }
    return <Button onClick={() => dispatch(AddFriendRequest({ receiverUserId: id }))}>Connect</Button>;
  }, [dispatch, selectAction, myFriends]);

  return loggedInUserId !== id ? getButtonClick : null;
});

AddFriend.propTypes = {
  user: PropTypes.object.isRequired,
};

export default AddFriend;
