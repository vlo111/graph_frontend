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

  static updateMyAccount(data) {
    return api.post('/users/update', this.toFormData(data));
  }

  static updateMyAccountPassword(data) {
    return api.post('/users/update-password', data);
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

  static updateGraphData(id, requestData) {
  return api.put(`/graphs/update-data/${id}`, requestData);
}


  static getActionsCount(id) {
    return api.get(`/graphs/actions-count/${id}`);
  }

  static deleteGraph(id) {
    return api.delete(`/graphs/delete/${id}`);
  }

  static updateGraphThumbnail(id, svg) {
    return api.patch(`/graphs/thumbnail/${id}`, { svg });
  }

  static getGraphsList(page, requestData = {}) {
    const params = { page, ...requestData };
    return api.get('/graphs', {
      params,
      cancelToken: this.#cancel('getGraphsList'),
    });
  }

  static getSingleGraph(graphId) {
    return api.get(`/graphs/single/${graphId}`);
  }

  static getSingleEmbedGraph(graphId, token) {
    return api.get(`/graphs/embed/${graphId}/${token}`);
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

  static graphUsers(requestData) {
    return api.post('/share-graphs/graph-users', requestData);
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

  static updateShareGraphStatus(requestData) {
    return api.post('/share-graphs/update-status/', requestData);
  }

  static createCommentGraph(requestData) {
    return api.post('/comment-graphs/create', requestData);
  }

  static graphComments(requestData) {
    return api.get('/comment-graphs/comments', { params: requestData });
  }

  static userGraph() {
    return api.get('/share-graphs/user-graphs');
  }

  static listNotifications() {
    return api.get('/notifications/list');
  }

  static notificationsUpdate() {
    return api.get('/notifications/update');
  }

  static getWikipediaInfo(search) {
    return api.get('/helpers/wikipedia', {
      params: { search },
    });
  }

  static getFriends() {
    return api.get('/user-friends');
  }

  static addFriend(requestData) {
    return api.post('/user-friends/add', requestData);
  }

  static cancelFriend(requestData, id) {
    return api.put(`/user-friends/cancel/${id}`, requestData);
  }

  static acceptFriend(requestData, id) {
    return api.put(`/user-friends/accept/${id}`, requestData);
  }

  static rejectFriend(requestData) {
    return api.put('/user-friends/reject', requestData);
  }

  static removeFriend(id) {
    return api.put(`/user-friends/remove/${id}`);
  }

  static myFriends() {
    return api.get('/user-friends/my-friends');
  }
}

export default Api;
