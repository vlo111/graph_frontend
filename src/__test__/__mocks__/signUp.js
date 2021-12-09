import Api from '../../Api';

const user = async () => {
  const requestData = {
    firstName: 'FTest',
    lastName: 'LTest',
    email: 'wwxxddsa@test.com',
    password: 'Test_test1',
  };

  const { data: { user: createdUser, status } } = await Api.singUp(requestData);

  if (status === 'ok') {
    return { user: createdUser, password: requestData.password };
  }

  return null;
};

module.exports = user;
