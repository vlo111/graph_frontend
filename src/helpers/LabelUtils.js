import _ from 'lodash';
import { toast } from 'react-toastify';
import Chart from '../Chart';
import ChartUtils from './ChartUtils';
import Utils from './Utils';
import store from '../store';
import CustomFields from './CustomFields';
import { setNodeCustomField } from '../store/actions/graphs';
import Api from '../Api';
import { socketLabelDataChange } from '../store/actions/socket';

class LabelUtils {
  static copy(graphId, name, customFields) {
    const labels = Chart.getLabels();
    const nodes = Chart.getNotesWithLabels().filter((n) => n.labels.includes(name));
    const links = Chart.getLinks().filter((l) => nodes.some((n) => l.source === n.name) && nodes.some((n) => l.target === n.name));
    const label = labels.find((l) => l.name === name);

    const data = {
      graphId,
      label,
      nodes,
      links,
      customFields,
    };
    localStorage.setItem('label.copy', JSON.stringify(data));

    return data;
  }

  static pastEmbed(x, y) {

  }

  static getNewNodeName(d, nodes) {
    const i = _.chain(nodes)
      .filter((n) => new RegExp(`^${Utils.escRegExp(d.name)}(_\\d+|)$`).test(n.name))
      .map((n) => {
        const [, num] = n.name.match(/_(\d+)$/) || [0, 0];
        return +num;
      })
      .max()
      .value() + 1;
    if (!i) {
      return d.name;
    }
    return `${d.name}_${i}`;
  }

  static async past(x, y, isEmbed, graphId) {
    let data;
    try {
      data = JSON.parse(localStorage.getItem('label.copy'));
    } catch (e) {
      //
    }
    if (!data) {
      return;
    }
    const { x: posX, y: posY } = ChartUtils.calcScaledPosition(x, y);

    // label past
    const labels = Chart.getLabels();

    if (isEmbed) {
      if (labels.some((l) => l.originalName && l.originalName === data.label.name)) {
        toast.info('Label already pasted');
        return;
      }
      data.label.readOnly = true;
      data.label.sourceId = data.graphId;
      data.label.originalName = data.label.name;
    } else {
      // eslint-disable-next-line no-lonely-if
      if (labels.some((l) => l.color === data.label.color)) {
        delete data.label.color;
        data.label.color = ChartUtils.labelColors(data.label);
      }
    }
    if (labels.some((l) => l.name === data.label.name)) {
      const i = _.chain(labels)
        .filter((n) => new RegExp(`^${Utils.escRegExp(data.label.name)}(_\\d+|)$`).test(n.name))
        .map((n) => {
          const [, num] = n.name.match(/_(\d+)$/) || [0, 0];
          return +num;
        })
        .max()
        .value() + 1;
      data.label.name = `${data.label.name}_${i}`;
    }

    labels.push(data.label);

    // nodes past
    const nodes = Chart.getNodes();
    const minX = Math.min(...data.label.d.map((l) => l[0]));
    const minY = Math.min(...data.label.d.map((l) => l[1]));
    data.label.d = data.label.d.map((i) => {
      i[0] = i[0] - minX + posX;
      i[1] = i[1] - minY + posY;
      return i;
    });

    data.nodes.forEach((d) => {
      const originalName = d.name;
      if (nodes.some((n) => n.name === d.name)) {
        d.name = this.getNewNodeName(d, nodes);
        data.links = data.links.map((l) => {
          if (l.source === originalName) {
            l.source = d.name;
          }
          if (l.target === originalName) {
            l.target = d.name;
          }
          return l;
        });
      }
      d.fx = d.fx - minX + posX;
      d.fy = d.fy - minY + posY;
      if (isEmbed) {
        d.readOnly = true;
        d.sourceId = data.graphId;
        d.originalName = originalName;
      }

      const customField = CustomFields.get(data.customFields, d.type, originalName);

      store.dispatch(setNodeCustomField(d.type, d.name, customField));

      nodes.push(d);
    });

    // links past
    const links = Chart.getLinks();
    data.links = data.links.map((d) => {
      if (isEmbed) {
        d.readOnly = true;
        d.sourceId = data.graphId;
      }
      return d;
    });

    links.push(...data.links);

    if (isEmbed) {
      const { data: res } = await Api.labelShare(data.graphId, data.label.originalName, graphId).catch((e) => e.response);
      if (res.status !== 'ok') {
        toast.error(res.message);
        return;
      }
      Chart.render({ links, nodes, labels });
      return;
    }

    Chart.render({ links, nodes, labels });
  }

  static labelDataChange = (graphId, labelName, force = false) => {
    const label = ChartUtils.getLabelByName(labelName, true);
    if ((label.hasInEmbed && !label.sourceId) || force) {
      const { nodes, links } = ChartUtils.getFilteredGraphByLabel(labelName);
      const graph = {
        nodes, links, sourceId: +graphId, label, labelName: label.name, customFields: {},
      };
      store.dispatch(socketLabelDataChange(graph));
    }
  }
}

export default LabelUtils;
