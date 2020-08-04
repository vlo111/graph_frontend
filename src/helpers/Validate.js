import _ from 'lodash';
import Chart from '../Chart';

class Validate {
  static nodeName(val = '') {
    const value = val.trim();
    let error = null;
    const nodes = Chart.getNodes();
    if (!value) {
      error = 'Name is required';
    } else if (nodes.some((d) => d.name === value)) {
      error = 'Already exists';
    }
    return [error, value];
  }

  static nodeType(val = '') {
    const value = val.trim();
    let error = null;
    if (!value) {
      error = 'Type is required';
    }
    return [error, value];
  }

  static linkType(val = '', source, target) {
    const value = val.trim();
    const links = Chart.getLinks();

    let error = null;
    if (!value) {
      error = 'Type is required';
    } else if (links.find((d) => source === d.source && target === d.target && value === d.type)) {
      error = 'Already exists';
    }

    return [error, value];
  }

  static linkValue(val) {
    const value = +val;
    let error = null;
    if (value < 1) {
      error = 'Value can\'t be less than 1';
    } else if (value > 15) {
      error = 'Value can\'t be more than 15';
    }
    return [error, value];
  }

  static node(key, value) {
    switch (key) {

      default: {
        return [null, value];
      }
    }
  }

  static link(key, value) {
    switch (key) {

      default: {
        return [null, value];
      }
    }
  }

  static hasError(errors) {
    return _.some(errors, (e) => e);
  }
}

export default Validate;
