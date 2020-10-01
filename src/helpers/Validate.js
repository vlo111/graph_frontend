import _ from 'lodash';
import Chart from '../Chart';
import CustomFields from "./CustomFields";

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

  static nodeLocation(val) {
    if (!val) {
      return [null, undefined];
    }
    let value = val;
    let error = null;
    if (_.isString(val)) {
      value = value.split(',');
    }
    if (!value[0] && !value[1]) {
      return [null, undefined];
    }
    if (!value[0] || !value[1]) {
      error = 'Invalid location';
    }
    return [error, value.join(',')];
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

  static customFieldType(val, nodeType, customFields) {
    const value = (val || '').trim();
    let error;
    if (!value) {
      error = 'Field is required';
    } else if (customFields[nodeType] && customFields[nodeType][val]) {
      error = 'Field already exists';
    } else if (!CustomFields.canAddKey(customFields, nodeType)) {
      error = 'You can\'t add more tabs';
    }
    return [error, value];
  }

  static customFieldContent(val) {
    const value = (val || '').trim();
    let error;
    if (!value) {
      error = 'Field is required';
    }
    return [error, value];
  }

  static customFieldSubtitle(val) {
    const value = (val || '').trim();
    return [null, value];
  }

  static labelName(val) {
    const value = (val || '').trim();
    return [null, value];
  }
}

export default Validate;
