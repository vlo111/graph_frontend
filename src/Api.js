import axios from 'axios';
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

  static #cancelSource = [];

  static #cancel = (key) => {
    if (this.#cancelSource[key]) {
      this.#cancelSource[key].cancel('Operation canceled by the user.');
    }
    const source = axios.CancelToken.source();
    this.#cancelSource[key] = source;
    return source.token;
  }

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

  static convertToGraph(type, requestData) {
    return api.post(`/convert/${type}/to/graph`, this.toFormData(requestData));
  }

  static convertToNode(type, requestData) {
    return api.post(`/convert/${type}/to/node`, this.toFormData(requestData));
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
    const params = { page, ...requestData };
    return api.get('/graphs', { params });
  }

  static getSingleGraph(getSingleGraph) {
    return api.get(`/graphs/single/${getSingleGraph}`);
  }

  static oAuth(type, params) {
    const version = type === 'twitter' ? 'v1' : 'v2';
    return api.get(`/users/oauth/${version}/redirect/${type}`, { params });
  }

  static getTwitterToken(params) {
    return api.get('/users/oauth/v1/token/twitter', { params });
  }

  static getContentType(url) {
    return api.get('/helpers/content-type', {
      params: { url },
      cancelToken: this.#cancel('getContentType'),
    });
  }

  static getUsersByText(text) {
    return api.get('/users/get-by-text', { params: { text } });
  }

  static createShareGraph(requestData) {
    return api.post('/share-graphs/create', requestData);
  }

  static updateShareGraph(id, requestData) {
    return api.put(`/share-graphs/update/${id}`, requestData);
  }

  static deleteShareGraph(id) {
    return api.delete(`/share-graphs/delete/${id}`);
  }

  static listShareGraph(requestData) {
    return api.post('/share-graphs/list/', requestData);
  }

  static userGraph() {
    return api.get('/share-graphs/user-graphs');
  }
}

export default Api;
