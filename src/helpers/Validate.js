import _ from 'lodash';
import Chart from '../Chart';

class Validate {
  static nodeName(val, edit) {
    const value = (val || '').trim();
    let error = null;
    const nodes = Chart.getNodes();
    if (!value) {
      error = 'Name is required';
    } else if (!edit && nodes.some((d) => d.name === value)) {
      error = 'Already exists';
    }
    return [error, value];
  }

  static nodeType(val) {
    const value = (val || '').trim();
    let error = null;
    if (!value) {
      error = 'Type is required';
    }
    return [error, value];
  }

  static linkType(val, source, target) {
    let value = (val || '').trim();
    const links = Chart.getLinks();

    let error = null;
    if (!value) {
      error = 'Type is required';
    } else if (links.find((d) => source === d.source && target === d.target && value === d.type)) {
      error = 'Already exists';
      value = '';
    }

    return [error, value];
  }

  static linkValue(val) {
    let value = +val;
    let error = null;
    if (value < 1) {
      error = 'Value can\'t be less than 1';
      value = 1;
    } else if (value > 15) {
      error = 'Value can\'t be more than 15';
      value = 15;
    }
    return [error, value];
  }

  static node(key, value) {
    switch (key) {
      case 'name': {
        return this.nodeName(value);
      }
      case 'type': {
        return this.nodeType(value);
      }
      default: {
        return [null, value];
      }
    }
  }

  static link(key, value) {
    switch (key) {
      case 'value': {
        return this.linkValue(value);
      }
      case 'type': {
        return this.linkType(value);
      }
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
