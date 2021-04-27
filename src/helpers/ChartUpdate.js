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
    Chart.render({ nodes }, { ignoreAutoSave: true });
  }

  static nodesDelete = (nodesDelete) => {
    const nodes = Chart.getNodes().filter((n) => !nodesDelete?.some((d) => n.id === d.id));
    Chart.render({ nodes }, { ignoreAutoSave: true });
  }

  static nodesUpdate = (nodesUpdate) => {
    const nodes = Chart.getNodes().map((d) => {
      const node = nodesUpdate?.find((n) => n.id === d.id);
      if (node) {
        return { ...d, ...node };
      }
      return d;
    });
    Chart.render({ nodes }, { ignoreAutoSave: true });
  }

  static nodeCustomFieldsChange = () => {

  }

  static linkCreate = (linksCreate) => {
    let links = Chart.getLinks();
    links.push(..._.compact(linksCreate));
    links = _.uniqBy(links, (l) => {
      if (l.direction) {
        return JSON.stringify({
          1: l.name, 2: l.type, 3: l.source, 4: l.target,
        });
      }
      return JSON.stringify({
        1: l.name, 2: l.type, 3: [l.source, l.target].sort(),
      });
    });
    Chart.render({ links }, { ignoreAutoSave: true });
  }

  static linkUpdate = (linksUpdate) => {
    const links = Chart.getLinks().map((d) => {
      const link = linksUpdate.find((n) => n.id === d.id);
      if (link) {
        return { ...d, ...link };
      }
      return d;
    });
    Chart.render({ links }, { ignoreAutoSave: true });
  }

  static linkDelete = (linksDelete) => {
    const links = Chart.getLinks().filter((n) => !linksDelete.some((d) => n.id === d.id));
    Chart.render({ links }, { ignoreAutoSave: true });
  }

  static labelCreate = (labelsCreate) => {
    const labels = Chart.getLabels();
    labels.push(...labelsCreate);
    Chart.render({ labels }, { ignoreAutoSave: true });
  }

  static labelUpdate = (labelsUpdate) => {
    const labels = Chart.getLabels().map((d) => {
      const label = labelsUpdate.find((n) => n.id === d.id);
      if (label) {
        return { ...d, ...label };
      }
      return d;
    });
    Chart.render({ labels }, { ignoreAutoSave: true });
  }

  static labelDelete = (labelsDelete) => {
    const labelsDeleteId = labelsDelete.map((l) => l.id);

    const labels = Chart.getLabels().filter((n) => !labelsDeleteId.includes(n.id));

    const nodes = Chart.getNodes().filter((d) => !_.intersection(labelsDeleteId, d.labels).length);
    const links = ChartUtils.cleanLinks(Chart.getLinks(), nodes);

    Chart.render({ nodes, links, labels }, { ignoreAutoSave: true });
  }
}

export default ChartUpdate;
