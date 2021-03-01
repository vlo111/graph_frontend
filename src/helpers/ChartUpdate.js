import Chart from '../Chart';

class ChartUpdate {
  static nodePositionsChange = (nodes) => {
    Chart.data.nodes = Chart.data.nodes.map((node) => {
      const d = nodes.find((d) => d.id === node.id);
      if (d) {
        node.x = d.fx;
        node.fx = d.fx;

        node.y = d.fy;
        node.fy = d.fy;
      }
      return node;
    });
    Chart._dataNodes = null;
    Chart.graphMovement();
  }

  static nodeCrate = (node) => {
    const nodes = Chart.getNodes();
    nodes.push(node);
    Chart.render({ nodes });
  }

  static nodeDelete = (node) => {
    const nodes = Chart.getNodes().filter((d) => d.id !== node.id);
    Chart.render({ nodes });
  }
}

export default ChartUpdate;
