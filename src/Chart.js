import * as d3 from 'd3';
import _ from 'lodash';
import EventEmitter from 'events';
import { toast } from 'react-toastify';
import ChartUtils from './helpers/ChartUtils';
import ChartUndoManager from './helpers/ChartUndoManager';
import Utils from './helpers/Utils';

class Chart {
  static event = new EventEmitter();

  static drag(simulation) {
    const dragstart = (ev, d) => {
      this.event.emit('node.dragstart', ev, d);
      if (ev.active) simulation.alphaTarget(0.3).restart();
      d.fixed = !!d.fx;
      // d.fx = d.x;
      // d.fy = d.y;
      // d.x = d3.event.x;
      // d.y = d3.event.y;
    };

    const dragged = (ev, d) => {
      d.fx = ev.x;
      d.fy = ev.y;

      d.x = ev.x;
      d.y = ev.y;

      this.graphMovement();
    };

    const dragend = (ev, d) => {
      if (this.activeButton === 'view') {
        this.detectLabels(d);
      }
      this.event.emit('node.dragend', ev, d);
      if (!ev.active) simulation.alphaTarget(0);
      if (!d.fixed) {
        d.x = d.fx || d.x;
        d.y = d.fy || d.y;
        delete d.fx;
        delete d.fy;
      }
      if (!d.fixed) {
        d.x = d.fx || d.x;
        d.y = d.fy || d.y;
        delete d.fx;
        delete d.fy;
      }
    };

    return d3.drag()
      .on('start', dragstart)
      .on('drag', dragged)
      .on('end', dragend);
  }

  static getSource(l) {
    return l.source?.name || l.source || NaN;
  }

  static getTarget(l) {
    return l.target?.name || l.target || NaN;
  }

  static normalizeData(data) {
    data.nodes = data.nodes || Chart.getNodes();
    data.links = data.links || _.cloneDeep(Chart.getLinks());
    data.labels = data.labels?.filter((d) => d.name) || Chart.getLabels();

    const nodes = data.nodes.map((d) => Object.create(d));

    _.forEach(data.links, (link, linkIndex) => {
      const sameLinks = data.links.filter((l) => (
        (this.getSource(l) === this.getSource(link) && this.getTarget(l) === this.getTarget(link))
        || (this.getSource(l) === this.getTarget(link) && this.getTarget(l) === this.getSource(link))
      ));

      if (!sameLinks.length) {
        delete data.links[linkIndex];
      } else if (sameLinks.length > 1) {
        _.forEach(sameLinks, (l, i) => {
          const reverse = this.getSource(l) === this.getTarget(link);
          const totalHalf = sameLinks.length / 2;
          const index = i + 1;
          const even = sameLinks.length % 2 === 0;
          const half = Math.floor(sameLinks.length / 2);
          const middleLink = !even && Math.ceil(totalHalf) === index;
          const indexCorrected = index <= totalHalf ? index : index - Math.ceil(totalHalf);

          let arcDirection = index <= totalHalf ? 0 : 1;
          if (reverse) {
            arcDirection = arcDirection === 1 ? 0 : 1;
          }

          let arc = half / (indexCorrected - (even ? 0.5 : 0));

          if (middleLink) {
            arc = 0;
          }

          l.same = {
            arcDirection,
            arc,
          };
        });
      }
    });

    const links = Object.values(data.links).map((d) => Object.create(d));

    return { links, nodes, labels: data.labels };
  }

  static resizeSvg = () => {
    if (!this.svg) {
      return null;
    }
    const graph = document.querySelector('#graph');
    if (!graph) {
      return null;
    }
    const { width, height } = graph.getBoundingClientRect();
    return this.svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);
  }

  static autoPosition() {
    if (this.data.nodes[0] && this.data.nodes[0].fx === undefined) {
      const graph = document.querySelector('#graph');
      if (!graph) {
        return null;
      }
      const { width, height } = graph.getBoundingClientRect();
      this.simulation = this.simulation
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('charge', d3.forceManyBody().strength((d, i) => (i === 0 ? -2000 : -1000)).distanceMin(200).distanceMax(1000));
      // .force('y', d3.forceY(0.01))
      // .force('x', d3.forceX(0.01));
    }
    return null;
  }

  static handleZoom = (ev) => {
    if (this.activeButton === 'create-label') {
      return;
    }
    const { transform } = ev;
    this.wrapper.attr('transform', transform)
      .attr('data-scale', transform.k)
      .attr('data-x', transform.x)
      .attr('data-y', transform.y);

    this.setLabelsBoardZoom(transform);
    this.renderNodeText(transform.k);
  }

  static setLabelsBoardZoom(transform) {
    const scale = 1 / transform.k;
    const size = 100 * scale;
    const x = transform.x * -1;
    const y = transform.y * -1;

    // this.wrapper.select('.labelsBoard')
    //   .attr('transform', `scale(${scale}) translate(${x}, ${y})`)

    this.wrapper.select('.labelsBoard')
      .attr('width', `${size}%`)
      .attr('height', `${size}%`)
      .attr('x', x * scale)
      .attr('y', y * scale);
  }

  static detectLabelsProcess = false;

  static detectLabels(d = null) {
    const nodesEl = document.querySelector('#graph .nodes');
    if (!nodesEl || this.detectLabelsProcess) {
      return;
    }
    this.detectLabelsProcess = true;
    const originalDimensions = {
      scale: this.wrapper.attr('data-scale') || 1,
      x: this.wrapper.attr('data-x') || 0,
      y: this.wrapper.attr('data-y') || 0,
    };

    const { width, height } = nodesEl.getBoundingClientRect();

    // const scale = 0.1;
    const scaleW = window.innerWidth / (width / originalDimensions.scale + 20);
    const scaleH = window.innerHeight / (height / originalDimensions.scale + 20);
    const scale = Math.min(scaleW, scaleH, 1);

    console.log(scaleH);

    const nodes = this.getNodes();

    const x = Math.min(...nodes.map((n) => n.fx - this.radiusList[n.index] - 2)) * -1 * scale;
    const y = Math.min(...nodes.map((n) => n.fy - this.radiusList[n.index] - 2)) * -1 * scale;
    this.wrapper.attr('transform', `translate(${x}, ${y}), scale(${scale})`);
    // this.svg.call(this.zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));

    this.data.nodes = this.data.nodes.map((l) => {
      if (d) {
        if (d.name === l.name) {
          l.labels = ChartUtils.getLabelsByPosition(l);
        }
      } else {
        l.labels = ChartUtils.getLabelsByPosition(l);
      }
      return l;
    });

    const { x: oX, y: oY, scale: oScale } = originalDimensions;

    this.wrapper.attr('transform', `translate(${oX}, ${oY}), scale(${oScale})`);
    // this.svg.call(this.zoom.transform, d3.zoomIdentity.translate(oX, oY).scale(oScale));

    this._dataNodes = null;

    this.detectLabelsProcess = false;
  }

  static renderLabels() {
    let activeLine;

    const renderPath = d3.line()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveBasis);

    const dragLabel = {};

    const handleDragStart = (ev) => {
      if (this.activeButton === 'create-label') {
        activeLine = labels.append('path')
          .datum({
            name: '',
            color: ChartUtils.labelColors(),
            d: [],
          })
          .attr('class', 'label')
          .attr('data-name', (d) => d.name);
      } else if (ev.sourceEvent.target.classList.contains('label')) {
        const name = ev.sourceEvent.target.getAttribute('data-name');
        this.detectLabels();
        dragLabel.label = labels.select(`#lb_${name}`);
        dragLabel.nodes = this.data.nodes.filter((d) => d.labels.includes(name));
      }
    };

    const handleDrag = (ev) => {
      if (this.activeButton === 'create-label') {
        const { x, y } = ev;
        const datum = activeLine.datum();
        datum.d.push([x, y]);
        activeLine
          .datum(datum)
          .attr('d', (d) => renderPath(d.d))
          .attr('opacity', 1)
          .attr('fill', 'transparent')
          .attr('stroke', '#0D0905')
          .attr('stroke-width', 2);
      } else if (dragLabel.label) {
        const datum = dragLabel.label.datum();
        datum.d = datum.d.map((p) => {
          p[0] += ev.dx;
          p[1] += ev.dy;
          return p;
        });
        this.node.each((d) => {
          if (dragLabel.nodes.some((n) => n.index === d.index)) {
            d.fx += ev.dx;
            d.fy += ev.dy;

            d.x += ev.dx;
            d.y += ev.dy;
          }
        });
        this.graphMovement();

        dragLabel.label
          .datum(datum)
          .attr('d', (d) => renderPath(d.d));

        this.event.emit('label.drag', ev, dragLabel.label);
      }
    };

    const handleDragEnd = (ev) => {
      dragLabel.label = null;
      if (this.activeButton === 'create-label') {
        const datum = activeLine.datum();

        datum.d = ChartUtils.coordinatesCompass(datum.d, 3);

        if (datum.d.length < 4) {
          activeLine.remove();
          activeLine = null;
          return;
        }

        activeLine
          .datum(datum)
          .attr('d', (d) => renderPath(d.d))
          .attr('opacity', 0.4)
          .attr('fill', (d) => d.color)
          .attr('stroke', undefined)
          .attr('stroke-width', undefined);

        this.data.labels.push(datum);
        this.detectLabels();
        activeLine = null;
        this.event.emit('label.new', ev, datum);
      }
    };

    const labels = d3.select('#graph .labels')
      .call(d3.drag()
        .on('start', handleDragStart)
        .on('drag', handleDrag)
        .on('end', handleDragEnd));

    labels.selectAll('path')
      .data(this.data.labels.filter((l) => l.hidden !== 1))
      .join('path')
      .attr('class', 'label')
      .attr('opacity', '0.4')
      .attr('id', (d) => `lb_${d.name}`)
      .attr('data-name', (d) => d.name || ChartUtils.labelColors(d))
      .attr('fill', ChartUtils.labelColors)
      .attr('d', (d) => renderPath(d.d))
      .on('click', (ev, d) => this.event.emit('label.click', ev, d))
      .on('mouseenter', (ev, d) => this.event.emit('label.mouseenter', ev, d))
      .on('mousemove', (ev, d) => this.event.emit('label.mousemove', ev, d))
      .on('mouseleave', (ev, d) => this.event.emit('label.mouseleave', ev, d));

    this._dataNodes = null;
  }

  static render(data = {}, params = {}) {
    try {
      const firstCall = this.isCalled('render');
      if (!firstCall) {
        this.undoManager = new ChartUndoManager();
      }
      this._dataNodes = null;
      this._dataLinks = null;
      data = this.normalizeData(data);
      if (!params.dontRemember && _.isEmpty(params.filters)) {
        if (!_.isEmpty(data?.nodes) || !_.isEmpty(data?.links)) {
          this.undoManager.push(data);
        }
        if (!_.isEmpty(this.data?.nodes) || !_.isEmpty(this.data?.links)) {
          if (!_.isEqual(data, this.data)) {
            this.event.emit('dataChange', this);
          }
        }
      }
      data = ChartUtils.filter(data, params.filters, params.customFields);
      this.data = data;
      this.radiusList = ChartUtils.getRadiusList();

      const filteredLinks = this.data.links.filter((d) => d.hidden !== 1);
      const filteredNodes = this.data.nodes.filter((d) => d.hidden !== 1);

      this.simulation = d3.forceSimulation(this.data.nodes)
        .force('link', d3.forceLink(filteredLinks).id((d) => d.name))
        .on('tick', this.graphMovement);

      this.autoPosition();

      this.svg = d3.select('#graph svg');
      this.zoom = d3.zoom().on('zoom', this.handleZoom);
      this.svg = this.svg
        .call(this.zoom)
        .on('dblclick.zoom', null)
        .on('click', (...p) => this.event.emit('click', ...p))
        .on('mousemove', (...p) => this.event.emit('mousemove', ...p));

      this.resizeSvg();

      this.wrapper = this.svg.select('.wrapper');

      this.linksWrapper = this.svg.select('.links');
      this.link = this.linksWrapper.selectAll('path')
        .data(filteredLinks)
        .join('path')
        .attr('id', (d) => `l${d.index}`)
        .attr('stroke-dasharray', (d) => ChartUtils.dashType(d.linkType, d.value || 1))
        .attr('stroke-linecap', (d) => ChartUtils.dashLinecap(d.linkType))
        .attr('stroke', ChartUtils.linkColor)
        .attr('stroke-width', (d) => d.value || 1)
        .attr('marker-end', (d) => (d.direction ? `url(#m${d.index})` : undefined))
        .on('click', (...p) => this.event.emit('link.click', ...p));

      this.renderDirections();
      this.renderLabels();
      this.icons = this.renderIcons();

      this.nodesWrapper = this.svg.select('.nodes');
      this.node = this.nodesWrapper.selectAll('.node')
        .data(filteredNodes)
        .join('g')
        .attr('class', (d) => `node ${d.nodeType || 'circle'} ${d.icon ? 'withIcon' : ''} ${d.hidden === -1 ? 'disappear' : ''}`)
        .attr('data-i', (d) => d.index)
        .call(this.drag(this.simulation))
        .on('mouseenter', (...p) => this.event.emit('node.mouseenter', ...p))
        .on('mouseleave', (...p) => this.event.emit('node.mouseleave', ...p))
        .on('dblclick', (...p) => this.event.emit('node.dblclick', ...p))
        .on('click', (...p) => this.event.emit('node.click', ...p));

      this.nodesWrapper.selectAll('.node > *').remove();

      this.nodesWrapper.selectAll('.node:not(.hexagon):not(.square):not(.triangle)')
        .append('circle')
        .attr('r', (d) => this.radiusList[d.index]);

      this.nodesWrapper.selectAll('.square')
        .append('rect')
        .attr('width', (d) => this.radiusList[d.index] * 2)
        .attr('height', (d) => this.radiusList[d.index] * 2)
        .attr('x', (d) => this.radiusList[d.index] * -1)
        .attr('y', (d) => this.radiusList[d.index] * -1);

      this.nodesWrapper.selectAll('.triangle')
        .append('path')
        .attr('d', (d) => {
          const s = this.radiusList[d.index] * 2.5;
          return `M 0,${s * 0.8} L ${s / 2},0 L ${s},${s * 0.8} z`;
        })
        .attr('transform', (d) => {
          const r = this.radiusList[d.index] * -1 - 2;
          return `translate(${r * 1.2}, ${r})`;
        });

      this.nodesWrapper.selectAll('.hexagon')
        .append('polygon')
        .attr('points', (d) => {
          const s = this.radiusList[d.index];
          // eslint-disable-next-line max-len
          return `${2.304 * s},${1.152 * s} ${1.728 * s},${2.1504 * s} ${0.576 * s},${2.1504 * s} ${0},${1.152 * s} ${0.576 * s},${0.1536 * s} ${1.728 * s},${0.1536 * s}`;
        })
        .attr('transform', (d) => {
          const r = this.radiusList[d.index] * -1.13;
          return `translate(${r}, ${r})`;
        });

      this.nodesWrapper.selectAll('.node :not(text)')
        .attr('fill', (d) => (d.icon ? `url(#i${d.index})` : ChartUtils.nodeColor(d)));

      this.renderLinkText();
      this.renderNodeText();
      this.renderNewLink();
      this.nodeFilter();
      this.windowResize();

      this.event.emit('render', this);
      return this;
    } catch (e) {
      toast.error(`Chart Error :: ${e.message}`);
      console.error(e.message);
      // if (e.message.startsWith('missing: ')) {
      //   const name = e.message.replace('missing: ', '');
      //   const links = this.getLinks().filter(d => d.source !== name && d.target !== name);
      //   this.render({ links });
      // }
      return this;
    }
  }

  static graphMovement = () => {
    if (!this.link || !this.link) {
      return;
    }
    this.link.attr('d', (d) => {
      let arc = 0;
      let arcDirection = 0;
      if (d.same) {
        const dr = ChartUtils.nodesDistance(d);

        arc = d.same.arc * dr;
        arcDirection = d.same.arcDirection;
      }

      return `M${d.source.x},${d.source.y}A${arc},${arc} 0 0,${arcDirection} ${d.target.x},${d.target.y}`;
    });
    this.node
      .attr('transform', (d) => `translate(${d.x || 0}, ${d.y || 0})`)
      .attr('class', ChartUtils.setClass((d) => ({ auto: d.vx !== 0 })));

    this.linkText
      .attr('dy', (d) => (ChartUtils.linkTextLeft(d) ? 17 + +d.value / 2 : (5 + +d.value / 2) * -1))
      .attr('transform', (d) => (ChartUtils.linkTextLeft(d) ? 'rotate(180)' : undefined));

    this.directions
      .attr('dx', (d) => {
        let i = this.radiusList[d.target.index] - d.value;
        if (d.target.nodeType === 'triangle') {
          i += 5;
        } else if (d.target.nodeType === 'hexagon') {
          i += 5;
        }
        if (!d.target.icon) {
          i += 4;
        }
        return i * -1;
      });

    this._dataNodes = null;
    this._dataLinks = null;
  }

  static renderDirections() {
    const directions = this.wrapper.select('.directions');

    directions.selectAll('text textPath').remove();

    this.directions = directions.selectAll('text')
      .data(this.data.links.filter((d) => d.direction && d.hidden !== 1))
      .join('text')
      .attr('dy', (d) => d.value * 1.8 + 1.55)
      .attr('dx', (d) => {
        let i = this.radiusList[d.target.index] - d.value;
        if (d.target.nodeType === 'triangle') {
          i += 5;
        } else if (d.target.nodeType === 'hexagon') {
          i += 5;
        }
        if (!d.target.icon) {
          i += 4;
        }
        return i * -1;
      })
      .attr('text-anchor', 'end')
      .attr('font-size', (d) => 5 + (d.value * 5))
      .attr('fill', ChartUtils.linkColor)
      .join('text');

    this.directions.append('textPath')
      .attr('startOffset', '100%')
      .attr('href', (d) => `#l${d.index}`)
      .text('➤');
  }

  static renderIcons() {
    const icons = this.wrapper.select('.icons');

    icons.selectAll('defs pattern').remove();

    const defs = icons.selectAll('defs')
      .data(this.data.nodes.filter((d) => d.icon))
      .join('defs');

    defs.append('pattern')
      .attr('id', (d) => `i${d.index}`)
      .attr('patternUnits', 'objectBoundingBox')
      .attr('height', 1)
      .attr('width', 1)
      .append('image')
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('height', (d) => {
        let i = 2;
        if (d.nodeType === 'hexagon') {
          i = 2.3;
        } else if (d.nodeType === 'triangle') {
          i = 3.1;
        }
        return this.radiusList[d.index] * i;
      })
      .attr('width', (d) => {
        let i = 2;
        if (d.nodeType === 'hexagon') {
          i = 2.3;
        } else if (d.nodeType === 'triangle') {
          i = 3.1;
        }
        return this.radiusList[d.index] * i;
      })
      .attr('transform', (d) => {
        const r = this.radiusList[d.index] * -1;
        if (d.nodeType === 'triangle') {
          return `translate(${r / 3.1}, 0)`;
        }
        return undefined;
      })
      .attr('xlink:href', (d) => ChartUtils.normalizeIcon(d.icon));
    return defs;
  }

  static renderNodeText(scale) {
    if (!scale && !this.wrapper.empty()) {
      // eslint-disable-next-line no-param-reassign
      scale = +this.wrapper.attr('data-scale') || 1;
    }

    this.nodesWrapper.selectAll('.node text').remove();

    this.nodesWrapper.selectAll('.node')
      .filter((d) => {
        if (scale >= 0.8) {
          return true;
        }
        if (this.radiusList[d.index] < 11) {
          return false;
        }
        return true;
      })
      .append('text')
      .attr('y', (d) => {
        let i = 11;
        if (!d.icon) {
          i += 4;
        }
        if (d.nodeType === 'hexagon') {
          i += this.radiusList[d.index] / 5;
        } else if (d.nodeType === 'triangle') {
          i += this.radiusList[d.index] / 5;
        }
        return this.radiusList[d.index] + i;
      })
      .attr('font-size', (d) => 13.5 + (this.radiusList[d.index] - (d.icon ? 4.5 : 0)) / 4)
      .text((d) => (d.name.length > 30 ? `${d.name.substring(0, 28)}...` : d.name));
  }

  static renderLinkText(links = []) {
    const wrapper = this.svg.select('.linkText');
    const linkIndexes = links.map((d) => d.index);
    const linksData = this.data.links.filter((d) => linkIndexes.includes(d.index));

    wrapper.selectAll('text textPath').remove();

    this.linkText = wrapper.selectAll('text')
      .data(linksData.filter((d) => d.hidden !== 1))
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('fill', ChartUtils.linkColor)
      .attr('dy', (d) => (ChartUtils.linkTextLeft(d) ? 17 + d.value / 2 : (5 + d.value / 2) * -1))
      .attr('transform', (d) => (ChartUtils.linkTextLeft(d) ? 'rotate(180)' : undefined));

    this.linkText.append('textPath')
      .attr('startOffset', '50%')
      .attr('href', (d) => `#l${d.index}`)
      .text((d) => ` ${d.type} `);

    this.link
      .attr('stroke-width', (d) => (linkIndexes.includes(d.index) ? +d.value + 1.5 : +d.value || 1));

    this.directions
      .attr('stroke-width', (d) => (linkIndexes.includes(d.index) ? 0.8 : undefined))
      .attr('stroke', (d) => (linkIndexes.includes(d.index) ? ChartUtils.linkColor(d) : undefined));
  }

  static #calledFunctions = [];

  static isCalled = (fn) => {
    if (this.#calledFunctions.includes(fn)) {
      return true;
    }
    this.#calledFunctions.push(fn);
    return false;
  }

  static nodeFilter() {
    if (this.isCalled('nodeFilter')) {
      return;
    }
    let dragActive = false;
    this.event.on('node.dragstart', () => {
      dragActive = true;
    });

    this.event.on('node.dragend', () => {
      dragActive = false;
    });

    this.event.on('node.mouseenter', (ev, d) => {
      if (dragActive) return;
      const links = this.getNodeLinks(d.name, 'all');
      links.push({ source: d.name, target: d.name });
      const nodeNames = new Set();
      links.forEach((l) => {
        nodeNames.add(l.source);
        nodeNames.add(l.target);
      });

      const hideNodes = this.node.filter((n) => !nodeNames.has(n.name));
      hideNodes.attr('class', ChartUtils.setClass(() => ({ hidden: true })));

      const hideLinks = this.link.filter((n) => !links.some((l) => l.index === n.index));
      hideLinks.attr('class', ChartUtils.setClass(() => ({ hidden: true })));

      const hideDirections = this.directions.filter((n) => !links.some((l) => l.index === n.index));
      hideDirections.attr('class', ChartUtils.setClass(() => ({ hidden: true })));

      this.renderLinkText(links);
    });

    this.event.on('node.mouseleave', () => {
      if (dragActive) return;
      this.node.attr('class', ChartUtils.setClass(() => ({ hidden: false })));
      this.link.attr('class', ChartUtils.setClass(() => ({ hidden: false })));
      this.directions.attr('class', ChartUtils.setClass(() => ({ hidden: false })));
      this.renderLinkText();
    });
  }

  static renderNewLink() {
    if (this.wrapper.empty() || !this.wrapper.select('#addNewLink').empty()) {
      return;
    }
    this.newLink = this.wrapper
      .append('line')
      .attr('id', 'addNewLink')
      .attr('data-source', '')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', 0);

    let cancel = false;
    this.event.on('node.dblclick', () => {
      cancel = true;
      setTimeout(() => {
        cancel = false;
      }, 300);
    });
    this.event.on('node.click', async (ev, d) => {
      await Utils.sleep(10);
      if (this.activeButton !== 'create') {
        return;
      }
      if (cancel) {
        this.newLink.attr('data-source', '')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 0)
          .attr('y2', 0);
        return;
      }
      const source = this.newLink.attr('data-source');
      if (d.fx === undefined || d.fy === undefined) {
        return;
      }
      if (!source) {
        this.newLink.attr('data-source', d.name)
          .attr('x1', d.fx || d.x)
          .attr('y1', d.fy || d.y)
          .attr('x2', d.fx || d.x)
          .attr('y2', d.fy || d.y);
      } else {
        const target = d.name;
        this.newLink.attr('data-source', '')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 0)
          .attr('y2', 0);
        if (source !== target) {
          this.event.emit('line.new', ev, {
            source,
            target: d.name,
          });
        }
      }
    });

    this.event.on('click', (ev) => {
      if (ev.target.tagName !== 'svg') {
        return;
      }
      setTimeout(() => {
        this.newLink.attr('data-source', '')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 0)
          .attr('y2', 0);
      }, 10);
    });
    this.event.on('mousemove', (ev) => {
      const source = this.newLink.attr('data-source');
      if (this.activeButton !== 'create' || !source) {
        return;
      }
      const { x, y } = ChartUtils.calcScaledPosition(ev.x, ev.y);
      this.newLink.attr('x2', x).attr('y2', y);
    });
  }

  static getScaledPosition(ev) {
    const { x, y } = ev;
    return ChartUtils.calcScaledPosition(x, y);
  }

  static getNodeLinks(name, type = 'target') {
    const links = this.getLinks();
    return links.filter((d) => (type === 'all' ? d.source === name || d.target === name : d[type] === name));
  }

  static getNodeLinksNested(name) {
    let links = this.getNodeLinks(name);
    if (links.length) {
      links.forEach((d) => {
        links = [...links, ...this.getNodeLinksNested(d.target)];
      });
    }
    return links;
  }

  static getNodes(show = null) {
    if (_.isEmpty(this.data)) {
      return [];
    }
    if (!this._dataNodes) {
      this._dataNodes = this.data.nodes.map((d) => ({
        index: d.index,
        fx: d.fx || d.x || 0,
        fy: d.fy || d.y || 0,
        name: d.name || '',
        type: d.type || '',
        nodeType: d.nodeType || 'circle',
        description: d.description || '',
        icon: d.icon || '',
        link: d.link || '',
        hidden: d.hidden,
        keywords: d.keywords || [],
        location: d.location || undefined,
        labels: d.labels,
        color: d.color || ChartUtils.nodeColor(d),
      }));
    }
    if (show) {
      this._dataNodes = this._dataNodes.map((d, i) => {
        show.forEach((s) => {
          d[s] = this.data.nodes[i][s];
        });
        return d;
      });
    }

    return this._dataNodes;
  }

  static getNotesWithLabels() {
    this.detectLabels();
    return this.getNodes();
  }

  static getLinks() {
    if (_.isEmpty(this.data)) {
      return [];
    }
    if (!this._dataLinks) {
      this._dataLinks = this.data.links.map((d) => {
        const pd = Object.getPrototypeOf(d);
        return {
          index: d.index,
          source: Chart.getSource(pd) || Chart.getSource(d) || '',
          target: Chart.getTarget(pd) || Chart.getTarget(d) || '',
          value: +pd.value || +d.value || 1,
          linkType: pd.linkType || d.linkType || '',
          type: pd.type || d.type || '',
          direction: pd.direction || d.direction || '',
          hidden: pd.hidden || d.hidden,
          color: pd.color || ChartUtils.linkColor(d),
        };
      });
    }
    return this._dataLinks;
  }

  static getLabels() {
    if (_.isEmpty(this.data)) {
      return [];
    }
    return _.uniqBy(this.data.labels || [], 'name');
  }

  static get activeButton() {
    return d3.select('#graph').attr('data-active');
  }

  static unmount() {
    this.svg.remove();
    this.#calledFunctions = [];
    this.data.nodes = [];
    this.data.links = [];
    this.event.removeAllListeners();
    this.undoManager.reset();
    ChartUtils.resetColors();
    window.removeEventListener('resize', Chart.resizeSvg);
  }

  static printMode(svgWidth, svgHeight, crop = false) {
    const originalDimensions = {
      scale: this.wrapper.attr('data-scale') || 1,
      x: this.wrapper.attr('data-x') || 0,
      y: this.wrapper.attr('data-y') || 0,
    };
    this.wrapper.attr('transform', undefined)
      .attr('data-scale', 1)
      .attr('data-x', 0)
      .attr('data-y', 0);
    this.svg
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .attr('viewBox', [0, 0, svgWidth, svgHeight]);

    if (!document.querySelector('#graph svg')) {
      console.error('graph error');
      return '';
    }

    if (crop) {
      this.wrapper.selectAll('.unChecked')
        .attr('style', 'display:none');
    }

    const {
      left: svgLeft, top: svgTop,
    } = document.querySelector('#graph svg').getBoundingClientRect();

    const {
      left, top, width, height,
    } = document.querySelector('#graph .nodes').getBoundingClientRect();

    const scaleW = svgWidth / (width + 20);
    const scaleH = svgHeight / (height + 20);
    const scale = Math.min(scaleW, scaleH);

    const x = -1 * (left - svgLeft) * scale + ((svgWidth - width * scale) / 2);
    const y = -1 * (top - svgTop) * scale + ((svgHeight - height * scale) / 2);

    Chart.wrapper.attr('transform', `translate(${x}, ${y}), scale(${scale})`)
      .attr('data-scale', scale)
      .attr('data-x', x)
      .attr('data-y', y);

    this.linksWrapper.selectAll('path')
      .attr('fill', 'transparent');

    this.nodesWrapper.selectAll('.node text')
      .attr('font-family', 'Open Sans')
      .attr('dominant-baseline', 'middle')
      .attr('stroke', 'white')
      .attr('fill', '#0D0905')
      .attr('text-anchor', 'middle')
      .attr('stroke-width', 0);

    this.nodesWrapper.selectAll('.node :not(text)')
      .attr('stroke', 'white')
      .attr('stroke-width', 10);

    this.nodesWrapper.selectAll('.node.withIcon :not(text)')
      .attr('stroke-width', 1.5);

    const html = document.querySelector('#graph svg').outerHTML;

    // reset original styles
    const { x: oX, y: oY, scale: oScale } = originalDimensions;
    this.wrapper.attr('transform', `translate(${oX}, ${oY}), scale(${oScale})`)
      .attr('data-scale', oScale)
      .attr('data-x', oX)
      .attr('data-y', oY);

    this.linksWrapper.selectAll('path')
      .attr('fill', undefined);

    this.wrapper.selectAll('.unChecked')
      .attr('style', undefined);

    this.nodesWrapper.selectAll('.node text')
      .attr('font-family', undefined)
      .attr('dominant-baseline', undefined)
      .attr('stroke', undefined)
      .attr('stroke-width', undefined)
      .attr('fill', undefined)
      .attr('text-anchor', undefined);

    this.nodesWrapper.selectAll('.node :not(text)')
      .attr('stroke', undefined)
      .attr('stroke-width', undefined);

    this.resizeSvg();

    return html;
  }

  static windowResize() {
    if (this.isCalled('windowResize')) {
      return;
    }
    window.addEventListener('resize', Chart.resizeSvg);
  }
}

export default Chart;
