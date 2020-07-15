import * as d3 from 'd3';
import _ from 'lodash';
import EventEmitter from 'events';
import { toast } from 'react-toastify';
import ChartUtils from "./helpers/ChartUtils";

class Chart {
  static event = new EventEmitter();

  static drag(simulation) {
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    const dragended = () => {
      if (!d3.event.active) simulation.alphaTarget(0);
      this.data.nodes = simulation.nodes().map((d) => ({
        fx: d.fx || d.x,
        fy: d.fy || d.y,
        name: d.name,
        type: d.type,
      }));
      sessionStorage.setItem('d3Data', JSON.stringify(this.data));
    };

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  static color() {
    const scale = d3.scaleOrdinal(d3.schemeCategory10);
    return (d) => scale(d.type);
  }

  static normalizeData(data) {
    const links = data.links.map((d) => Object.create(d));
    const nodes = data.nodes.map((d) => Object.create(d));
    return { links, nodes };
  }

  static svgSize = () => {
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
    if (this.originalData.nodes[0] && this.originalData.nodes[0].fx === undefined) {
      const graph = document.querySelector('#graph');
      if (!graph) {
        return null;
      }
      const { width, height } = graph.getBoundingClientRect();
      this.simulation = this.simulation
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('charge', d3.forceManyBody())
        .force('x', d3.forceX((d) => {
          const { length } = this.getNodeLinksNested(d.name);
          if (length) {
            return d.x * length * 8;
          }
          return d.x + 4;
        }))
        .force('y', d3.forceY((d) => {
          const { length } = this.getNodeLinksNested(d.name);
          if (length) {
            return d.y * length * 8;
          }
          return d.y + 4;
        }));
    }
    return null;
  }

  static renderDirection() {
    if (d3.select('#graphDirection').empty()) {
      d3.select('#graph svg')
        .append('path')
        .attr('id', 'graphDirection')
        .attr('stroke-width', 1)
        .attr('stroke', 'black')
        .attr('stroke-opacity', 1)
        .attr('transform-origin', 'top left')
        //.attr('d', 'M388.425,241.951L151.609,5.79c-7.759-7.733-20.321-7.72-28.067,0.04c-7.74,7.759-7.72,20.328,0.04,28.067l222.72,222.105    L123.574,478.106c-7.759,7.74-7.779,20.301-0.04,28.061c3.883,3.89,8.97,5.835,14.057,5.835c5.074,0,10.141-1.932,14.017-5.795    l236.817-236.155c3.737-3.718,5.834-8.778,5.834-14.05S392.156,245.676,388.425,241.951z')
        // eslint-disable-next-line max-len
        .attr('d', 'M 11.378906 7.089844 L 4.441406 0.167969 C 4.214844 -0.0585938 3.847656 -0.0546875 3.621094 0.171875 C 3.394531 0.398438 3.394531 0.765625 3.621094 0.992188 L 10.144531 7.5 L 3.621094 14.007812 C 3.394531 14.234375 3.390625 14.601562 3.621094 14.828125 C 3.734375 14.941406 3.882812 15 4.03125 15 C 4.179688 15 4.328125 14.945312 4.441406 14.832031 L 11.378906 7.910156 C 11.488281 7.800781 11.550781 7.65625 11.550781 7.5 C 11.550781 7.34375 11.488281 7.199219 11.378906 7.089844 Z M 11.378906 7.089844 ');
    }
  }

  static render(data = {}, params = {}) {
    try {
      this._dataNodes = null;
      this._dataLinks = null;
      data.nodes = data.nodes || Chart.getNodes();
      data.links = data.links || Chart.getLinks();

      new Promise(() => {
        this.originalData = _.cloneDeep(data);
      });
      this.data = this.normalizeData(data);
      this.data = ChartUtils.filter(data, params.filters);

      this.simulation = d3.forceSimulation(this.data.nodes)
        .force('link', d3.forceLink(this.data.links).id((d) => d.name));

      this.autoPosition();

      this.svg = d3.select('#graph svg');

      if (this.svg.empty()) {
        this.svg = d3.select('#graph').append('svg');
      }

      this.svg = this.svg
        .call(d3.zoom().on('zoom', () => {
          const { transform } = d3.event;
          this.wrapper.attr('transform', transform)
            .attr('data-scale', transform.k)
            .attr('data-x', transform.x)
            .attr('data-y', transform.y);
        }))
        .on('click', (d) => this.event.emit('click', d))
        .on('mousemove', (d) => this.event.emit('mousemove', d));

      this.svgSize();

      this.wrapper = this.svg.select('.wrapper');
      if (this.wrapper.empty()) {
        this.wrapper = this.svg.append('g').attr('class', 'wrapper').attr('transform-origin', 'top left');
      }

      this.links = this.svg.select('.links');
      if (this.links.empty()) {
        this.links = this.wrapper.append('g')
          .attr('class', 'links')
          .attr('stroke-opacity', 0.6);
      }

      this.link = this.links.selectAll('g')
        .data(this.data.links)
        .join('g')
        .attr('class', 'link');

      this.links.selectAll('.link')
        .append('line')
        .attr('stroke-dasharray', (d) => ChartUtils.dashType(d.type, d.value || 1))
        .attr('stroke-linecap', (d) => ChartUtils.dashLinecap(d.type))
        .attr('data-i', (d) => d.index)
        .attr('stroke', this.color())
        .attr('stroke-width', (d) => d.value || 1)
        .on('click', (d) => this.event.emit('link.click', d));


      this.links.selectAll('.link')
        .append('g')
        .attr('class', 'direction');

      this.links.selectAll('.direction')
        .append('use')
        .attr('href', '#graphDirection');


      this.nodes = this.svg.select('.nodes');
      if (this.nodes.empty()) {
        this.nodes = this.wrapper.append('g').attr('class', 'nodes');
      }

      this.node = this.nodes.selectAll('g')
        .data(this.data.nodes)
        .join('g')
        .attr('class', (d) => `node ${d.icon ? 'image' : 'circle'}`.trim())
        .attr('fill', (d) => d.color || this.color()(d))
        .attr('data-i', (d) => d.index)
        .call(this.drag(this.simulation))
        .on('click', (d) => this.event.emit('node.click', d))
        .on('mouseenter', (d) => this.event.emit('node.mouseenter', d))
        .on('mouseleave', (d) => this.event.emit('node.mouseleave', d));

      this.node.selectAll('*').remove();

      const radiusList = this.data.nodes.map((d) => this.getNodeLinksNested(d.name).length * 2 + 10);

      this.nodes.selectAll('.image')
        .append('image')
        .attr('width', (d) => radiusList[d.index] * 2)
        .attr('height', (d) => radiusList[d.index] * 2)
        .attr('transform', (d) => `translate(${radiusList[d.index] * -1}, ${radiusList[d.index] * -1})`)
        .attr('href', (d) => d.icon);

      this.nodes.selectAll('.circle')
        .append('circle')
        .attr('r', (d) => radiusList[d.index]);

      this.nodes.selectAll('.node')
        .append('text')
        .attr('x', (d, i) => radiusList[i] + 5)
        .text((d) => d.name);

      this.node.selectAll('._new *').remove();

      this.simulation.on('tick', () => {
        this.link.selectAll('line')
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y);

        this.link.selectAll('.direction')
          .attr('transform', (d) => {
            return `translate(${d.target.x - 50 || 0}, ${d.target.y - 10 || 0 })`
          })

        this.link.selectAll('use')
          .attr('transform', (d) => {
            const rad = Math.atan2(d.target.x - d.source.x, d.target.y - d.source.y);
            const deg = rad * (180 / Math.PI) * -1 + 90
            return `rotate(${deg})`
          });

        this.node
          .attr('transform', (d) => `translate(${d.x || 0}, ${d.y || 0})`)
          .attr('class', (d) => `node ${d.icon ? 'image' : 'circle'} ${d.vx !== 0 ? 'auto' : ''}`.trim());
        this._dataNodes = null;
        this._dataLinks = null;
      });

      this.renderNewLink();
      this.renderDirection();
      return this;
    } catch (e) {
      toast.error(`Chart Error :: ${e.message}`);
      console.error(e);
      return false;
    }
  }

  static renderNewLink() {
    if (this.wrapper.empty() || !this.wrapper.select('#addNewLink').empty()) {
      return;
    }
    this.newLink = this.wrapper.append('line')
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
        const links = this.getLinks();
        const linkExists = links.some((l) => (l.source === source && l.target === target)
          || (l.source === target && l.target === source));

        if (source !== target && !linkExists) {
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
    return this.calcScaledPosition(x, y);
  }

  static calcScaledPosition(x = 0, y = 0) {
    const moveX = +this.wrapper?.attr('data-x') || 0;
    const moveY = +this.wrapper?.attr('data-y') || 0;
    const scale = +this.wrapper?.attr('data-scale') || 1;
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

  static getDocumentPosition(i) {
    const node = document.querySelector(`#graph .node:nth-child(${i + 1})`);
    return node.getBoundingClientRect();
  }

  static getNodeLinks(name) {
    const links = this.getLinks();
    return links.filter((d) => d.source === name);
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

  static pathCircle(d) {
    return `M ${d.x || d.fx || 0}, ${d.y || d.fx || 0}
          m -${d.value}, 0
          a ${d.value},${d.value} 0 1,1 ${d.value * 2},0
          a ${d.value},${d.value} 0 1,1 -${d.value * 2},0`.replace(/\n/g, ' ');
  }

  static getNodes() {
    if (_.isEmpty(this.data)) {
      return [];
    }
    if (!this._dataNodes) {
      this._dataNodes = this.originalData.nodes.map((od) => {
        const d = this.data.nodes.find((o) => o.name === od.name) || {};
        return {
          fx: d.fx || od.fx || d.x || 0,
          fy: d.fy || od.fx || d.y || 0,
          name: d.name || od.name || '',
          type: d.type || od.type || '',
          description: d.description || od.description || '',
          icon: d.icon || od.icon || '',
          color: d.color || od.color || '',
          link: d.link || od.link || '',
        };
      });
    }

    return this._dataNodes;
  }

  static getLinks() {
    if (_.isEmpty(this.data)) {
      return [];
    }
    if (!this._dataLinks) {
      this._dataLinks = this.originalData.links.map((od) => {
        const d = this.data.links.find((o) => o.source === od.source && o.target === od.target) || {};
        const pd = Object.getPrototypeOf(d);
        return {
          source: pd.source || d.source || od.source || '',
          target: pd.target || d.target || od.target || '',
          value: pd.value || d.value || od.value || '',
          type: pd.type || d.type || od.type || '',
          description: pd.description || d.description || od.description || '',
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
    this.event.removeAllListeners();
  }

  static printMode(svgWidth, svgHeight) {
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

    const {
      left: svgLeft, top: svgTop,
    } = document.querySelector('#graph svg').getBoundingClientRect();

    const {
      left, top, width, height,
    } = document.querySelector('#graph .nodes').getBoundingClientRect();

    const scaleW = svgWidth / width;
    const scaleH = svgHeight / height;
    const scale = Math.min(scaleW, scaleH);

    const y = -1 * (top - svgTop) * scale + (svgHeight - height * scale);
    const x = -1 * (left - svgLeft) * scale + (svgWidth - width * scale);

    Chart.wrapper.attr('transform', `translate(${x}, ${y}), scale(${scale})`)
      .attr('data-scale', scale)
      .attr('data-x', x)
      .attr('data-y', y);

    this.nodes.selectAll('.node text')
      .attr('font-family', 'Roboto')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', 20)
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5);

    this.nodes.selectAll('.node circle')
      .attr('stroke', 'white')
      .attr('stroke-width', 1.5);


    return () => {
      // eslint-disable-next-line no-shadow
      const { x, y, scale } = originalDimensions;
      this.wrapper.attr('transform', `translate(${x}, ${y}), scale(${scale})`)
        .attr('data-scale', scale)
        .attr('data-x', x)
        .attr('data-y', y);

      this.nodes.selectAll('.node text')
        .attr('font-family', undefined)
        .attr('dominant-baseline', undefined)
        .attr('font-size', undefined)
        .attr('stroke', undefined)
        .attr('stroke-width', undefined);

      this.nodes.selectAll('.node circle')
        .attr('stroke', undefined)
        .attr('stroke-width', undefined);

      this.svgSize();
    };
  }
}

window.addEventListener('resize', Chart.svgSize);

export default Chart;
