import * as d3 from 'd3';
import memoizeOne from 'memoize-one';
import Chart from '../Chart';
import ChartUtils from './ChartUtils';

class ChartInfography {
  static render = (chart) => {
    chart.nodesWrapper.selectAll('.infography rect')
      .on('mousemove', (ev, d) => {
        ChartUtils.keyEvent(ev);
        const { parentNode } = ev.target;
        if (ev.shiftKey) {
          if (!parentNode.classList.contains('crop')) {
            parentNode.classList.add('crop');
          }
        } else if (parentNode.classList.contains('crop')) {
          parentNode.classList.remove('crop');
          this.dragend(ev, d);
        }
      });
  }

  static renderPath = d3.line()
    .x((i) => i[0])
    .y((i) => i[1])
    .curve(d3.curveBasis);

  static dragstart = (ev, d) => {
    Chart.event.emit('infography.cut', ev, d);
    const node = Chart.wrapper.select(`[data-i="${d.index}"]`);

    const line = node.append('path')
      .datum({
        d: [],
      })
      .attr('class', 'nodeCut');
    this.activeNode = {
      node, line,
    };
  }

  static dragged = (ev, d) => {
    if (!this.activeNode?.line) {
      return;
    }
    Chart.event.emit('infography.cut', ev, d);
    const { line, node } = this.activeNode;
    const { x, y } = ChartUtils.calcScaledPosition(ev.sourceEvent.clientX, ev.sourceEvent.clientY);
    const x1 = +(x - d.fx).toFixed(2);
    const y1 = +(y - d.fy).toFixed(2);
    const datum = line.datum();
    datum.d.push([x1, y1]);
    line.datum(datum)
      .attr('d', (i) => this.renderPath(i.d));
  }

  static dragend = (ev, d) => {
    if (!this.activeNode?.line) {
      return;
    }
    const { line } = this.activeNode;
    const datum = line.datum();
    datum.d = ChartUtils.coordinatesCompass(datum.d, 3);
    line.datum(datum)
      .attr('d', (i) => this.renderPath(i.d));

    Chart.event.emit('node.edit', ev, {
      name: d.name,
      icon: d.icon,
      fx: d.fx,
      fy: d.fy,
      nodeType: 'infography',
      type: d.type,
      d: datum.d,
      infographyId: d.id,
      editPartial: true,
    });

    line.remove();
    this.activeNode = {};
  }

  static getPolygonSize = memoizeOne((rect) => {
    try {
      const x = rect.map((d) => d[0]);
      const y = rect.map((d) => d[1]);

      const minX = Math.min(...x);
      const maxX = Math.max(...x);

      const minY = Math.min(...y);
      const maxY = Math.max(...y);

      const width = maxX - minX;
      const height = maxY - minY;

      return {
        width,
        height,
        min: [minX, minY],
        max: [maxX, maxY],
      };
    } catch (e) {
      return {
        width: 512,
        height: 384,
      };
    }
  })

  static getRectDimensions = memoizeOne((rect) => {
    try {
      return rect.getBoundingClientRect();
    } catch (e) {
      return {
        width: 512,
        height: 384,
      };
    }
  })
}

export default ChartInfography;
