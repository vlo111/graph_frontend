import _ from 'lodash';
import * as d3 from 'd3';
import queryString from 'query-string';
import randomColor from 'randomcolor';
import memoizeOne from 'memoize-one';
import Chart from '../Chart';
import history from './history';
import { DASH_TYPES, LINK_COLORS } from '../data/link';
import { DEFAULT_FILTERS } from '../data/filter';
import Api from '../Api';
import Utils from './Utils';

class ChartUtils {
  static filter = memoizeOne((data, params = {}) => {
    if (_.isEmpty(params)) {
      return data;
    }
    data.links = data.links.map((d) => {
      if (!_.isEmpty(params.linkTypes) && !params.linkTypes.includes(d.type)) {
        d.hidden = true;
        return d;
      }
      if (params.linkValue?.min > -1) {
        if (d.value < params.linkValue.min || d.value > params.linkValue.max) {
          d.hidden = true;
          return d;
        }
      }
      d.hidden = false;
      return d;
    });
    data.nodes = data.nodes.map((d) => {
      // if (data.links.some((l) => l.hidden && d.name === l.source)) {
      //   d.hidden = true;
      //   return d;
      // }
      if (params.linkConnection?.min > -1) {
        const { length = 0 } = data.links.filter((l) => l.source === d.name || l.target === d.name) || {};
        if (length < params.linkConnection.min || length > params.linkConnection.max) {
          d.hidden = true;
          return d;
        }
      }
      if (params.hideIsolated && !data.links.some((l) => d.name === l.source || d.name === l.target)) {
        d.hidden = true;
        return d;
      }
      if (!_.isEmpty(params.nodeTypes) && !params.nodeTypes.includes(d.type)) {
        d.hidden = true;
        return d;
      }
      if (!_.isEmpty(params.nodeKeywords) && !params.nodeKeywords.some((t) => d.keywords.includes(t))) {
        d.hidden = true;
        if (params.nodeKeywords.includes('[ No Keyword ]') && _.isEmpty(d.keyword)) {
          d.hidden = false;
        }
        return d;
      }
      d.hidden = false;
      return d;
    });

    data.links = data.links.map((d) => {
      d.hidden = d.hidden || data.nodes.some((n) => n.hidden && (d.target === n.name || d.source === n.name));
      return d;
    });

    return data;
  })

  static isCheckedNode = (selectedGrid, d) => _.isEmpty(selectedGrid.nodes) || selectedGrid.nodes.includes(d.index)

  static isCheckedLink = (selectedGrid, d) => {
    if (_.isEmpty(selectedGrid.nodes)) {
      return true;
    }
    const { index: sourceIndex } = this.getNodeByName(d.source.name || d.source);
    const { index: targetIndex } = this.getNodeByName(d.target.name || d.target);
    if (!selectedGrid.nodes.includes(sourceIndex) || !selectedGrid.nodes.includes(targetIndex)) {
      return false;
    }
    return selectedGrid.links.includes(d.index);
  }

  static getNodeByName(name) {
    const nodes = Chart.getNodes();
    return nodes.find((d) => d.name === name);
  }

  static normalizeIcon = (icon) => {
    if (icon.startsWith('data:image/') || /https?:\/\//.test(icon)) {
      return icon;
    }
    return Api.url + icon;
  }

  static setFilter(key, value) {
    const query = queryString.parse(window.location.search);
    const filters = this.getFilters();
    filters[key] = value;
    query.filters = JSON.stringify(filters);
    const search = queryString.stringify(query);
    history.replace(`?${search}`);
  }

  static getFilters() {
    const query = queryString.parse(window.location.search);
    let filters;
    try {
      filters = JSON.parse(query.filters) || {};
    } catch (e) {
      filters = {};
    }

    return { ...DEFAULT_FILTERS, ...filters };
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

  static getNodeDocument(i) {
    return document.querySelector(`#graph .node[data-i="${i}"] :not(text)`);
  }

  static getNodeDocumentPosition(i) {
    const node = this.getNodeDocument(i);
    if (!node) {
      return {};
    }
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

  static center = ([x1, y1], [x2, y2]) => ([(x1 + x2) / 2, (y1 + y2) / 2])

  static nodesCenter = (d) => this.center([d.source.x, d.source.y], [d.target.x, d.target.y])

  static distance = ([x1, y1], [x2, y2]) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static nodesDistance = (d) => this.distance([d.target.x, d.target.y], [d.source.x, d.source.y])

  static getRadiusList() {
    let radiusList = Chart.data.nodes.map((d) => Chart.getNodeLinks(d.name).length * 2 + (d.icon ? 6.5 : 2));
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

  static linkColorObj = {};

  static linkColorIndex = 0;

  static linkColor = () => (d) => {
    if (!(d.type in this.linkColorObj)) {
      this.linkColorObj[d.type] = LINK_COLORS[this.linkColorIndex] || randomColor({
        luminosity: 'light',
      });
      this.linkColorIndex += 1;
    }
    return this.linkColorObj[d.type];
  }

  static nodeColorObj = {};

  static nodeColorIndex = 0;

  static nodeColor = () => (d) => {
    if (!(d.type in this.nodeColorObj)) {
      this.nodeColorObj[d.type] = d3.schemeCategory10[this.nodeColorIndex] || randomColor();
      this.nodeColorIndex += 1;
    }
    return this.nodeColorObj[d.type];
  }

  static resetColors() {
    this.linkColorObj = {};
    this.nodeColorObj = {};
    this.linkColorIndex = 0;
    this.nodeColorIndex = 0;
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

  static keyEvent(ev) {
    ev.ctrlPress = Utils.getOS() === 'macos' ? ev.metaKey : ev.ctrlKey;
    ev.chartEvent = !['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase());
  }

  static linkTextLeft(d) {
    const dx = d.source.x - d.target.x;
    const dy = d.source.y - d.target.y;
    const radians = Math.atan2(dy, dx);
    const degrees = (radians * 180 / Math.PI) + 180;
    return degrees > 90 && degrees < 270;
  }
}

export default ChartUtils;
