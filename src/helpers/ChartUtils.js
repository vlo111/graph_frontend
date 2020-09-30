import _ from 'lodash';
import * as d3 from 'd3';
import queryString from 'query-string';
import randomColor from 'randomcolor';
import memoizeOne from 'memoize-one';
import stripHtml from 'string-strip-html';
import Chart from '../Chart';
import history from './history';
import { DASH_TYPES, LINK_COLORS } from '../data/link';
import { NODE_COLOR } from '../data/node';
import { DEFAULT_FILTERS } from '../data/filter';
import Api from '../Api';
import Utils from './Utils';

class ChartUtils {
  static filter = memoizeOne((data, params = {}, customFields = {}) => {
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

      // if (!_.isEmpty(params.labels) && !d.labels.some((l) => params.labels.includes(l))) {
      //   d.hidden = true;
      //   return d;
      // }

      if (!_.isEmpty(params.nodeCustomFields) && !params.nodeCustomFields.some((k) => _.get(customFields, [d.type, k, 'values', d.name]))) {
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

  static linkColorArr = _.clone(LINK_COLORS);

  static linkColor = () => (d) => {
    if (!this.linkColorObj[d.type]) {
      if (d.color) {
        this.linkColorArr = this.linkColorArr.filter((c) => d.color !== c);
        this.linkColorArr[d.type] = d.color;
        return d.color;
      }
      this.linkColorObj[d.type] = this.linkColorArr.shift() || randomColor({ luminosity: 'light' });
    }
    return this.linkColorObj[d.type];
  }

  static nodeColorObj = {};

  static nodeColorsArr = _.clone(NODE_COLOR);

  static nodeColor = () => (d) => {
    if (!this.nodeColorObj[d.type]) {
      if (d.color) {
        this.nodeColorsArr = this.nodeColorsArr.filter((c) => d.color !== c);
        this.nodeColorObj[d.type] = d.color;
        return d.color;
      }
      this.nodeColorObj[d.type] = this.nodeColorsArr.shift() || randomColor();
    }
    return this.nodeColorObj[d.type];
  }

  static labelColorsArr = _.clone(LINK_COLORS);

  static labelColors = () => (d = {}) => {
    if (d.color) {
      this.labelColorsArr = this.labelColorsArr.filter((c) => d.color !== c);
      return d.color;
    }
    return this.labelColorsArr.shift() || randomColor({ luminosity: 'light' });
  }

  static resetColors() {
    this.linkColorObj = {};
    this.nodeColorObj = {};
    this.linkColorArr = _.clone(LINK_COLORS);
    this.nodeColorsArr = _.clone(NODE_COLOR);
    this.labelColorsArr = _.clone(LINK_COLORS);
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

  static nodeSearch(search, limit = 15) {
    const s = search.trim().toLowerCase();
    const nodes = Chart.getNodes().map((d) => {
      d.priority = undefined;
      if (d.name.toLowerCase() === s) {
        d.priority = 1;
      } else if (d.type.toLowerCase() === s) {
        d.priority = 2;
      } else if (d.name.toLowerCase().startsWith(s)) {
        d.priority = 3;
      } else if (d.type.toLowerCase().startsWith(s)) {
        d.priority = 4;
      } else if (d.name.toLowerCase().includes(s)) {
        d.priority = 5;
      } else if (d.type.toLowerCase().includes(s)) {
        d.priority = 6;
      } else if (d.keywords.some((k) => k.toLowerCase().includes(s))) {
        d.priority = 7;
      } else if (stripHtml(d.description).result.toLowerCase().includes(s)) {
        d.priority = 8;
      }
      return d;
    }).filter((d) => d.priority);
    return _.orderBy(nodes, 'priority').slice(0, limit);
  }

  static findNodeInDom(node) {
    Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(0, 0).scale(2));
    const { x, y } = ChartUtils.getNodeDocumentPosition(node.index);
    const nodeWidth = ChartUtils.getRadiusList()[node.index] * 2;
    const left = (x * -1) + (window.innerWidth / 2) - nodeWidth;
    const top = (y * -1) + (window.innerHeight / 2) - nodeWidth;
    Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(left, top).scale(2));
    // Chart.event.emit('node.mouseenter', node);
  }

  static getLabelsByPosition(node) {
    const { x, y } = ChartUtils.calcScaledPosition(node.fx || node.x, node.fy || node.y);
    const elements = [];
    const labels = document.querySelectorAll('#graph .labels .label');

    document.body.style.pointerEvents = 'none';
    labels.forEach((label) => {
      label.style.pointerEvents = 'all';
    });

    while (true) {
      const el = document.elementFromPoint(x, y);
      if (!el || el.tagName.toLowerCase() === 'html') {
        break;
      }
      elements.push(el);
      el.style.pointerEvents = 'none';
    }

    document.body.style.pointerEvents = null;
    labels.forEach((label) => {
      label.style.pointerEvents = null;
    });
    elements.forEach((el) => {
      el.style.pointerEvents = null;
    });

    const labelsName = elements
      .filter((el) => el.classList.contains('label'))
      .map((d) => d.getAttribute('data-name'));
    return labelsName;
  }
}

export default ChartUtils;
