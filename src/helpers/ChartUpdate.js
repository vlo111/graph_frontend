import _ from 'lodash';
import Chart from '../Chart';
import ChartUtils from './ChartUtils';

class ChartUpdate {
  static nodePositionsChange = (nodes) => {
    Chart.data.nodes = Chart.data.nodes.map((node) => {
      const d = nodes.find((n) => n.id === node.id);
      if (d && !Chart.isAutoPosition) {
        node.fx = d.fx;
        node.fy = d.fy;
      }
      return node;
    });
    Chart._dataNodes = null;
    Chart.graphMovement();
  }

  static graphPositionsChange = (updateNodes, labelsUpdate) => {
    const labels = Chart.getLabels().map((label) => {
      const d = labelsUpdate.find((l) => l.id === label.id);
      if (d) {
        label.d = d.d;
      }
      return label;
    });
    const nodes = Chart.getNodes().map((node) => {
      const d = updateNodes.find(((n) => n.id === node.id));
      if (d && !Chart.isAutoPosition) {
        node.fx = d.fx;
        node.fy = d.fy;
        node.labels = d.labels || node.labels;
      }
      if (node.fake) {
        const label = labelsUpdate.find((l) => `fake_${l.id}` === node.id);
        if (label) {
          node.fx = label.d[0][0] + 30;
          node.fy = label.d[0][1] + 30;
        }
      }
      return node;
    });
    Chart.render({ labels, nodes }, { ignoreAutoSave: true });
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

  static labelToggle = (updateLabel) => {
    if (updateLabel.open) {
      const folder = document.querySelector(`[id="${updateLabel.id}"]`);
      if (folder) {
        folder.dispatchEvent(new Event('dblclick'));
      }
    } else {
      const folderCloseButton = document.querySelector(`[id="${updateLabel.id}"] .closeIcon`);
      if (folderCloseButton) {
        folderCloseButton.dispatchEvent(new Event('click'));
      }
    }
  }

  static labelUpdatePosition = (labelsUpdate, updateNodes) => {
    const labels = Chart.getLabels().map((label) => {
      const updateLabel = labelsUpdate.find((n) => n.id === label.id);
      if (updateLabel) {
        label.d = updateLabel.d;
      }
      return label;
    });
    Chart.render({ labels }, { ignoreAutoSave: true });
    this.nodePositionsChange(updateNodes);
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
