import React, { useEffect, useState } from 'react';
import Api from '../../Api';

function UserConfirmation(props) {
  const { match: { params: { token } } } = props;

  const [status, setstatus] = useState('');

  useEffect(async () => {
    const { data: { status } } = await Api.confirmEmail(token);

    if (status === 'ok') {
      setstatus(status);
      props.history.replace('/');
    }
    // else {
    //   props.history.replace('/');
    // }
  });
  return (
    status === 'ok' ? (
      <div>
        <h2>You are successfully confirmed</h2>
      </div>
    ) : <></>
  );
}

export default UserConfirmation;

