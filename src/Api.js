import axios from 'axios';
import { stringify as qs } from 'query-string';
import fileDownload from 'js-file-download';
import { serialize } from 'object-to-formdata';
import Account from './helpers/Account';

const { REACT_APP_URL } = process.env;
const urls = [
  'http://api.analysed.ai',
  'http://localhost:5000',
  'https://graphs-backend.ghost-services.com',
];
const apiUrl = urls[REACT_APP_URL] || urls[0];

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

  static toFormData(data) {
    return serialize({ ...data }, { indices: true });
  }

  static singIn(email, password) {
    return api.post('/users/sign-in', { email, password });
  }

  static singUp(data) {
    return api.post('/users/sign-up', data);
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
}

export default Api;
