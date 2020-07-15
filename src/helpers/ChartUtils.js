import _ from 'lodash';

class ChartUtils {
  static filter(data, params = {}) {
    if (params.hideIsolated) {
      data.nodes = data.nodes.filter((d) => data.links.some((l) => d.name === l.source || d.name === l.target));
    }
    return data;
  }

  static dashType(type, value) {
    if (!type || type === 'a') {
      return undefined;
    }
    const types = {
      b: ['0.0001', 2],
      c: [3, 3],
      d: [6, 6],
      e: [5, 2.5, 1.2, 1.2, 1.2, 2.5],
    };

    if (!types[type]) {
      return undefined;
    }

    return types[type].map((d) => _.isNumber(d) ? d * value : d);
  }

  static dashLinecap(type) {
    const types = {
      b: 'round',
    };
    return types[type];
  }
}

export default ChartUtils;
