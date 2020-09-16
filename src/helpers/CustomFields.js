import _ from 'lodash';

class CustomFields {
  static setValue(customFields = {}, type, name, customField) {
    let i = 0;
    _.forEach(customField, (value, key) => {
      _.set(customFields, [type, key, 'values', name], value);
      if (customFields[type][key].order === undefined) {
        _.set(customFields, [type, key, 'order'], i);
      }
      i += 1;
    });
    return { ...customFields };
  }

  static setKey(customFields = {}, type, key, subtitle = '') {
    if (!_.get(customFields, [type, key])) {
      _.set(customFields, [type, key], {
        order: Object.values(customFields[type] || {}).length,
        values: {},
        subtitle,
      });
    }
    return { ...customFields };
  }

  static removeKey(customFields = {}, type, key) {
    if (customFields[type]) {
      delete customFields[type][key];
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
      data[key] = d.values[name];
    });

    return data;
  }

  static getKeys(customFields, type) {
    if (!customFields[type]) {
      return [];
    }
    const customFieldType = _.chain(customFields[type])
      .map((val, key) => ({
        key,
        order: val.order,
      }))
      .orderBy('order')
      .map((d) => d.key)
      .value();
    return customFieldType;
  }
}

export default CustomFields;
