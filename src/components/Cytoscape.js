import React, { useState, useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import AddNodeModal from './chart/AddNodeModal';
import ChartUtils from '../helpers/ChartUtils';
import Chart from '../Chart';
import { ReactComponent as CircleSvg } from '../assets/images/icons/layout-circle.svg';
import { ReactComponent as ConcentricSvg } from '../assets/images/icons/layout-concentric.svg';
import { ReactComponent as RandomSvg } from '../assets/images/icons/layout-random.svg';
import { ReactComponent as CoseSvg } from '../assets/images/icons/layout-cose.svg';
import { ReactComponent as BreadthSvg } from '../assets/images/icons/layout-breadth.svg';
import { ReactComponent as GridSvg } from '../assets/images/icons/layout-grid.svg';

const Cytoscape = ({ nodes, links, history }) => {
  const style = [
    {
      selector: 'node.highlight',
      style: {
        'border-color': '#FFF',
        'border-width': '2px',
      },
    },
    {
      selector: 'node.semitransp',
      style: { opacity: '0.5' },
    },
    {
      selector: 'edge.highlight',
      style: { 'mid-target-arrow-color': '#FFF' },
    },
    {
      selector: 'edge.semitransp',
      style: { opacity: '0.2' },
    },

    {
      selector: 'node',
      css: {
        content: 'data(label)',
        // "text-valign": "center",
        // "text-halign": "center",
        // height: "60px",
        // width: "100px",
        'border-color': 'data(color)',
        'border-opacity': '1',
        'border-width': '14px',
        'background-color': 'white',
      },
    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'haystack',
        'haystack-radius': 0,
        width: 5,
        opacity: 0.5,
        'line-color': '#a8eae5',
      },
      css: {
        'curve-style': 'bezier',
        'control-point-step-size': 40,
        'target-arrow-shape': 'triangle',
        'background-color': 'data(color)',
      },
    },
  ];
  const [nodeShape, setNodeShape] = useState('');
  const [cLayout, setLayout] = useState('circle');
  const [row, setRow] = useState(10);
  const [column, setColumn] = useState(10);
  const [openGrid, setOpenGrid] = useState(false);

  const cyRef = useRef();

  const cyClick = (evt) => {
    // runs many times
    // myCyRef.add({
    //   group: 'nodes',
    //   data: { weight: 75 },
    //   position: {
    //     x: evt.position.x,
    //     y: evt.position.y,
    //   },
    //   style: { shape: nodeShape },
    // });
  };

  const layout = {
    name: cLayout,
    // 'draft', 'default' or 'proof"
    // - 'draft' fast cooling rate
    // - 'default' moderate cooling rate
    // - "proof" slow cooling rate
    quality: 'default',
    levelWidth(nodes) {
      return 8;
    },
    concentric(node) {
      return node.degree();
    },
    initialEnergyOnIncremental: 0.5,
    idealEdgeLength: 50,
    refresh: 30,
    rows: row,
    columns: column,
    fit: true, // whether to fit to viewport
    padding: 100, // fit padding
    boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    animate: 'end', // whether to transition the node positions
    animationDuration: 1500, // duration of animation in ms if enabled
    animationEasing: undefined, // easing of animation if enabled
    animationThreshold: 250,
    // a function that determines whether the node should be animated.
    // All nodes animated by default on animate enabled.
    // Non-animated nodes are positioned immediately when the layout starts
    animateFilter(node, i) { return true; },
    ready: undefined, // callback on layoutready
    stop: undefined, // callback on layoutstop
    // transform a given node position. Useful for changing flow direction in discrete layouts
    transform(node, position) { return position; },
    nodeDimensionsIncludeLabels: false,
    randomize: false,
    componentSpacing: 40,
    nodeRepulsion(node) {
      return 2048;
    },
    nodeOverlap: 4,
    edgeElasticity(edge) {
      return 32;
    },
    nestingFactor: 1.2,
    gravity: 1,
    numIter: 1000,
    initialTemp: 1000,
    coolingFactor: 0.99,
    minTemp: 1.0,
    // Whether to tile disconnected nodes
    tile: true,
    // Amount of vertical space to put between degree zero nodes during tiling (can also be a function)
    tilingPaddingVertical: 10,
    // Amount of horizontal space to put between degree zero nodes during tiling (can also be a function)
    tilingPaddingHorizontal: 10,
    // Gravity range (constant) for compounds
    gravityRangeCompound: 1.5,
    // Gravity force (constant) for compounds
    gravityCompound: 1.0,
    // Gravity range (constant)
    gravityRange: 3.8,
  };
  const cNodes = [];
  const cLink = [];

  nodes.forEach((n) => {
    const color = ChartUtils.nodeColorObj[n.type] || 'red';
    cNodes.push({
      data: { id: n.id, label: n.name, color },
      // position: { x: n.fx, y: n.fy },
      shape: 'triangle',
    });
  });

  links.forEach((l) => {
    if (nodes.filter((p) => ((p.id === l.source) || (p.id === l.target)))[0]) {
      const color = ChartUtils.linkColorObj[l.type] || 'red';
      cLink.push({
        data: {
          source: l.source,
          target: l.target,
          label: l.type,
          color,
        },
      });
    }
  });

  const clearRefs = (...refs) => refs.forEach(
    (ref) => ref.current && ref.current.destroy(),
  );

  useEffect(() => {
    if (cyRef.current) {
      // cy.on('click', (evt) => {
      //   cyClick(evt);
      //   console.log('Hello');
      // });

      // cyRef.current.on('tap', 'node', (evt) => {
      //   const node = evt.target;
      //   // console.log("EVT", evt);
      //   // console.log("TARGET", node.data());
      //   // console.log("TARGET TYPE", typeof node[0]);
      //   console.log('TARGET ID', node.id());
      // });

      let tappedBefore;
      let tappedTimeout;
      cyRef.current.on('tap', (event) => {
        const tappedNow = event.target;
        if (tappedTimeout && tappedBefore) {
          clearTimeout(tappedTimeout);
        }
        if (tappedBefore === tappedNow) {
          tappedNow.trigger('doubleTap');
          tappedBefore = null;
        } else {
          tappedTimeout = setTimeout(() => { tappedBefore = null; }, 300);
          tappedBefore = tappedNow;
        }
      });

      cyRef.current.on('doubleTap', 'node', (event) => {
        const node = event.target;
        if (node.selected()) {
          const singleNode = nodes.filter((n) => n.id === node.id())[0];

          Chart.render({ nodes: [singleNode], links: [], labels: [] }, { ignoreAutoSave: true, isAutoPosition: false });

          const queryObj = queryString.parse(window.location.search);
          queryObj.info = node.id();
          const query = queryString.stringify(queryObj);
          history.replace(`?${query}`);
        }
      });

      // REMOVING
      // cy.on('cxttap', 'node', (evt) => {
      //   const tgt = evt.target || evt.cyTarget; // 3.x || 2.x
      //
      //   tgt.remove();
      // });
      //
      // cy.on('cxttap', 'edge', (evt) => {
      //   const tgt = evt.target || evt.cyTarget; // 3.x || 2.x
      //
      //   tgt.remove();
      // });

      // add new node
      // cy.on('mouseover', 'node', function (evt) {
      //   myCyRef.update()
      //
      //   document.body.style.cursor = 'pointer';
      // } );
      //
      // cy.on('mouseout', 'node', function (evt) {
      //   document.body.style.cursor = 'auto';
      // });

      cyRef.current.on('mouseover', 'node', (e) => {
        document.body.style.cursor = 'pointer';

        const sel = e.target;
        cyRef.current.elements().difference(sel.outgoers()).not(sel).addClass('semitransp');
        sel.addClass('highlight').outgoers().addClass('highlight');
      });

      cyRef.current.on('mouseout', 'node', (e) => {
        document.body.style.cursor = 'auto';

        const sel = e.target;
        cyRef.current.elements().removeClass('semitransp');
        sel.removeClass('highlight').outgoers().removeClass('highlight');
      });
    }

    return () => {
      clearRefs(cyRef);
    };
  },
  []);

  return (
    <div className="cytoscape">
      <div className="layoutBar">
        <div className="layoutWrapper">
          <button
            type="submit"
            className={`layout-btn ${cLayout === 'circle' ? 'selected_circle' : ''}`}
            onClick={() => {
              setLayout('circle');
              setOpenGrid(false);
            }}
          >
            <CircleSvg />
            Circle
          </button>
          <button
            type="submit"
            className={`layout-btn ${cLayout === 'concentric' ? 'selected_circle' : ''}`}
            onClick={() => {
              setLayout('concentric');
              setOpenGrid(false);
            }}
          >
            <ConcentricSvg />
            Concentric
          </button>
          <button
            type="submit"
            className={`layout-btn ${cLayout === 'breadthfirst' ? 'selected-breadth' : ''}`}
            onClick={() => {
              setLayout('breadthfirst');
              setOpenGrid(false);
            }}
          >
            <BreadthSvg />
            Breadthfirst
          </button>
          <button
            type="submit"
            className={`layout-btn ${cLayout === 'cose' ? 'selected' : ''}`}
            onClick={() => {
              setLayout('cose');
              setOpenGrid(false);
            }}
          >
            <CoseSvg />
            Cose
          </button>
          <button
            type="submit"
            className={`layout-btn ${cLayout === 'random' ? 'selected' : ''}`}
            onClick={() => {
              setOpenGrid(false);
              setLayout('random');
            }}
          >
            <RandomSvg />
            Random
          </button>
        </div>
        <div className="gridWrapper">
          <button
            type="submit"
            className={`grid-btn layout-btn ${cLayout === 'grid' ? 'selected' : ''}`}
            onClick={() => {
              setLayout('grid');
              setOpenGrid(!openGrid);
            }}
          >
            <GridSvg />
            Grid
          </button>
          {openGrid
          && (
          <div className="grid-settings">
            <button type="submit" className="layout-btn" onClick={() => setRow(row + 1)}>+ 1 row</button>
            <button type="submit" className="layout-btn" onClick={() => setRow(row - 1)}>- 1 row</button>

            <button type="submit" className="layout-btn" onClick={() => setColumn(column + 1)}>+ 1 column</button>
            <button type="submit" className="layout-btn" onClick={() => setColumn(column - 1)}>- 1 column</button>
          </div>
          )}
        </div>
      </div>
      <CytoscapeComponent
        stylesheet={style}
        layout={layout}
        elements={CytoscapeComponent.normalizeElements({
          nodes: cNodes,
          edges: cLink,
        })}
        style={{ position: 'absolute', width: '1900px', height: '900px' }}
        cy={(cy) => (cyRef.current = cy)}
      />
    </div>
  );
};

Cytoscape.defaultProps = {
  nodes: [],
  links: [],
};

Cytoscape.propTypes = {
  nodes: PropTypes.array,
  links: PropTypes.array,
};

export default withRouter(Cytoscape);
