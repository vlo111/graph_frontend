import _ from 'lodash';
import Chart from '../Chart';
import CustomFields from './CustomFields';
import ChartUtils from './ChartUtils';

class Validate {
  static nodeName(val, update, nodes = []) {
    const value = (val || '').trim();
    let error = null;
    if (!value) {
      error = 'Name is required';
    } else if (!update && nodes.some((d) => d.name === value)) {
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

  static nodeColor(val, type) {
    const value = (val || '').trim();
    let error = null;
    if (ChartUtils.nodeColorObj[type] !== val && Object.entries(ChartUtils.nodeColorObj).find(([t, c]) => value === c)) {
      error = 'Already exists'; // type with this color already exists
    }
    return [error, value];
  }

  static linkType(val, linkData) {
    let value = (val || '').trim();
    const { source, target, index } = linkData;
    const links = Chart.getLinks();

    let error = null;

    const sameLink = links.find((d) => source === d.source && target === d.target && value === d.type);
    if (!value) {
      error = 'Type is required';
    } else if (sameLink) {
      if (sameLink.index !== index) {
        error = 'Already exists';
        value = '';
      }
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

  static customFieldType(val, node, customField) {
    const customFields = CustomFields.getCustomField(node, Chart.getNodes());
    const value = (val || '').trim();
    let error;
    if (!value) {
      error = 'Field is required';
    } else if (customField.some((f) => f.name === val)) {
      error = 'Field already exists';
    } else if (false) { // todo
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
    const value = (val || '').trim().replace(/"/g, "'");
    let error = null;
    if (!value) {
      error = 'Name is required';
    }
    return [error, value];
  }
}

export default Validate;
