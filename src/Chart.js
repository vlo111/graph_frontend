import * as d3 from 'd3';
import _ from 'lodash';
import EventEmitter from 'events';
import { toast } from 'react-toastify';


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

  static getGraphContainer = () => new Promise((resolve) => {
    let graph = document.querySelector('#graph');
    if (graph) {
      resolve(graph);
    } else {
      const interval = setInterval(() => {
        graph = document.querySelector('#graph');
        if (graph) {
          clearInterval(interval);
          resolve(graph);
        }
      }, 100);
    }
  })

  static render(data) {
    try {
      this._dataNodes = null;
      this._dataLinks = null;
      data.nodes = data.nodes || Chart.getNodes();
      data.links = data.links || Chart.getLinks();

      this.originalData = data;
      this.data = this.normalizeData(data);


      this.simulation = d3.forceSimulation(this.data.nodes)
        .force('link', d3.forceLink(this.data.links).id((d) => d.name));

      this.svg = d3.select('#graph svg');

      if (this.svg.empty()) {
        this.svg = d3.select('#graph').append('svg');
      }

      this.svg = this.svg
        .call(d3.zoom().on('zoom', () => {
          const { transform } = d3.event;
          this.wrapper.attr('transform', transform);
          this.wrapper.attr('data-scale', transform.k);
          this.wrapper.attr('data-x', transform.x);
          this.wrapper.attr('data-y', transform.y);
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
      this.link = this.links.selectAll('line')
        .data(this.data.links)
        .join('line')
        .attr('data-i', (d) => d.index)
        .attr('stroke', this.color())
        .attr('stroke-width', (d) => d.value || 1)
        .on('click', (d) => this.event.emit('link.click', d));


      this.nodes = this.svg.select('.nodes');
      if (this.nodes.empty()) {
        this.nodes = this.wrapper.append('g').attr('class', 'nodes');
      }

      this.node = this.nodes.selectAll('g')
        .data(this.data.nodes)
        .join('g')
        .attr('class', (d) => `node ${d.icon ? 'image' : 'circle'}`.trim())
        .attr('fill', this.color())
        .attr('data-i', (d) => d.index)
        .call(this.drag(this.simulation))
        .on('click', (d) => this.event.emit('node.click', d))
        .on('mouseenter', (d) => this.event.emit('node.mouseenter', d))
        .on('mouseleave', (d) => this.event.emit('node.mouseleave', d));

      this.node.selectAll('*').remove();

      this.nodes.selectAll('.image')
        .append('image')
        .attr('width', (d) => d.value * 10)
        .attr('height', (d) => d.value * 10)
        .attr('transform', (d) => `translate(${d.value * -5}, ${d.value * -5})`)
        .attr('href', (d) => d.icon);

      this.nodes.selectAll('.circle')
        .append('circle')
        .attr('r', (d) => d.value * 5)
        .attr('href', (d) => d.icon);

      this.nodes.selectAll('.node')
        .append('text')
        .attr('x', (d) => d.value * 5 + 10)
        .text((d) => d.name);

      this.node.selectAll('._new *').remove();


      this.simulation.on('tick', () => {
        this.link
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y);
        this.node
          .attr('transform', (d) => `translate(${d.x || 0}, ${d.y || 0})`);
        this._dataNodes = null;
        this._dataLinks = null;
      });

      this.renderNewLink();
      return this;
    } catch (e) {
      toast.error(`Chart Error :: ${e.message}`);
      console.error(e);
      return false;
    }
  }

  static renderNewLink() {
    if (!this.wrapper.select('#addNewLink').empty()) {
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
      this._dataNodes = this.data.nodes.map((d) => {
        const od = this.originalData.nodes.find((o) => o.name === d.name);
        return {
          fx: d.fx || od.fx || '',
          fy: d.fy || od.fx || '',
          name: d.name || od.name || '',
          type: d.type || od.type || '',
          value: d.value || od.value || '',
          icon: d.icon || od.icon || '',
          description: d.description || od.description || '',
          files: d.files || od.files || '',
          links: d.links || od.links || '',
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
      this._dataLinks = this.data.links.map((d) => {
        const pd = Object.getPrototypeOf(d);
        return {
          source: pd.source || d.source || '',
          target: pd.target || d.target || '',
          value: pd.value || d.value || '',
        };
      });
    }
    return this._dataLinks;
  }

  static getStorageData() {
    let data;
    try {
      data = JSON.parse(sessionStorage.getItem('d3Data'));
    } catch (e) {
      //
    }
    return data || [];
  }

  static saveStorageData(data) {
    sessionStorage.setItem('d3Data', JSON.stringify(data));
  }

  static get activeButton() {
    return d3.select('#graph').attr('data-active');
  }

  static unmount() {
    this.svg.remove();
    this.event.removeAllListeners();
  }

  static saveData = () => {
    const nodes = this.getNodes();
    const links = this.getLinks();
    const data = this.getStorageData();
    data.length = 9;
    data.unshift({ nodes, links });
    this.saveStorageData(data);
  }
}

window.addEventListener('resize', Chart.svgSize);


export default Chart;
