import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { getId } from '../../store/selectors/account';
import Button from '../../components/form/Button';
import { AddFriendRequest } from '../../store/actions/userFriends';

const AddFriend = React.memo(({ user }) => {
  const { id } = user;
  const dispatch = useDispatch();
  const loggedInUserId = useSelector(getId);

  return loggedInUserId !== id ? <Button onClick={() => dispatch(AddFriendRequest({ receiverUserId: id }))}>connect</Button> : null;
});

AddFriend.propTypes = {
  user: PropTypes.object.isRequired,
};

export default AddFriend;
