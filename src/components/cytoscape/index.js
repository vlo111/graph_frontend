import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import ChartUtils from '../../helpers/ChartUtils';
import Layout from './Layout';
import Render from './render';
import Chart from '../../Chart';

const Cytoscape = ({ nodes, links, history }) => {
  const [cLayout, setLayout] = useState('circle');
  const [row, setRow] = useState(10);
  const [column, setColumn] = useState(10);
  const [openGrid, setOpenGrid] = useState(false);
  const [cNodes, setCNodes] = useState([]);
  const [cLinks, setCLinks] = useState([]);
  const [fit, setFit] = useState(false);

  const layout = {
    name: cLayout,
    // 'draft', 'default' or 'proof"
    // - 'draft' fast cooling rate
    // - 'default' moderate cooling rate
    // - "proof" slow cooling rate
    quality: 'default',
    // levelWidth(nodes) {
    //   return 8;
    // },
    concentric(node) {
      return node.degree();
    },
    initialEnergyOnIncremental: 0.5,
    idealEdgeLength: 50,
    refresh: 30,
    rows: row,
    columns: column,
    fit: false, // whether to fit to viewport
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

  const normalize = () => {
    const node = [];
    const link = [];
    nodes.forEach((n) => {
      const color = ChartUtils.nodeColorObj[n.type] || 'red';
      node.push({
        data: { id: n.id, label: n.name, color },
        position: { x: n.fx, y: n.fy },
      });
    });

    links.forEach((l) => {
      if (nodes.filter((p) => ((p.id === l.source) || (p.id === l.target)))[0]) {
        const color = ChartUtils.linkColorObj[l.type] || 'red';
        link.push({
          data: {
            source: l.source,
            target: l.target,
            label: l.type,
            color,
          },
        });
      }
    });

    setCNodes(node);
    setCLinks(link);
  };

  useEffect(() => {
    normalize();
  },
  []);

  return (
    <div className="cytoscape">
      <Layout
        cLayout={cLayout}
        column={column}
        row={row}
        setRow={setRow}
        setColumn={setColumn}
        setLayoutOption={(layoutOption, grid = false) => {
          setLayout(layoutOption);
          setOpenGrid(grid);
          // normalize();
          // if (layoutOption === 'local') {
          // } else {
          //   normalize();
          // }
        }}
        openGrid={openGrid}
      />
      {nodes.length
        && (
        <Render
          fit={fit}
          chartNodes={nodes}
          chartLinks={links}
          nodes={cNodes}
          edges={cLinks}
          layout={layout}
          history={history}
        />
        )}
      <div className="layout-btn toolbar-cytoscape">fit</div>
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
  history: PropTypes.object.isRequired,
};

export default withRouter(Cytoscape);
