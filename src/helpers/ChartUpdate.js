import Chart from '../Chart';
import ChartUtils from "./ChartUtils";

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

  static nodeUpdate = (node) => {
    const nodes = Chart.getNodes().map((d) => {
      if (d.id === node.id) {
        return { ...d, ...node };
      }
      return d;
    });
    Chart.render({ nodes });
  }

  static linkCreate = (link) => {
    const links = Chart.getLinks();
    links.push(link);
    Chart.render({ links });
  }

  static linkUpdate = (link) => {
    const links = Chart.getLinks().map((d) => {
      if (d.id === link.id) {
        return { ...d, ...link };
      }
      return d;
    });
    Chart.render({ links });
  }

  static linkDelete = (link) => {
    const links = Chart.getNodes().filter((d) => d.id !== link.id);
    Chart.render({ links });
  }

  static labelCreate = (label) => {
    const labels = Chart.getLabels();
    labels.push(label);
    Chart.render({ labels });
  }

  static labelUpdate = (label) => {
    const labels = Chart.getLabels().map((d) => {
      if (d.id === label.id) {
        return { ...d, ...label };
      }
      return d;
    });
    Chart.render({ labels });
  }

  static labelDelete = (label) => {
    const labels = Chart.getLabels().filter((d) => d.id !== label.id);
    const nodes = Chart.getNodes().filter((d) => !d.labels.includes(label.id));
    const links = ChartUtils.cleanLinks(Chart.getLinks(), nodes);

    Chart.render({ nodes, links, labels });
  }
}

export default ChartUpdate;
