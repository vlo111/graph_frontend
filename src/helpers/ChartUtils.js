import _ from 'lodash';
import * as d3 from 'd3';
import Chart from "../Chart";

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

    return types[type].map((d) => (_.isNumber(d) ? d * value : d));
  }

  static dashLinecap(type) {
    const types = {
      b: 'round',
    };
    return types[type];
  }

  static color() {
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    return (d) => scale(d.type);
  }

  static getNodeDocumentPosition(i) {
    const node = document.querySelector(`#graph .node:nth-child(${i + 1})`);
    return node.getBoundingClientRect();
  }

  static calcScaledPosition(x = 0, y = 0) {
    const moveX = +Chart.wrapper?.attr('data-x') || 0;
    const moveY = +Chart.wrapper?.attr('data-y') || 0;
    const scale = +Chart.wrapper?.attr('data-scale') || 1;
    const _x = (x - moveX) / scale;
    const _y = (y - moveY) / scale;
    return {
      x: _x,
      y: _y,
      moveX,
      moveY,
      scale,
    };
  }
}

export default ChartUtils;
