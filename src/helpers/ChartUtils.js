import _ from 'lodash';
import * as d3 from 'd3';
import Chart from '../Chart';
import { DASH_TYPES } from '../data/link';

class ChartUtils {
  static filter(data, params = {}) {
    if (params.hideIsolated) {
      data.nodes = data.nodes.filter((d) => data.links.some((l) => d.name === l.source || d.name === l.target));
    }
    return data;
  }

  static dashType(type, value) {
    if (!type || type === 'a' || !DASH_TYPES[type]) {
      return undefined;
    }

    return DASH_TYPES[type].map((d) => (_.isNumber(d) ? d * value : d));
  }

  static dashLinecap(type) {
    const types = {
      b: 'round',
    };
    return types[type];
  }

  static color() {
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    return (d) => scale(d.nodeType);
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

  static getNodesGrouped() {
    const nodes = Chart.getNodes();
    return _.groupBy(nodes, 'type');
  }

  static getRadiusList() {
    let radiusList = Chart.data.nodes.map((d) => Chart.getNodeLinks(d.name).length * 2);
    let max = Math.max(...radiusList);
    if (max > 40) {
      radiusList = radiusList.map((d) => {
        if (d > 40) {
          d -= 20;
        }
        return d;
      });
    }
    max = Math.max(...radiusList);
    const r = max > 20 ? Math.max(...radiusList) / 20 : 1;

    return radiusList.map((d) => d / r + 10 || 10);
  }

  static setClass = (fn) => (d, index, g) => {
    const classObj = fn(d, index, g);
    const remove = [];
    const add = [];
    _.forEach(classObj, (val, key) => {
      if (val) {
        add.push(key);
      } else {
        remove.push(key);
      }
    });
    const classArr = [...g[index].classList].filter((str) => !remove.includes(str));
    return _.union([...classArr, ...add]).join(' ');
  }
}

export default ChartUtils;
