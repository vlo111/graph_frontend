import axios from 'axios';
// import { stringify as qs } from 'query-string';
import Account from './helpers/Account';

const { REACT_APP_DEV } = process.env;
const apiUrl = REACT_APP_DEV ? 'http://localhost:5000' : 'http://localhost:5000';

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Account.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));


class Api {
  static url = apiUrl;

  static singIn(email, password) {
    return api.post('/users/sign-in', { email, password });
  }

  static singUp(data) {
    return api.post('/users/sign-up', data);
  }
}

export default Api;
