import * as d3 from 'd3';
import _ from 'lodash';
import EventEmitter from 'events';
import { toast } from 'react-toastify';
import ChartUtils from './helpers/ChartUtils';
import ChartUndoManager from './helpers/ChartUndoManager';
import Utils from './helpers/Utils';
import SvgService from './helpers/SvgService';

class Chart {
  static event = new EventEmitter();

  /* @todo transform i mej avelacnem rotate u translate move y image i arandznacnem */
  static minWidth;

  static minHeight;

  static tPos;

  // gets the passed d3 element center coordinates
  static getElementCenter() {
    const uCords = SvgService.getImageUpdatedCoordinates();
    return {
      x: uCords.x + uCords.width / 2,
      y: uCords.y + uCords.height / 2,
    };
  }

  /**
   * Function to move the object around
   * */
  static moveObject(ev, image) {
    // increments the x/y values with the dx/dy values from the d3.event object
    this.tPos.x += ev.dx;
    this.tPos.y += ev.dy;
    // updates the translate transform values to move the object to the new point
    SvgService.updateImageTransform(
      'translate',
      `translate(${[this.tPos.x, this.tPos.y]})`,
    );
    // updates the translate coordinates in the model for further use
    SvgService.updateImageTranslateCoordinates(this.tPos.x, this.tPos.y);
    d3.select('.controls-group').attr('transform', SvgService.getTransform());
    d3.select(image).attr('transform', SvgService.getTransform());
  }

  /**
   * Function to resize the object based in the passed direction
   * */
  static resizeObject(direction, ev, size, image) {
    // gets the original image coordinates from the service model
    const updatedCoordinates = SvgService.getImageUpdatedCoordinates();
    // auxiliar variables
    let x; let y; let width; let height;
    // do the resize math based in the direction that the resize started
    switch (direction) {
      // top left
      case 'resize-tl':
        width = updatedCoordinates.width - ev.dx;
        height = updatedCoordinates.height - ev.dy;
        x = updatedCoordinates.x + (updatedCoordinates.width - width);
        y = updatedCoordinates.y + (updatedCoordinates.height - height);
        break;
      // top right
      case 'resize-tr':
        width = updatedCoordinates.width + ev.dx;
        height = updatedCoordinates.height - ev.dy;
        y = updatedCoordinates.y + (updatedCoordinates.height - height);
        break;
      // bottom left
      case 'resize-bl':
        width = updatedCoordinates.width - ev.dx;
        height = updatedCoordinates.height + ev.dy;
        x = updatedCoordinates.x + (updatedCoordinates.width - width);
        break;
      // bottom right
      default: // 'resize-br'
        width = updatedCoordinates.width + ev.dx;
        height = updatedCoordinates.height + ev.dy;
        break;
    }

    if (width > this.minWidth && height > this.minHeight) {
      // updates the image object model with the new coordinates values
      SvgService.updateImageCoordinates(width, height, x, y);
      const myImage = d3.select(image);
      console.log(width, height, myImage?.style('width').slice(0, -2))
      x && myImage.attr('x', x);
      y && myImage.attr('y', y);
      width && myImage.attr('width', width);
      height && myImage.attr('height', height);

      Chart.imageManipulation({
        width,
        height,
        x: updatedCoordinates.x,
        y: updatedCoordinates.y,
      }, myImage);
    }
  }

  /**
   * Function to rotate the object based in the initial rotation values
   * present in the rotateHandleStartPos object
   * */
  static rotateObject(rotateHandleStartPos, ev, image) {
    // gets the current udapted rotate coordinates
    const updatedRotateCoordinates = SvgService.getImageUpdatedRotateCoordinates();

    // increments the mouse event starting point with the mouse movement event
    rotateHandleStartPos.x += ev.dx;
    rotateHandleStartPos.y += ev.dy;

    // calculates the difference between the current mouse position and the center line
    const angleFinal = Chart.calcAngleDeg(
      updatedRotateCoordinates,
      rotateHandleStartPos,
    );

    // gets the difference of the angles to get to the final angle
    let angle = rotateHandleStartPos.angle + angleFinal - rotateHandleStartPos.iniAngle;

    // converts the values to stay inside the 360 positive
    angle %= 360;
    if (angle < 0) {
      angle += 360;
    }

    // creates the new rotate position array
    const rotatePos = [
      angle,
      updatedRotateCoordinates.cx,
      updatedRotateCoordinates.cy,
    ];

    // updates the transform rotate string value and the rotate info in the service model
    SvgService.updateImageTransform('rotate', `rotate(${rotatePos})`);
    // and updates the current angle with the new one
    SvgService.updateImageRotateCoordinates(angle);

    d3.select('.controls-group').attr('transform', SvgService.getTransform());
    d3.select(image).attr('transform', SvgService.getTransform());
    const myImage = d3.select(image);
    Chart.imageManipulation({
    }, myImage);
  }

  static getHandleRotatePosition(handleStartPos) {
    // its possible to use "cx/cy" for properties
    const originalX = handleStartPos.x ? handleStartPos.x : handleStartPos.cx;
    const originalY = handleStartPos.y ? handleStartPos.y : handleStartPos.cy;

    // gets the updated element center, without rotatio
    const center = this.getElementCenter();
    // calculates the rotated handle position considering the current center as
    // pivot for rotation
    const dx = originalX - center.x;
    const dy = originalY - center.y;
    const theta = (handleStartPos.angle * Math.PI) / 180;

    return {
      x: dx * Math.cos(theta) - dy * Math.sin(theta) + center.x,
      y: dx * Math.sin(theta) + dy * Math.cos(theta) + center.y,
    };
  }

  // gets the angle in degrees between two points
  static calcAngleDeg(p1, p2) {
    const p1x = p1.x ? p1.x : p1.cx;
    const p1y = p1.y ? p1.y : p1.cy;
    return (Math.atan2(p2.y - p1y, p2.x - p1x) * 180) / Math.PI;
  }

  static bindControlsDragAndDrop(size, image) {
    // auxiliar variables
    let target; let targetClass; let rotateHandleStartPos;

    // binding the behavior callback functions
    const dragData = d3.drag()
      .on('start', dragStart)
      .on('drag', dragMove)
      .on('end', dragEnd);

    /**
     * For the drag action starts
     * */
    function dragStart(ev) {
      // gets the current target element where the drag event started
      target = d3.select(ev.sourceEvent.target);
      // and saves the target element class in a aux variable
      targetClass = target.attr('class');

      // when the user is rotating the element, stores the initial angle
      // information to be used in the rotate function
      if (targetClass.indexOf('rotate') > -1) {
        // gets the updated rotate coordinates
        const updatedRotateCoordinates = SvgService.getImageUpdatedRotateCoordinates();

        // updates the rotate handle start posistion object with
        // basic information from the model and the handles
        rotateHandleStartPos = {
          angle: updatedRotateCoordinates.angle, // the current angle
          x: parseFloat(target.attr('cx')), // the current cx value of the target handle
          y: parseFloat(target.attr('cy')), // the current cy value of the target handle
        };

        // calc the rotated top & left corner
        if (rotateHandleStartPos.angle > 0) {
          const correctsRotateHandleStartPos = Chart.getHandleRotatePosition(
            rotateHandleStartPos,
          );
          rotateHandleStartPos.x = correctsRotateHandleStartPos.x;
          rotateHandleStartPos.y = correctsRotateHandleStartPos.y;
        }

        // adds the initial angle in degrees
        rotateHandleStartPos.iniAngle = Chart.calcAngleDeg(
          updatedRotateCoordinates,
          rotateHandleStartPos,
        );
      }
    }

    /**
     * For while the drag is happening
     * */
    function dragMove(ev) {
      // checks the target class to choose the right function
      // to be executed while dragging
      // #1 - If the user is moving the element around
      if (targetClass.indexOf('move') > -1) {
        Chart.moveObject(ev, image);
      } else if (targetClass.indexOf('resize') > -1) {
        // #2 - If the user is resizing the element
        Chart.resizeObject(targetClass, ev, size, image);
      } else if (targetClass.indexOf('rotate') > -1) {
        // #3 - If the user is rotating the element
        Chart.rotateObject(rotateHandleStartPos, ev, image);
      }
      // apply the scope changes for any function that might
      // have been called, to keep things updated in the service model
    }

    /**
     * For when the drag stops (the user release the element)
     * */
    function dragEnd() {
      // check if the user was resizing
      d3.select('.controls-group').remove();
      if (targetClass.indexOf('resize') > -1) {
        // updates the center of rotation after resizing the element
        const elemCenter = Chart.getElementCenter();
        SvgService.updateImageRotateCoordinates(
          null,
          elemCenter.x,
          elemCenter.y,
        );
      }
    }

    return dragData;
  }

  static drag(simulation) {
    const dragstart = (ev, d) => {
      this.event.emit('node.dragstart', ev, d);
      if (d.readOnly) {
        return;
      }
      if (ev.active) simulation.alphaTarget(0.3).restart();
      d.fixed = !!d.fx;
      // d.fx = d.x;
      // d.fy = d.y;
      // d.x = d3.event.x;
      // d.y = d3.event.y;
    };

    const dragged = (ev, d) => {
      this.event.emit('node.drag', ev, d);
      if (d.readOnly || ev.sourceEvent.shiftKey) {
        return;
      }
      d.fx = ev.x;
      d.fy = ev.y;

      d.x = ev.x;
      d.y = ev.y;

      this.graphMovement();
    };

    const dragend = (ev, d) => {
      this.event.emit('node.dragend', ev, d);

      if (d.readOnly) {
        return;
      }
      if (this.activeButton === 'view') {
        this.detectLabels(d);
      }

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
    return l.source?.id || l.source || NaN;
  }

  static getTarget(l) {
    return l.target?.id || l.target || NaN;
  }

  static normalizeData(data) {
    data.nodes = data.nodes || Chart.getNodes();
    data.links = data.links || _.cloneDeep(Chart.getLinks());
    data.labels = data.labels?.filter((d) => d.id) || Chart.getLabels();
    data.embedLabels = _.cloneDeep(data.embedLabels || this.data?.embedLabels || []);

    const labels = data.labels.map((l) => {
      l.id = l.id || ChartUtils.uniqueId(data.labels);
      return l;
    });

    if (data.embedLabels.length) {
      data.embedLabels = data.embedLabels.map((label) => {
        const labelNodes = data.nodes.filter((n) => +label.sourceId === +n.sourceId);
        label.nodes = label.nodes.map((d) => {
          d.sourceId = label.sourceId;
          d.readOnly = true;
          if (!labelNodes.some((n) => d.id === n.id)) {
            data.nodes.push(d);
          }
          return d;
        });

        // synchronize links
        label.links = label.links.map((l) => {
          l.sourceId = label.sourceId;
          l.readOnly = true;
          return l;
        });
        data.links.push(...label.links);
        // get position difference
        const labelEmbed = labels.find((l) => l.id === label.label?.id);
        if (labelEmbed) {
          label.cx = label.label.d[0][0] - labelEmbed.d[0][0];
          label.cy = label.label.d[0][1] - labelEmbed.d[0][1];
        }
        return label;
      });
      data.links = _.uniqBy(data.links, (d) => `${d.source}//${d.target}//${d.type}`);

      let removedNodes = false;
      data.nodes = data.nodes.map((d) => {
        if (!d.sourceId) {
          return d;
        }
        const labelData = data.embedLabels.find((l) => d.labels?.includes(l.labelId));
        if (!labelData) {
          console.error('can\'t find label', d);
          return d;
        }
        const labelNode = labelData.nodes.find((n) => n.id === d.id);
        if (!labelNode) {
          // remove deleted nodes
          if (!data.links.some((l) => !l.sourceId && (l.target === d.id || l.source === d.id))) {
            d.remove = true;
            console.log('remove', d);
            removedNodes = true;
          } else {
            d.deleted = true;
          }
          return d;
        }

        const name = ChartUtils.nodeUniqueName(d);
        // set node right position
        const fx = labelNode.fx - labelData.cx;
        const fy = labelNode.fy - labelData.cy;
        return {
          ...labelNode,
          name,
          sourceId: d.sourceId,
          readOnly: true,
          fx,
          fy,
          x: fx,
          y: fy,
        };
      });

      // remove unused data
      if (removedNodes) {
        data.nodes = data.nodes.filter((d) => !d.remove);
        data.links = ChartUtils.cleanLinks(data.links, data.nodes);
      }
    }

    const nodes = data.nodes.map((d) => {
      d.id = d.id || ChartUtils.uniqueId(data.nodes);
      return Object.create(d);
    });

    _.forEach(data.links, (link) => {
      const sameLinks = data.links.filter((l) => (
        (this.getSource(l) === this.getSource(link) && this.getTarget(l) === this.getTarget(link))
        || (this.getSource(l) === this.getTarget(link) && this.getTarget(l) === this.getSource(link))
      ));
      if (sameLinks.length > 1) {
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

    const lastUid = data.lastUid || this.data?.lastUid || 0;

    return {
      links, nodes, labels: data.labels, embedLabels: data.embedLabels, lastUid,
    };
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
    if (this.activeButton === 'create-label' || ev.sourceEvent?.shiftKey) {
      return;
    }
    const { transform } = ev;
    this.wrapper.attr('transform', transform)
      .attr('data-scale', transform.k)
      .attr('data-x', transform.x)
      .attr('data-y', transform.y);

    this.setAreaBoardZoom(transform);
    this.renderNodeText(transform.k);
    this.renderNodeStatusText(transform.k);
  }

  static setAreaBoardZoom(transform) {
    const scale = 1 / transform.k;
    const size = 100 * scale;
    const x = transform.x * -1;
    const y = transform.y * -1;

    // this.wrapper.select('.labelsBoard')
    //   .attr('transform', `scale(${scale}) translate(${x}, ${y})`)

    this.wrapper.selectAll('.areaBoard')
      .attr('width', `${size}%`)
      .attr('height', `${size}%`)
      .attr('x', x * scale)
      .attr('y', y * scale);
  }

  static detectLabelsProcess = false;

  static detectLabels(d = null) {
    this.data.nodes = this.data.nodes.map((n) => {
      if (d) {
        if (d.id === n.id) {
          n.labels = ChartUtils.getNodeLabels(n);
        }
      } else {
        n.labels = ChartUtils.getNodeLabels(n);
      }
      return n;
    });
    this._dataNodes = this.data.nodes;
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
        activeLine = labelsWrapper.append('path')
          .datum({
            name: '',
            color: ChartUtils.labelColors(),
            d: [],
          })
          .attr('class', 'label nodeCreate')
          .attr('data-id', (d) => d.id);
      } else if (ev.sourceEvent.target.classList.contains('label')) {
        const id = ev.sourceEvent.target.getAttribute('data-id');
        this.detectLabels();
        dragLabel.label = labelsWrapper.select(`[data-id="${id}"]`);
        dragLabel.nodes = this.getNodes().filter((d) => d.labels.includes(id));
      }
    };

    const handleDrag = (ev) => {
      if (this.activeButton === 'create-label') {
        const { x, y } = ev;
        const datum = activeLine.datum();
        datum.d.push([+x.toFixed(2), +y.toFixed(2)]);
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
          p[0] = +(p[0] + ev.dx).toFixed(2);
          p[1] = +(p[1] + ev.dy).toFixed(2);
          return p;
        });

        let readOnlyLabel;
        if (datum.readOnly) {
          readOnlyLabel = this.data.embedLabels.find((l) => l.label.id === datum.id);
        }

        this.node.each((d) => {
          if (dragLabel.nodes.some((n) => n.id === d.id)) {
            if (
              (!d.readOnly && !datum.readOnly)
              || (readOnlyLabel && readOnlyLabel.nodes.some((n) => n.id === d.id))
              || (d.deleted && d.sourceId === datum.sourceId)
            ) {
              d.fx += ev.dx;
              d.fy += ev.dy;

              d.x += ev.dx;
              d.y += ev.dy;
            }
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
        return;
      }
      this.event.emit('label.dragend', ev);
    };

    const labelsWrapper = d3.select('#graph .labels')
      .call(d3.drag()
        .on('start', handleDragStart)
        .on('drag', handleDrag)
        .on('end', handleDragEnd));

    this.labels = labelsWrapper.selectAll('path')
      .data(this.data.labels.filter((l) => l.hidden !== 1))
      .join('path')
      .attr('class', 'label nodeCreate')
      .attr('opacity', (d) => (d.sourceId ? 0.6 : 0.4))
      .attr('data-id', (d) => d.id)
      .attr('fill', ChartUtils.labelColors)
      .attr('filter', (d) => (d.sourceId ? 'url(#labelShadowFilter)' : null))
      .on('click', (ev, d) => this.event.emit('label.click', ev, d))
      .on('mouseenter', (ev, d) => this.event.emit('label.mouseenter', ev, d))
      .on('mousemove', (ev, d) => this.event.emit('label.mousemove', ev, d))
      .on('mouseleave', (ev, d) => this.event.emit('label.mouseleave', ev, d));

    this.labelMovement();

    this._dataNodes = null;
  }

  static imageManipulation(size) {
    d3.select('.controls-group').remove();
    const controlsGroup = d3.select('.nodes')
      .append('g')
      .attr('class', 'controls-group');
    controlsGroup.append('rect')
      .attr('class', 'move-rect')
      .attr('fill-opacity', '0')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', '2')
      .attr('width', size.width)
      .attr('height', size.height)
      .attr('x', size.x)
      .attr('y', size.y);

    const addResizeOption = (classAttr, fillAttr, xAttr, yAttr) => {
      controlsGroup.append('rect')
        .attr('class', classAttr)
        .attr('fill-opacity', '0')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', '2')
        .attr('fill', fillAttr)
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', xAttr)
        .attr('y', yAttr);
    };

    const addRotateOption = (classAttr, fillAttr, xAttr, yAttr) => {
      controlsGroup.append('circle')
        .attr('class', classAttr)
        .attr('stroke', '#6f2409')
        .attr('stroke-width', '2')
        .attr('fill', fillAttr)
        .attr('r', 12)
        .attr('cx', xAttr)
        .attr('cy', yAttr);
    };
    addResizeOption('resize-tl', 'white', size.x - 10, size.y - 10);
    addResizeOption('resize-tr', 'red', size.x + size.width - 10, size.y - 10);
    addResizeOption('resize-bl', 'blue', size.x - 10, size.y + size.height - 10);
    addResizeOption('resize-br', 'yellow', size.x + size.width - 10, size.y + size.height - 10);

    addRotateOption('rotate-tl', 'white', size.x - 20, size.y - 20);
    addRotateOption('rotate-tr', 'red', size.x + size.width + 20, size.y - 20);
    addRotateOption('rotate-bl', 'blue', size.x - 20, size.height + size.y + 20);
    addRotateOption('rotate-br', 'yellow', size.x + size.width + 20, size.height + size.y + 20);

    return controlsGroup;
  }

  static render(data = {}, params = {}) {
    try {
      if (!this.isCalled('render')) {
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
        .force('link', d3.forceLink(filteredLinks).id((d) => d.id))
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
        .attr('class', (d) => `node ${d.nodeType || 'circle'} ${d.icon ? 'withIcon' : ''} ${d.hidden === -1 ? 'disappear' : ''} ${d.deleted ? 'deleted' : ''}`)
        .attr('data-i', (d) => d.index)
        .call(this.drag(this.simulation))
        .on('mouseenter', (...p) => this.event.emit('node.mouseenter', ...p))
        .on('mouseleave', (...p) => this.event.emit('node.mouseleave', ...p))
        .on('dblclick', (...p) => this.event.emit('node.dblclick', ...p))
        .on('click', (...p) => this.event.emit('node.click', ...p));

      this.nodesWrapper.selectAll('.node > *').remove();

      this.nodesWrapper.selectAll('.node:not(.hexagon):not(.square):not(.triangle):not(.image)')
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

      this.nodesWrapper.selectAll('.image')
        .append('svg:image')
        .attr('preserveAspectRatio', 'none')
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y)
        .attr('xlink:href', (d) => {
          if (d.icon && d.nodeType === 'image') {
            return d.icon;
          }
          return '';
        })
        .on('click', function () {
          const size = this.getBoundingClientRect();
          const imageCoords = SvgService.getImageUpdatedCoordinates();
          if (!imageCoords.width || !imageCoords.height) {
            SvgService.updateImageCoordinates(size.width, size.height, size.x, size.y);
          }
          SvgService.updateImageTranslateCoordinates(size.x, size.y);
          Chart.minWidth = 0.1 * size.width;
          Chart.minHeight = 0.1 * size.height;
          SvgService.updateImageTranslateCoordinates(size.x, size.y);
          Chart.tPos = SvgService.getImageUpdatedTranslateCoordinates();
          const imageNewCoords = SvgService.getImageUpdatedCoordinates();
          //console.log({ x: zie, width: imageNewCoords.width, height: imageNewCoords.height }, size);
          const controlsGroup = Chart.imageManipulation(imageNewCoords);
          const elemCenter = Chart.getElementCenter();
          if (SvgService.image.rotate.angle) {
            controlsGroup.attr(
              'transform', `rotate(${SvgService.image.rotate.angle}, ${elemCenter.x}, ${elemCenter.y})`
            );
          }
          SvgService.updateImageRotateCoordinates(SvgService.image.rotate.angle || null, elemCenter.x, elemCenter.y);
          controlsGroup.call(Chart.bindControlsDragAndDrop(size, this));
        });

      this.nodesWrapper.selectAll('.node :not(text)')
        .attr('fill', (d) => {
          const color = ChartUtils.nodeColor(d);
          if (d.icon) {
            return `url(#i${d.index})`;
          }
          return color;
        });

      this.renderLinkText();
      this.renderNodeText();
      this.renderNodeStatusText();
      this.renderNewLink();
      this.renderSelectSquare();
      this.nodeFilter();
      this.windowEvents();

      this.event.emit('render', this);
      return this;
    } catch (e) {
      toast.error(`Chart Error :: ${e.message}`);
      console.error(e);
      return this;
    }
  }

  static renderSelectSquare() {
    if (this.isCalled('renderSelectSquare')) {
      return;
    }

    this.squareDara = {
      selectedNodes: [],
      nodes: [],
      labels: [],
    };

    let selectSquare;

    const showSelectedNodes = () => {
      this.nodesWrapper.selectAll('.node :not(text)')
        .attr('filter', (n) => (this.squareDara.selectedNodes.includes(n.id) ? 'url(#selectedNodeFilter)' : null));
    };

    this.event.on('node.click', (ev, d) => {
      if (!ev.shiftKey) {
        return;
      }
      const i = this.squareDara.selectedNodes.indexOf(d.id);
      if (i > -1) {
        this.squareDara.selectedNodes.splice(i, 1);
      } else {
        this.squareDara.selectedNodes.push(d.id);
      }

      showSelectedNodes();
    });

    this.event.on('window.keydown', (ev) => {
      if (!ev.shiftKey) {
        return;
      }
      const scale = 1 / (+Chart.wrapper?.attr('data-scale') || 1);
      const x = -1 * (+Chart.wrapper?.attr('data-x') || 0);
      const y = -1 * (+Chart.wrapper?.attr('data-y') || 0);
      const size = scale * 100;

      this.wrapper
        .insert('rect', '.nodes')
        .attr('class', 'selectBoard areaBoard')
        .attr('fill', 'transparent')
        .attr('width', `${size}%`)
        .attr('height', `${size}%`)
        .attr('x', x * scale)
        .attr('y', y * scale)
        .call(d3.drag()
          .on('start', handleDragStart)
          .on('drag', handleDrag)
          .on('end', handleDragEnd));
    });

    this.event.on('window.mousedown', (ev) => {
      if (ev.shiftKey || ev.which === 3) {
        return;
      }
      this.wrapper.selectAll('.selectBoard').remove();
      this.wrapper.selectAll('.selectSquare').remove();
      selectSquare = null;
      this.squareDara = {
        selectedNodes: [],
        nodes: [],
        labels: [],
      };
      showSelectedNodes();
    });

    const handleSquareDragStart = () => {
      if (selectSquare) {
        let {
          width, height, x, y,
        } = selectSquare.datum();
        if (width < 0) {
          width *= -1;
          x -= width;
        }
        if (height < 0) {
          height *= -1;
          y -= height;
        }
        const allNodes = this.getNodes();
        this.squareDara.nodes = allNodes
          .filter((d) => d.fx >= x && d.fx <= x + width && d.fy >= y && d.fy <= y + height);
        this.squareDara.labels = this.getLabels()
          .filter((l) => this.squareDara.nodes.filter((n) => n.labels.includes(l.id)).length === allNodes.filter((n) => n.labels.includes(l.id)).length)
          .map((l) => l.id);
        this.squareDara.nodes = this.squareDara.nodes.map((d) => d.id);
      }
    };

    const handleSquareDrag = (ev) => {
      if (!ev.sourceEvent.shiftKey) {
        return;
      }
      if (selectSquare) {
        const datum = selectSquare.datum();
        datum.x += ev.dx;
        datum.y += ev.dy;
        selectSquare
          .datum(datum)
          .attr('transform', (d) => `translate(${d.x} ${d.y})`);
      }

      this.node.each((d) => {
        if (this.squareDara.nodes.includes(d.id) || this.squareDara.selectedNodes.includes(d.id)) {
          if (!d.readOnly) {
            d.fx += ev.dx;
            d.x += ev.dx;

            d.fy += ev.dy;
            d.y += ev.dy;
          }
        }
      });
      this.graphMovement();
      this.labels.each((l) => {
        if (this.squareDara.labels.includes(l.id) && !l.readOnly) {
          l.d = l.d.map((p) => {
            p[0] = +(p[0] + ev.dx).toFixed(2);
            p[1] = +(p[1] + ev.dy).toFixed(2);
            return p;
          });
        }
        return l;
      });
      this.labelMovement();
    };

    const handleDragEnd = () => {
      handleSquareDragStart();
    };

    const handleSquareDragEnd = () => {
      handleSquareDragStart();
    };

    const handleDragStart = (ev) => {
      this.wrapper.select('.selectSquare').remove();
      selectSquare = this.wrapper.append('path')
        .datum({
          width: 0,
          height: 0,
          x: ev.x,
          y: ev.y,
        })
        .attr('class', 'selectSquare')
        .attr('fill', 'transparent')
        .attr('d', (d) => `M 0 0 H ${d.width} V ${d.height} H 0 L 0 0`)
        .attr('transform', (d) => `translate(${d.x} ${d.y})`)
        .call(d3.drag()
          .on('start', handleSquareDragStart)
          .on('drag', handleSquareDrag)
          .on('end', handleSquareDragEnd));
    };
    this.event.on('node.dragstart', handleSquareDragStart);
    this.event.on('node.drag', handleSquareDrag);
    this.event.on('node.dragend', handleSquareDragEnd);

    const handleDrag = (ev) => {
      const datum = selectSquare.datum();
      datum.width += ev.dx;
      datum.height += ev.dy;
      selectSquare
        .datum(datum)
        .attr('d', (d) => `M 0 0 H ${d.width} V ${d.height} H 0 L 0 0`);
    };
  }

  static labelMovement = () => {
    const renderPath = d3.line()
      .x((d) => d[0])
      .y((d) => d[1])
      .curve(d3.curveBasis);
    this.labels.attr('d', (d) => renderPath(d.d));
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
      .attr('transform', (d) => d.nodeType !== 'image' ? `translate(${d.x || 0}, ${d.y || 0})` : '')
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

  static renderNodeStatusText(scale) {
    if (!scale && !this.wrapper.empty()) {
      // eslint-disable-next-line no-param-reassign
      scale = +this.wrapper.attr('data-scale') || 1;
    }

    // this.nodesWrapper.selectAll('.node text').remove();

    this.nodesWrapper.selectAll('.node')
      .filter((d) => {
        if (d.status !== 'draft') {
          return false;
        }
        if (scale >= 0.8) {
          return true;
        }
        if (this.radiusList[d.index] < 11) {
          return false;
        }
        return true;
      })
      .append('text')
      .attr('y', 3)
      .attr('x', 3)
      .attr('class', 'draft')
      .attr('font-size', (d) => 20.5 + (this.radiusList[d.index] - (d.icon ? 4.5 : 0)) / 4)
      .text('draft');
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
      if (dragActive || ev.shiftKey) return;
      const links = this.getNodeLinks(d.id, 'all');
      links.push({ source: d.id, target: d.id });
      const nodeIds = new Set();
      links.forEach((l) => {
        nodeIds.add(l.source);
        nodeIds.add(l.target);
      });

      const hideNodes = this.node.filter((n) => !nodeIds.has(n.id));
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
      if (ev.shiftKey || d.nodeType === 'image') {
        return;
      }
      //d3.select('.controls-group').remove();
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
      if ((d.fx || d.x) === undefined || (d.fy || d.y) === undefined) {
        return;
      }
      if (!source) {
        this.newLink.attr('data-source', d.id)
          .attr('x1', d.fx || d.x)
          .attr('y1', d.fy || d.y)
          .attr('x2', d.fx || d.x)
          .attr('y2', d.fy || d.y);
      } else {
        const target = d.id;
        this.newLink.attr('data-source', '')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 0)
          .attr('y2', 0);
        if (source === target) {
          return;
        }
        const sourceNode = ChartUtils.getNodeById(source);
        const targetNode = ChartUtils.getNodeById(target);
        if (sourceNode.sourceId && targetNode.sourceId && sourceNode.labels.some((l) => targetNode.labels.includes(l))) {
          return;
        }
        this.event.emit('link.new', ev, {
          source,
          target: d.id,
        });
      }
    });

    this.event.on('click', (ev) => {
      if (!ev.target.parentNode || ev.target.parentNode.classList.contains('node')) {
        return;
      }
      //d3.select('.controls-group').remove();
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

  static getNodeLinks(nodeId, type = 'target') {
    const links = this.getLinks();
    return links.filter((d) => (type === 'all' ? d.source === nodeId || d.target === nodeId : d[type] === nodeId));
  }

  static getNodeLinksNested(nodeId) {
    let links = this.getNodeLinks(nodeId);
    if (links.length) {
      links.forEach((d) => {
        links = [...links, ...this.getNodeLinksNested(d.target)];
      });
    }
    return links;
  }

  static setNodeData(nodeId, data, forceRender = false) {
    this.data.nodes = this.getNodes().map((d) => {
      if (d.id === nodeId) {
        d = { ...d, ...data };
      }
      return d;
    });
    this._dataNodes = null;
    if (forceRender) {
      this.render();
    }
    this.event.emit('setNodeData', nodeId, data);
  }

  static getNodes(force = false) {
    if (_.isEmpty(this.data)) {
      return [];
    }
    if (!this._dataNodes || force) {
      this._dataNodes = this.data.nodes.map((d) => ({
        id: d.id,
        index: d.index,
        fx: d.fx || d.x || 0,
        fy: d.fy || d.y || 0,
        name: d.name || '',
        type: d.type || '',
        status: d.status || 'approved',
        nodeType: d.nodeType || 'circle',
        description: d.description || '',
        icon: d.icon || '',
        link: d.link || '',
        hidden: d.hidden,
        keywords: d.keywords || [],
        location: d.location || undefined,
        color: ChartUtils.nodeColor(d),
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        createdUser: d.createdUser,
        updatedUser: d.updatedUser,
        readOnly: !!d.readOnly || undefined,
        sourceId: +d.sourceId || undefined,
        labels: ChartUtils.getNodeLabels(d),
      }));
    }
    return this._dataNodes;
  }

  // deprecated
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
          color: ChartUtils.linkColor(d),
          createdAt: pd.createdAt,
          updatedAt: pd.updatedAt,
          createdUser: pd.createdUser,
          updatedUser: pd.updatedUser,
          readOnly: pd.readOnly,
          sourceId: +pd.sourceId || undefined,
        };
      });
    }
    return this._dataLinks;
  }

  static getLabels() {
    if (_.isEmpty(this.data)) {
      return [];
    }
    return _.uniqBy(this.data.labels || [], 'id');
  }

  static get activeButton() {
    return d3.select('#graph').attr('data-active');
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

    // this.nodesWrapper.selectAll('.node text')
    //   .attr('font-family', 'Open Sans')
    //   .attr('dominant-baseline', 'middle')
    //   .attr('stroke', 'white')
    //   .attr('fill', '#0D0905')
    //   .attr('text-anchor', 'middle')
    //   .attr('stroke-width', 0);
    //
    // this.nodesWrapper.selectAll('.node :not(text)')
    //   .attr('stroke', 'white')
    //   .attr('stroke-width', 10);
    //
    // this.nodesWrapper.selectAll('.node.withIcon :not(text)')
    //   .attr('stroke-width', 1.5);

    const html = document.querySelector('#graph svg').outerHTML;

    // reset original styles
    const { x: oX, y: oY, scale: oScale } = originalDimensions;
    this.wrapper.attr('transform', `translate(${oX}, ${oY}), scale(${oScale})`)
      .attr('data-scale', oScale)
      .attr('data-x', oX)
      .attr('data-y', oY);

    this.linksWrapper.selectAll('path')
      .attr('fill', undefined);

    // this.wrapper.selectAll('.unChecked')
    //   .attr('style', undefined);
    //
    // this.nodesWrapper.selectAll('.node text')
    //   .attr('font-family', undefined)
    //   .attr('dominant-baseline', undefined)
    //   .attr('stroke', undefined)
    //   .attr('stroke-width', undefined)
    //   .attr('fill', undefined)
    //   .attr('text-anchor', undefined);
    //
    // this.nodesWrapper.selectAll('.node :not(text)')
    //   .attr('stroke', undefined)
    //   .attr('stroke-width', undefined);

    this.resizeSvg();

    return html;
  }

  static windowEvents() {
    if (this.isCalled('windowEvents')) {
      return;
    }
    window.addEventListener('resize', this.resizeSvg);
    window.addEventListener('keydown', this.handleWindowKeyDown);
    window.addEventListener('keyup', this.handleWindowKeyUp);
    window.addEventListener('mousedown', this.handleWindowMouseDown, { capture: true });
  }

  static handleWindowKeyDown = (ev) => {
    ChartUtils.keyEvent(ev);
    this.event.emit('window.keydown', ev);
  }

  static handleWindowKeyUp = (ev) => {
    ChartUtils.keyEvent(ev);
    this.event.emit('window.keyup', ev);
  }

  static handleWindowMouseDown = (ev) => {
    ChartUtils.keyEvent(ev);
    this.event.emit('window.mousedown', ev);
  }

  static unmount() {
    this.svg.remove();
    this.#calledFunctions = [];
    this.data = {
      nodes: [],
      links: [],
      labels: [],
      embedLabels: [],
    };
    this.event.removeAllListeners();
    this.undoManager.reset();
    ChartUtils.resetColors();
    window.removeEventListener('resize', this.resizeSvg);
    window.removeEventListener('keydown', this.handleWindowKeyDown);
    window.removeEventListener('keyup', this.handleWindowKeyUp);
    window.removeEventListener('mousedown', this.handleWindowMouseDown);
  }
}

export default Chart;
