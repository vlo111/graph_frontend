import axios from 'axios';
import { stringify as qs } from 'query-string';
import fileDownload from 'js-file-download';
import { serialize } from 'object-to-formdata';
import Account from './helpers/Account';

const { REACT_APP_API_URL } = process.env;

const api = axios.create({
  baseURL: REACT_APP_API_URL,
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
  static url = REACT_APP_API_URL;

  static toFormData(data) {
    return serialize({ ...data }, { indices: true });
  }

  static singIn(email, password) {
    return api.post('/users/sign-in', { email, password });
  }

  static singUp(data) {
    return api.post('/users/sign-up', data);
  }

  static forgotPassword(email, callback) {
    return api.post('/users/forgot-password', { email, callback });
  }

  static resetPassword(token, password) {
    return api.post('/users/reset-password', { token, password });
  }

  static getMyAccount() {
    return api.get('/users/me');
  }

  static async download(type, requestData) {
    const { data, headers } = await api.post(`/convert/graph/to/${type}`, requestData, {
      responseType: 'arraybuffer',
    });
    const [, fileName] = headers['content-disposition'].match(/\sfilename=([^;]+)/i);
    fileDownload(data, fileName);
  }

  static convert(type, requestData) {
    return api.post(`/convert/${type}/to/graph`, this.toFormData(requestData));
  }

  static createGraph(requestData) {
    return api.post('/graphs/create', requestData);
  }

  static updateGraph(id, requestData) {
    return api.put(`/graphs/update/${id}`, requestData);
  }

  static deleteGraph(id) {
    return api.delete(`/graphs/delete/${id}`);
  }

  static updateGraphThumbnail(id, svg) {
    return api.patch(`/graphs/thumbnail/${id}`, { svg });
  }

  static getGraphsList(page, requestData = {}) {
    const query = qs({
      page,
      ...requestData,
    });
    return api.get(`/graphs?${query}`);
  }

  static getSingleGraph(getSingleGraph) {
    return api.get(`/graphs/single/${getSingleGraph}`);
  }

  static oAuthV2(type, params) {
    const query = qs(params);
    return api.get(`/users/oauth/v2/redirect/${type}?${query}`);
  }
}

export default Api;
