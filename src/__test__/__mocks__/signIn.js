import Api from '../../Api';

const user = async (email, password) => {
  const { data: { status } } = await Api.singIn(email, password);

  return status;
};

module.exports = user;
