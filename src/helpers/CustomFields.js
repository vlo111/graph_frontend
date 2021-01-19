import _ from 'lodash';

class CustomFields {
  static LIMIT = 10;

  static setValue(customFields = {}, type, name, values) {
    let i = 0;
    let success = true;
    _.forEach(values, (value, key) => {
      if (!customFields[type] || !customFields[type][key]) {
        customFields = this.setKey(customFields, type, key, '');
      }
      if (customFields[type] && customFields[type][key]) {
        customFields[type][key].values[name] = value;
        if (customFields[type][key].order === undefined) {
          customFields[type][key].order = i;
        }
      } else {
        success = false;
      }
      i += 1;
    });
    return {
      success,
      customFields: _.cloneDeep(customFields),
    };
  }

  static setKey(customFields = {}, type, key, subtitle = '') {
    if (Object.keys(customFields[type] || {}).length >= this.LIMIT) {
      console.warn('CustomFields limit');
      return customFields;
    }
    if (!customFields[type]) {
      customFields[type] = {};
    }
    if (!customFields[type][key]) {
      customFields[type][key] = {
        order: Object.values(customFields[type] || {}).length,
        subtitle,
        values: {},
      };
    }
    return { ...customFields };
  }

  static canAddKey(customFields, type) {
    return Object.keys(customFields[type] || {}).length < this.LIMIT;
  }

  static keyExists(customFields, type) {
    return !!customFields[type];
  }

  static removeKey(customFields = {}, type, key) {
    if (customFields[type]) {
      delete customFields[type][key];
    }
    return { ...customFields };
  }

  static removeNode(customFields = {}, nodeId) {
    /* eslint-disable */
    for (const nodeType in customFields) {
      for (const tab in customFields[nodeType]) {
        for (const node in customFields[nodeType][tab].values) {
          if (node === nodeId) {
            delete customFields[nodeType][tab].values[node];
          }
        }
      }
    }
    /* eslint-enable */
    return { ...customFields };
  }

  static nodeRename(customFields = {}, type, oldName, name) {
    const customFieldType = _.get(customFields, type, {});
    _.forEach(customFieldType, (d, key) => {
      if (_.get(customFields, [type, key, oldName])) {
        customFields[type][key][name] = d;
        _.remove(customFields, [type, key, oldName]);
      }
    });
    return customFields;
  }

  static customFieldRename(customFields = {}, type, oldName, name) {
    const customFieldType = _.get(customFields, type, {});
    _.forEach(customFieldType, (d, key) => {
      if (key === oldName) {
        customFields[type][name] = { ...d };
        delete customFields[type][key];
      }
    });
    return customFields;
  }

  static get(customFields, type, id) {
    const customFieldType = _.get(customFields, type, {});
    const data = {};
    _.forEach(customFieldType, (d, key) => {
      data[key] = _.get(d, ['values', id], undefined);
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
