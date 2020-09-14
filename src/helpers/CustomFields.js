import _ from 'lodash';

class CustomFields {
  static setValue(customFields = {}, type, name, customField) {
    _.forEach(customField, (value, key) => {
      _.set(customFields, [type, key, name], value);
    });
    return { ...customFields };
  }

  static setKey(customFields = {}, type, key) {
    if (!_.get(customFields, [type, key])) {
      _.set(customFields, [type, key], {});
    }
    return { ...customFields };
  }

  static nodeRename(customFields = {}, type, oldName, name) {
    const customFieldType = _.get(customFields, type, {});
    _.forEach(customFieldType, (d, key) => {
      if (_.get(customFields, [type, key, oldName])) {
        _.set(customFields, [type, key, name], d);
        _.remove(customFields, [type, key, oldName]);
      }
    });
    return customFields;
  }

  static get(customFields, type, name) {
    const customFieldType = _.get(customFields, type, {});

    const data = {};

    _.forEach(customFieldType, (d, key) => {
      data[key] = d[name] || undefined;
    });

    return data;
  }

  static getKeys(customFields, type) {
    return Object.keys(customFields[type]);
  }
}

export default CustomFields;
