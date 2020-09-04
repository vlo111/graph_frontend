import * as d3 from 'd3';
import _ from 'lodash';
import EventEmitter from 'events';
import { toast } from 'react-toastify';
import ChartUtils from './helpers/ChartUtils';
import ChartUndoManager from './helpers/ChartUndoManager';

class Chart {
  static event = new EventEmitter();

  static drag(simulation) {
    const dragstart = (d) => {
      this.event.emit('node.dragstart', d);
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (d) => {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    };

    const dragend = (d) => {
      this.event.emit('node.dragend', d);
      if (!d3.event.active) simulation.alphaTarget(0);
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

    return { links, nodes };
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
        .force('charge', d3.forceManyBody())
        .force('x', d3.forceX((d) => {
          const { length } = this.getNodeLinks(d.name);
          if (length) {
            return d.x * length ** length * 50;
          }
          return d.x + 4;
        }))
        .force('y', d3.forceY((d) => {
          const { length } = this.getNodeLinks(d.name);
          if (length) {
            return d.y * length ** length * 50;
          }
          return d.y + 4;
        }));
    }
    return null;
  }

  static handleZoom = () => {
    const { transform } = d3.event;
    this.wrapper.attr('transform', transform)
      .attr('data-scale', transform.k)
      .attr('data-x', transform.x)
      .attr('data-y', transform.y);
    this.renderNodeText(transform.k);
  }

  static render(data = {}, params = {}) {
    try {
      const firstCall = this.isCalled('render');
      if (!firstCall) {
        this.undoManager = new ChartUndoManager();
      }
      this._dataNodes = null;
      this._dataLinks = null;
      data.nodes = data.nodes || Chart.getNodes();
      data.links = data.links || _.cloneDeep(Chart.getLinks());

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

      data = this.normalizeData(data);
      data = ChartUtils.filter(data, params.filters);
      this.data = data;

      this.radiusList = ChartUtils.getRadiusList();

      const filteredLinks = this.data.links.filter((d) => !d.hidden);
      const filteredNodes = this.data.nodes.filter((d) => !d.hidden);

      this.simulation = d3.forceSimulation(this.data.nodes)
        .force('link', d3.forceLink(filteredLinks).id((d) => d.name));

      this.autoPosition();

      this.svg = d3.select('#graph svg');
      this.zoom = d3.zoom().on('zoom', this.handleZoom);
      this.svg = this.svg
        .call(this.zoom)
        .on('click', (d) => this.event.emit('click', d))
        .on('mousemove', (d) => this.event.emit('mousemove', d));

      this.resizeSvg();

      this.wrapper = this.svg.select('.wrapper');

      this.linksWrapper = this.svg.select('.links');
      this.link = this.linksWrapper.selectAll('path')
        .data(filteredLinks)
        .join('path')
        .attr('id', (d) => `l${d.index}`)
        .attr('stroke-dasharray', (d) => ChartUtils.dashType(d.linkType, d.value || 1))
        .attr('stroke-linecap', (d) => ChartUtils.dashLinecap(d.linkType))
        .attr('stroke', ChartUtils.linkColor())
        .attr('stroke-width', (d) => d.value || 1)
        .attr('marker-end', (d) => (d.direction ? `url(#m${d.index})` : undefined))
        .on('click', (d) => this.event.emit('link.click', d));

      this.renderDirections();
      this.icons = this.renderIcons();

      this.nodesWrapper = this.svg.select('.nodes');
      this.node = this.nodesWrapper.selectAll('.node')
        .data(filteredNodes)
        .join('g')
        .attr('class', (d) => `node ${d.nodeType || 'circle'} ${d.icon ? 'withIcon' : ''}`)
        .attr('data-i', (d) => d.index)
        .call(this.drag(this.simulation))
        .on('mouseenter', (d) => this.event.emit('node.mouseenter', d))
        .on('mouseleave', (d) => this.event.emit('node.mouseleave', d))
        .on('click', (d) => this.event.emit('node.click', d));

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
        .attr('fill', (d) => (d.icon ? `url(#i${d.index})` : ChartUtils.nodeColor()(d)));

      this.renderLinkText();

      this.simulation.on('tick', () => {
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
      });
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

  static renderDirections() {
    const directions = this.wrapper.select('.directions');

    directions.selectAll('text textPath').remove();

    this.directions = directions.selectAll('text')
      .data(this.data.links.filter((d) => d.direction && !d.hidden))
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
      .attr('fill', ChartUtils.linkColor())
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
      .data(linksData.filter((d) => !d.hidden))
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('fill', ChartUtils.linkColor())
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
      .attr('stroke', (d) => (linkIndexes.includes(d.index) ? ChartUtils.linkColor()(d) : undefined));
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

    this.event.on('node.mouseenter', (d) => {
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

    this.event.on('node.click', (d) => {
      if (this.activeButton !== 'create') {
        return;
      }
      const source = this.newLink.attr('data-source');
      if (!source) {
        this.newLink.attr('data-source', d.name)
          .attr('x1', d.fx)
          .attr('y1', d.fy)
          .attr('x2', d.fx)
          .attr('y2', d.fy);
      } else {
        const target = d.name;
        this.newLink.attr('data-source', '')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 0)
          .attr('y2', 0);
        if (source !== target) {
          this.event.emit('line.new', {
            source,
            target: d.name,
          });
        }
      }
    });

    this.event.on('click', () => {
      if (d3.event.target.tagName !== 'svg') {
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
    this.event.on('mousemove', () => {
      const source = this.newLink.attr('data-source');
      if (this.activeButton !== 'create' || !source) {
        return;
      }
      const { x, y } = this.getScaledPosition();
      this.newLink.attr('x2', x).attr('y2', y);
    });
  }

  static getScaledPosition() {
    const { x, y } = d3.event;
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
        };
      });
    }
    return this._dataLinks;
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

    const scaleW = svgWidth / width;
    const scaleH = svgHeight / height;
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
