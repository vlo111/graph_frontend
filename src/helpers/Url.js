import queryString from 'query-string';

class Url {
  constructor() {
    this.query = queryString.parse(window.location.search);
    return this;
  }

  static replace(query = window.location.search) {
    return queryString.parse(query);
  }

  static queryStringify(queryObj) {
    return queryString.parse(window.location.search);
  }
}

export default Url;
