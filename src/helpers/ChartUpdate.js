import Chart from '../Chart';
import _ from 'lodash';
import ChartUtils from './ChartUtils';

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

  static nodesCrate = (nodeCreate) => {
    const nodes = Chart.getNodes();
    nodes.push(...nodeCreate);
    Chart.render({ nodes });
  }

  static nodesDelete = (nodesDelete) => {
    const nodes = Chart.getNodes().filter((n) => !nodesDelete.some((d) => n.id === d.id));
    Chart.render({ nodes });
  }

  static nodesUpdate = (nodesUpdate) => {
    const nodes = Chart.getNodes().map((d) => {
      const node = nodesUpdate.find((n) => n.id === d.id);
      if (node) {
        return { ...d, ...node };
      }
      return d;
    });
    Chart.render({ nodes });
  }

  static linkCreate = (linksCreate) => {
    const links = Chart.getLinks();
    links.push(...linksCreate);
    Chart.render({ links });
  }

  static linkUpdate = (linksUpdate) => {
    const links = Chart.getLinks().map((d) => {
      const link = linksUpdate.find((n) => n.id === d.id);
      if (link) {
        return { ...d, ...link };
      }
      return d;
    });
    Chart.render({ links });
  }

  static linkDelete = (linksDelete) => {
    const links = Chart.getNodes().filter((n) => !linksDelete.some((d) => n.id === d.id));
    Chart.render({ links });
  }

  static labelCreate = (labelsCreate) => {
    const labels = Chart.getLabels();
    labels.push(...labelsCreate);
    Chart.render({ labels });
  }

  static labelUpdate = (labelsUpdate) => {
    const labels = Chart.getLabels().map((d) => {
      const label = labelsUpdate.find((n) => n.id === d.id);
      if (label) {
        return { ...d, ...label };
      }
      return d;
    });
    Chart.render({ labels });
  }

  static labelDelete = (labelsDelete) => {
    const labelsDeleteId = labelsDelete.map((l) => l.id);

    const labels = Chart.getLabels().filter((n) => !labelsDeleteId.includes(n.id));

    const nodes = Chart.getNodes().filter((d) => !_.intersection(labelsDeleteId, d.labels).length);
    const links = ChartUtils.cleanLinks(Chart.getLinks(), nodes);

    Chart.render({ nodes, links, labels });
  }
}

export default ChartUpdate;
