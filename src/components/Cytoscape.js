import { useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import PropTypes from 'prop-types';
import AddNodeModal from './chart/AddNodeModal';
import ChartUtils from '../helpers/ChartUtils';
import queryString from "query-string";

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
        shape: 'circle',
        'border-color': 'data(color)',
        'border-opacity': '1',
        'border-width': '8px',
        'background-color': 'white',
        cursor: 'pointer',
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
  const [c_layout, setLayout] = useState('circle');
  const [row, setRow] = useState(5);
  const [column, setColumn] = useState(5);

  let myCyRef;

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

  const elements = [
    { data: { id: 'one', label: 'Node 1' }, position: { x: 100, y: 40 } },
    { data: { id: 'two', label: 'Node 2' }, position: { x: 112, y: 50 } },
    { data: { id: 'three', label: 'Node 3' }, position: { x: 200, y: 40 } },
  ];

  const layout = {
    name: c_layout,
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
  const c_nodes = [];
  const c_link = [];

  nodes.forEach((n) => {
    const color = ChartUtils.nodeColorObj[n.type] || 'red';
    c_nodes.push({
      data: { id: n.id, label: n.name, color },
      // position: { x: n.fx, y: n.fy },
      shape: 'triangle',
    });
  });

  links.forEach((l) => {
    if (nodes.filter((p) => ((p.id === l.source) || (p.id === l.target)))[0]) {
      const color = ChartUtils.linkColorObj[l.type] || 'red';
      c_link.push({
        data: {
          source: l.source,
          target: l.target,
          label: l.type,
          color,
        },
      });
    }
  });

  return (
    <div style={{ position: 'absolute' }}>
      <div style={{
        opacity: '1', position: 'absolute', left: '220px', width: '650px', top: '90px', zIndex: '9',
      }}
      >
        <div>Layouts: </div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <button
            style={{
              padding: '5px', borderRadius: '50px', background: 'darkred', border: '1px solid white',
            }}
            onClick={() => {
              setLayout('circle');
            }}
          >
            Circle
          </button>
          <button
            style={{ padding: '5px', background: '#39a032', border: '1px solid white' }}
            onClick={() => {
              setLayout('concentric');
            }}
          >
            Concentric
          </button>
          <button
            style={{ padding: '5px', background: '#a82287', border: '1px solid white' }}
            onClick={() => {
              setLayout('breadthfirst');
            }}
          >
            Breadthfirst
          </button>
          <button
            style={{ padding: '5px', background: '#522ae5', border: '1px solid white' }}
            onClick={() => {
              setLayout('cose');
            }}
          >
            Cose
          </button>
          <button
            style={{ padding: '5px', background: '#0ecadc', border: '1px solid white' }}
            onClick={() => {
              setLayout('random');
            }}
          >
            Random
          </button>
          <div style={{ display: 'block' }}>
            <button
              style={{ padding: '5px', background: '#509ee2', border: '1px solid white' }}
              onClick={() => {
                setLayout('grid');
              }}
            >
              Grid
            </button>
            <button onClick={() => setRow(row + 1)}>+ 1 row</button>
            <button onClick={() => setRow(row - 1)}>- 1 row</button>

            <button onClick={() => setColumn(column + 1)}>+ 1 column</button>
            <button onClick={() => setColumn(column - 1)}>- 1 column</button>
          </div>
        </div>
      </div>
      <CytoscapeComponent
        stylesheet={style}
        layout={layout}
        elements={CytoscapeComponent.normalizeElements({
          nodes: c_nodes,
          edges: c_link,
        })}
        style={{ position: 'absolute', width: '1900px', height: '900px' }}
        cy={(cy) => {
          myCyRef = cy;

          cy.on('tap', 'node', function(evt){
            let node = evt.target;
            console.log('tapped ' + node.id());
            if (node.selected()) {
              console.log('selected ' + node.id());

              const queryObj = queryString.parse(window.location.search);
              queryObj.info = node.id();
              const query = queryString.stringify(queryObj);
              history.replace(`?${query}`);
            }
          });

          // cy.on('click', (evt) => {
          //   cyClick(evt);
          //   console.log('Hello');
          // });

          // cy.on('tap', 'node', (evt) => {
          //   const node = evt.target;
          //   // console.log("EVT", evt);
          //   // console.log("TARGET", node.data());
          //   // console.log("TARGET TYPE", typeof node[0]);
          //   console.log('TARGET ID', node.id());
          // });

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

          cy.on('mouseover', 'node', (e) => {
            document.body.style.cursor = 'pointer';

            const sel = e.target;
            cy.elements().difference(sel.outgoers()).not(sel).addClass('semitransp');
            sel.addClass('highlight').outgoers().addClass('highlight');
          });
          cy.on('mouseout', 'node', (e) => {
            document.body.style.cursor = 'auto';

            const sel = e.target;
            cy.elements().removeClass('semitransp');
            sel.removeClass('highlight').outgoers().removeClass('highlight');
          });
        }}
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

export default Cytoscape;
