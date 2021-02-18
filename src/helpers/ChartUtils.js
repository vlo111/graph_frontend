import _ from 'lodash';
import * as d3 from 'd3';
import queryString from 'query-string';
import randomColor from 'randomcolor';
import memoizeOne from 'memoize-one';
import { stripHtml } from 'string-strip-html';
import path from 'path';
import Chart from '../Chart';
import history from './history';
import { DASH_TYPES, LINK_COLORS, LINK_DRAFT_COLORS } from '../data/link';
import { NODE_COLOR } from '../data/node';
import { DEFAULT_FILTERS } from '../data/filter';
import Api from '../Api';
import Utils from './Utils';

class ChartUtils {
  static filter = memoizeOne((data, params = {}, customFields = {}) => {
    if (_.isEmpty(params) || !window.location.pathname.startsWith('/graphs/filter/')) {
      return data;
    }
    console.log(params);
    data.links = data.links.map((d) => {
      if (params.linkTypes[0] !== '__ALL__' && !params.linkTypes.includes(d.type)) {
        d.hidden = 1;
        return d;
      }
      if (params.linkValue?.min > -1) {
        if (d.value < params.linkValue.min || d.value > params.linkValue.max) {
          d.hidden = 1;
          return d;
        }
      }
      d.hidden = 0;
      return d;
    });
    const hiddenLabels = [];
    data.labels = data.labels.map((d) => {
      if (!params.labels.includes(d.id)) {
        d.hidden = 1;
        hiddenLabels.push(d.id);
        return d;
      }
      if (!params.labelStatus.includes(d.status || 'unlock')) {
        d.hidden = 1;
        hiddenLabels.push(d.id);
        return d;
      }
      d.hidden = 0;
      return d;
    });
    data.nodes = data.nodes.map((d) => {
      // if (data.links.some((l) => l.hidden && d.name === l.source)) {
      //   d.hidden = 1;
      //   return d;
      // }
      if (params.linkConnection?.min > -1) {
        const { length = 0 } = data.links.filter((l) => l.source === d.id || l.target === d.id) || {};
        if (length < params.linkConnection.min || length > params.linkConnection.max) {
          d.hidden = 1;
          return d;
        }
      }
      if (params.hideIsolated && !data.links.some((l) => d.id === l.source || d.id === l.target)) {
        d.hidden = 1;
        return d;
      }
      if (params.nodeTypes[0] !== '__ALL__' && !params.nodeTypes.includes(d.type)) {
        d.hidden = 1;
        return d;
      }
      if (params.labels[0] !== '__ALL__' && d.labels.length && !d.labels.some((l) => params.labels.includes(l))) {
        d.hidden = 1;
        return d;
      }
      if (params.nodeCustomFields[0] !== '__ALL__' && !params.nodeCustomFields.some((k) => _.get(customFields, [d.type, k, 'values', d.id]))) {
        d.hidden = 1;
        return d;
      }
      if (params.nodeKeywords[0] !== '__ALL__' && !params.nodeKeywords.some((t) => d.keywords.includes(t))) {
        d.hidden = 1;
        if (params.nodeKeywords.includes('[ No Keyword ]') && _.isEmpty(d.keywords)) {
          d.hidden = 0;
        } else {
          return d;
        }
      }
      if (params.nodeStatus[0] !== '__ALL__' && !params.nodeStatus.includes(d.status)) {
        d.hidden = 1;
        return d;
      }
      if (params.labelStatus[0] !== '__ALL__' && _.intersection(d.labels, hiddenLabels).length) {
        d.hidden = 1;
        return d;
      }
      d.hidden = 0;
      return d;
    });

    data.links = data.links.map((d) => {
      d.hidden = d.hidden || (data.nodes.some((n) => n.hidden !== 0 && (d.target === n.id || d.source === n.id)) ? 1 : 0);
      return d;
    });

    return data;
  })

  static isCheckedNode = (selectedGrid, d) => _.isEmpty(selectedGrid.nodes) || selectedGrid.nodes.includes(d.index)

  static isCheckedLink = (selectedGrid, d) => {
    if (_.isEmpty(selectedGrid.nodes)) {
      return true;
    }
    const { index: sourceIndex } = this.getNodeById(d.source.id || d.source);
    const { index: targetIndex } = this.getNodeById(d.target.id || d.target);
    if (!selectedGrid.nodes.includes(sourceIndex) || !selectedGrid.nodes.includes(targetIndex)) {
      return false;
    }
    return selectedGrid.links.includes(d.index);
  }

  static getNodeById(id) {
    const nodes = Chart.getNodes();
    return nodes.find((d) => d.id === id);
  }

  static getLabelById(id) {
    const labels = Chart.getLabels();
    return labels.find((d) => d.id === id);
  }

  static getFilteredGraphByLabel(labelId) {
    const nodes = Chart.getNodes().filter((n) => n.labels?.includes(labelId));
    const links = ChartUtils.cleanLinks(Chart.getLinks(), nodes);
    return {
      nodes,
      links,
    };
  }

  static cleanLinks(links, nodes) {
    return links.filter((l) => nodes.some((n) => l.source === n.id) && nodes.some((n) => l.target === n.id));
  }

  static normalizeIcon = (icon, large = false) => {
    let url = Api.url + icon;
    if (icon.startsWith(Api.url)) {
      url = icon;
    } else if (icon.startsWith('data:image/') || /https?:\/\//.test(icon)) {
      return icon;
    }
    if (large) {
      url += '.large';
    }
    return url;
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

    return { ..._.cloneDeep(DEFAULT_FILTERS), ...filters };
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

  static normalizeId(str, prefix) {
    let id = '';
    if (prefix) {
      id += `${prefix}_`;
    }
    id += _.snakeCase(str);
    return id;
  }

  static calcScaledPosition(x = 0, y = 0, del = '/') {
    if (!Chart.wrapper || Chart.wrapper.empty()) {
      return {
        x: 0,
        y: 0,
        moveX: 0,
        moveY: 0,
        scale: 1,
      };
    }
    const moveX = +Chart.wrapper?.attr('data-x') || 0;
    const moveY = +Chart.wrapper?.attr('data-y') || 0;
    const scale = +Chart.wrapper?.attr('data-scale') || 1;
    let _x = (x - moveX) / scale;
    let _y = (y - moveY) / scale;
    if (del === '*') {
      _x = (x - moveX) * scale;
      _y = (y - moveY) * scale;
    }
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
    let radiusList = Chart.data.nodes.map((d) => Chart.getNodeLinks(d.id, 'all').length * 2 + (d.icon ? 6.5 : 2));
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

  static linkDraftColor = _.clone(LINK_DRAFT_COLORS);

  static linkColor = (d) => {
    if (d.status === 'draft') {
      return ChartUtils.linkDraftColor;
    }
    if (!this.linkColorObj[d.type]) {
      if (d.color) {
        this.linkColorArr = this.linkColorArr.filter((c) => d.color !== c);
        this.linkColorObj[d.type] = d.color;
        return d.color;
      }
      this.linkColorObj[d.type] = this.linkColorArr.shift() || randomColor({ luminosity: 'light' });
    }
    return this.linkColorObj[d.type];
  }

  static nodeColorObj = {};

  static nodeColorsArr = _.clone(NODE_COLOR);

  static nodeColor = (d) => {
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

  static setNodeTypeColor = (type, color) => {
    Chart.data.nodes = Chart.data.nodes.map((n) => {
      if (n.type === type) {
        n.color = color;
      }
      return n;
    });
    this.nodeColorObj[type] = color;
  }

  static labelColorsArr = _.clone(LINK_COLORS);

  static labelColors = (d = {}) => {
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
    const metaKey = ev.sourceEvent?.metaKey || ev.metaKey;
    const ctrlKey = ev.sourceEvent?.ctrlKey || ev.ctrlKey;
    ev.ctrlPress = Utils.getOS() === 'macos' ? metaKey : ctrlKey;
    ev.chartEvent = !['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase());
  }

  static linkTextLeft(d) {
    const dx = d.source.x - d.target.x;
    const dy = d.source.y - d.target.y;
    const radians = Math.atan2(dy, dx);
    const degrees = (radians * 180 / Math.PI) + 180;
    return degrees > 90 && degrees < 270;
  }

  static nodeSearch(search, limit = 15, nodes = Chart.getNodes()) {
    const s = search.trim().toLowerCase();
    nodes = nodes.map((d) => {
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

  static graphsSearch(graphsList, search, limit) {
    const graphs = graphsList.map((graph) => this.nodeSearch(search, limit, graph.nodes));
    console.log(graphs);
    return [];
  }

  static findNodeInDom(node) {
    try {
      Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(0, 0).scale(2));
      const { x, y } = ChartUtils.getNodeDocumentPosition(node.index);
      const nodeWidth = ChartUtils.getRadiusList()[node.index] * 2;
      const left = (x * -1) + (window.innerWidth / 2) - nodeWidth;
      const top = (y * -1) + (window.innerHeight / 2) - nodeWidth;
      Chart.svg.call(Chart.zoom.transform, d3.zoomIdentity.translate(left, top).scale(2));
      // Chart.event.emit('node.mouseenter', node);
    } catch (e) {
      console.log(e);
    }
  }

  static isNodeInLabel(node, label) {
    if (label.sourceId || node.sourceId) {
      if (+label.sourceId !== +node.sourceId) {
        return false;
      }
      if (node.sourceId && node.labels.includes(label.id)) {
        return true;
      }
    }

    const x = node.fx || node.x;
    const y = node.fy || node.y;
    const { d } = label;
    let inside = false;
    if (label.type === 'folder') {
      // if(node.labels?.length > 1 && !node.labels.includes(label.id)){
      //   return false;
      // }
      const nodeOldFolder = node.labels?.find((l) => l.startsWith('f_'));
      if (nodeOldFolder && nodeOldFolder !== label.id) {
        return false;
      }
      const [lx, ly, inFolder] = ChartUtils.getNodePositionInFolder(node);
      if (inFolder && (lx === label.d[0][0] + 30 && ly === label.d[0][1] + 30)) {
        return true;
      }
      if (!label.open && node.labels?.includes(label.id)) {
        return true;
      }
      if (label.open) {
        const [width, height] = d[1];
        const squareX = d[0][0] - (width / 2);
        const squareY = d[0][1] - (height / 2);
        return this.isInSquare([squareX, squareY], [width, height], [x, y]);
      }
    }

    let odd = false;
    let i; let
      j = d.length - 1;
    for (i = 0; i < d.length; i++) {
      if ((d[i][1] < y && d[j][1] >= y || d[j][1] < y && d[i][1] >= y)
        && (d[i][0] <= x || d[j][0] <= x)) {
        odd ^= (d[i][0] + (y - d[i][1]) * (d[j][0] - d[i][0]) / (d[j][1] - d[i][1])) < x;
      }

      j = i;
    }

    for (let i = 0, j = d.length - 1; i < d.length; j = i++) {
      const xi = d[i][0];
      const yi = d[i][1];
      const xj = d[j][0];
      const yj = d[j][1];
      // eslint-disable-next-line no-mixed-operators,no-bitwise
      if ((yi > y ^ yj > y) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return !!odd;
  }

  static getNodeLabels(node) {
    const firstFolder = node.labels?.find((l) => l.startsWith('f_'));
    const firstLabel = node.labels?.find((l) => !l.startsWith('f_'));
    const labels = Chart.getLabels().filter((l) => this.isNodeInLabel(node, l)).map((l) => l.id);
    if (node.index === 128) {
      console.log(labels);
    }
    if (firstLabel) {
      return labels.filter((l) => !l.startsWith('f_'));
    }
    if (labels.includes(firstFolder)) {
      console.log(33333);
      return [firstFolder];
    }
    return labels;
  }

  // deprecated use getNodeLabels
  static getLabelsByPosition(node) {
    const { x, y } = this.getNodeDocumentPosition(node.index);
    const elements = [];
    const labels = document.querySelectorAll('#graph .labels .label');
    document.body.style.pointerEvents = 'none';
    labels.forEach((label) => {
      label.style.pointerEvents = 'all';
    });
    let i = 0;
    while (true) {
      const el = document.elementFromPoint(x, y);
      if (!el || el.tagName.toLowerCase() === 'html') {
        break;
      }
      if (i++ > 30) {
        console.warn('getLabelsByPosition: ', el);
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
      .map((d) => d.getAttribute('data-id'));
    return labelsName;
  }

  static coordinatesCompass(data, compressLevel) {
    const d = [];
    for (let i = 0; i < data.length; i += compressLevel) {
      let x = 0;
      let y = 0;
      let level = 0;
      _.range(i, i + compressLevel).forEach((j) => {
        if (data[j]) {
          x += data[j][0];
          y += data[j][1];
          level += 1;
        }
      });
      x /= level;
      y /= level;

      d.push([x, y]);
    }
    console.log(`coordinatesCompass: ${data.length} -> ${d.length}`);
    return d;
  }

  static async getNodesWithFiles(customFields = {}, documents = []) {
    let nodes = Chart.getNodes(true);
    let fIndex = new Date().getTime();
    let docIndex = fIndex;
    let files = {};

    const icons = await Promise.all(nodes.map((d) => {
      if (d.icon && d.icon.startsWith('blob:')) {
        return Utils.blobToBase64(d.icon);
      }
      return d.icon;
    }));

    nodes = nodes.map((d, i) => {
      d.icon = icons[i];
      d.description = d.description.replace(/\shref="(blob:[^"]+)"/g, (m, url) => {
        fIndex += 1;
        files[fIndex] = Utils.blobToBase64(url);
        return ` href="<%= file_${fIndex} %>"`;
      });
      return d;
    });

    _.forEach(documents, (doc) => {
      docIndex++;
      doc.index = docIndex;
    });

    for (const nodeType in customFields) {
      for (const tab in customFields[nodeType]) {
        if (!_.isEmpty(customFields[nodeType][tab]?.values)) {
          for (const node in customFields[nodeType][tab].values) {
            if (customFields[nodeType][tab].values[node]) {
              customFields[nodeType][tab].values[node] = customFields[nodeType][tab].values[node]
                .replace(/\ssrc="(blob:[^"]+)"/g, (m, url) => {
                  fIndex += 1;
                  files[fIndex] = Utils.blobToBase64(url);
                  return ` src="<%= file_${fIndex} %>"`;
                })
                .replace(/\shref="(blob:[^"]+)"/g, (m, url) => {
                  fIndex += 1;
                  files[fIndex] = Utils.blobToBase64(url);
                  return ` href="<%= file_${fIndex} %>"`;
                });
            }
          }
        } else {
          delete customFields[nodeType][tab];
        }
      }
    }
    files = await Promise.allValues(files);

    return {
      nodes, files, customFields, documents,
    };
  }

  static uniqueId(data = [], id) {
    const graphId = id || Utils.getGraphIdFormUrl();
    const ids = [0];
    data.forEach((d) => {
      const [_id = 0] = /[\d.]+/.exec(d.id) || [];
      const id = +String(_id).split('.')[0];
      if (id && !d.sourceId) {
        ids.push(id);
      }
    });
    const max = _.max(ids);
    if (Chart.data.lastUid < max) {
      Chart.data.lastUid = max;
    }
    Chart.data.lastUid += 1;
    return `${Chart.data.lastUid}.${graphId}`;
  }

  static nodeUniqueName(node) {
    const nodes = Chart.getNodes()
      .filter((n) => n.id !== node.id
        && (node.name === n.name || new RegExp(`^${Utils.escRegExp(node.name)}_\\d+$`).test(n.name)));
    if (!nodes.length) {
      return node.name;
    }
    const max = _.max(nodes.map((n) => +(n.name.match(/_(\d+)$/) || [0, 0])[1])) || 0;
    return `${node.name}_${max + 1}`;
  }

  static getPointPosition(pos1, pos2) {
    const pos = [pos1[0] - pos2[0], pos1[1] - pos2[1]];
    const x = pos[0];
    const y = pos[1];
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    let position = '';
    if (x === 0 && y === 0) {
      position = 'center';
    } else if (x > 0 && y > 0) {
      position = absX > absY ? 'left' : 'top';
    } else if (x > 0 && y < 0) {
      position = absX >= absY ? 'left' : 'bottom';
    } else if (x < 0 && y < 0) {
      position = absX >= absY ? 'right' : 'bottom';
    } else if (x < 0 && y > 0) {
      position = absX >= absY ? 'right' : 'top';
    }
    return position;
  }

  static isInSquare(areaPos, size, pos) {
    return pos[0] >= areaPos[0] && pos[0] <= areaPos[0] + size[0] && pos[1] >= areaPos[1] && pos[1] <= areaPos[1] + size[1];
  }

  static getChartSvg() {
    return document.querySelector('#graph svg')?.outerHTML || '';
  }

  static merge(d1, d2) {
    const data = { ...d1, ...d2 };
    for (const i in data) {
      if (!data[i]) {
        data[i] = d1[i];
      }
    }
    return data;
  }

  static uniqueLinks(links) {
    return _.uniqBy(links, (l) => {
      if (l.direction) {
        return JSON.stringify({
          1: l.name, 2: l.type, 3: l.source, 4: l.target,
        });
      }
      return JSON.stringify({
        1: l.name, 2: l.type, 3: [l.source, l.target].sort(),
      });
    });
  }

  static getNodePositionInFolder(d) {
    const folderId = (d.labels || []).find((l) => l.startsWith('f_'));
    if (folderId) {
      const folder = Chart.getLabels().find((l) => l.id === folderId);
      if (folder) {
        if (!folder.open) {
          const x = folder.d[0][0] + 30;
          const y = folder.d[0][1] + 30;
          return [x, y, true];
        }
      }
    }
    return [d.x || d.fx, d.y || d.fy, false];
  }

  static margeGraphs = (graph1, graph2, selectedNodes1 = graph1.nodes, selectedNodes2 = graph2.nodes) => {
    let links = [...graph1.links || [], ...graph2.links || []];
    let labels = new Set();
    const nodes = selectedNodes1.map((node1) => {
      const node2 = selectedNodes2.find((n) => n.name === node1.name);
      if (node2) {
        node1 = ChartUtils.merge(node2, node1);
        delete node1.hidden;
        links = links.map((l) => {
          if (l.source === node2.id) {
            l.source = node1.id;
          }
          if (l.target === node2.id) {
            l.target = node1.id;
          }
          return l;
        });
      }

      delete node1.color;

      // graph1.labels.filter((l) => node1.labels?.includes(l.id) && l.type !== 'folder').forEach(labels.add, labels);
      return node1;
    });

    selectedNodes2.forEach((node2) => {
      const node1 = selectedNodes1.find((n) => n.name === node2.name);
      if (!node1) {
        // graph1.labels.filter((l) => node2.labels?.includes(l.id) && l.type !== 'folder').forEach(labels.add, labels);

        delete node2.color;
        delete node2.hidden;

        nodes.push(node2);
      }
    });

    labels = [...labels];

    links = ChartUtils.uniqueLinks(links).map((l) => {
      delete l.color;
      return l;
    });

    const { customFields } = graph1;

    const customFieldsMerged = {};

    const customFieldsFull = Utils.mergeDeep(graph2.customFields, customFields);
    for (const type in customFieldsFull) {
      const customField = customFieldsFull[type];
      for (const tab in customField) {
        const { values } = customFieldsFull[type][tab];
        for (const nodeId in values) {
          const n1 = selectedNodes1.find((n) => n.id === nodeId);
          const n2 = selectedNodes2.find((n) => n.id === nodeId);
          const mainNode = nodes.find((n) => n.name === n1?.name || n.name === n2?.name);
          if (mainNode) {
            const node1 = selectedNodes1.find((n) => n.name === mainNode.name);
            const node2 = selectedNodes2.find((n) => n.name === mainNode.name);

            const value1 = node1 ? _.get(customFields, [node1.type, tab, 'values', node1.id]) : null;
            const value2 = node2 ? _.get(graph2.customFields, [node2.type, tab, 'values', node2.id]) : null;

            if (value1 && !value2) {
              _.set(customFieldsMerged, [mainNode.type, tab, 'values', mainNode.id], value1);
            } else if (!value1 && value2) {
              _.set(customFieldsMerged, [mainNode.type, tab, 'values', mainNode.id], value2);
            } else if (value1 && value2) {
              if (value1 !== value2) {
                _.set(customFieldsMerged, [mainNode.type, tab, 'values', mainNode.id], `${value1}\n<hr />\n${value2}`);
              } else {
                _.set(customFieldsMerged, [mainNode.type, tab, 'values', mainNode.id], value2);
              }
            }
          }
        }
      }
    }

    return {
      labels, nodes, links, customFields: customFieldsMerged,
    };
  }
}

export default ChartUtils;
