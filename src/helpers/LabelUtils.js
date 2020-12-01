import _ from 'lodash';
import { toast } from 'react-toastify';
import { uniqueId } from 'react-bootstrap-typeahead/lib/utils';
import Chart from '../Chart';
import ChartUtils from './ChartUtils';
import Utils from './Utils';
import store from '../store';
import CustomFields from './CustomFields';
import { setNodeCustomField } from '../store/actions/graphs';
import Api from '../Api';
import { socketLabelDataChange } from '../store/actions/socket';

class LabelUtils {
  static copy(sourceId, id, customFields) {
    const labels = Chart.getLabels();
    const nodes = Chart.getNodes().filter((n) => n.labels.includes(id));
    const links = Chart.getLinks().filter((l) => nodes.some((n) => l.source === n.id) && nodes.some((n) => l.target === n.id));
    const label = labels.find((l) => l.id === id);

    const data = {
      sourceId: +sourceId,
      label,
      nodes,
      links,
      customFields,
    };
    localStorage.setItem('label.copy', JSON.stringify(data));

    return data;
  }

  static async past(x, y, isEmbed, graphId) {
    let data;
    try {
      data = JSON.parse(localStorage.getItem('label.copy'));
    } catch (e) {
      //
    }
    if (!data || !data.label) {
      return;
    }
    const { x: posX, y: posY } = ChartUtils.calcScaledPosition(x, y);

    // label past
    const labels = Chart.getLabels();
    const labelOriginalId = data.label.id;
    const labelId = ChartUtils.uniqueId(labels);

    if (isEmbed) {
      if (labels.some((l) => l.id === data.label.id)) {
        toast.info('Label already pasted');
        return;
      }
      data.label.readOnly = true;
      data.label.sourceId = data.sourceId;
    } else {
      // eslint-disable-next-line no-lonely-if
      if (labels.some((l) => l.color === data.label.color)) {
        delete data.label.color;
        data.label.color = ChartUtils.labelColors(data.label);
      }
      data.label.id = labelId;
    }
    labels.push(data.label);

    const minX = Math.min(...data.label.d.map((l) => l[0]));
    const minY = Math.min(...data.label.d.map((l) => l[1]));
    data.label.d = data.label.d.map((i) => {
      i[0] = i[0] - minX + posX;
      i[1] = i[1] - minY + posY;
      return i;
    });

    // nodes past
    const nodes = Chart.getNodes();
    data.nodes.forEach((d) => {
      d.fx = d.fx - minX + posX;
      d.fy = d.fy - minY + posY;
      d.name = ChartUtils.nodeUniqueName(d);

      if (isEmbed) {
        d.readOnly = true;
        d.sourceId = data.sourceId;
      } else {
        const id = ChartUtils.uniqueId(nodes);
        d.labels = d.labels.map((l) => {
          if (l === labelOriginalId) {
            return labelId;
          }
          return l;
        });
        data.links = data.links.map((l) => {
          if (l.source === d.id) {
            l.source = id;
          } else if (l.target === d.id) {
            l.target = id;
          }
          return l;
        });
        d.id = id;
      }

      const customField = CustomFields.get(data.customFields, d.type, d.id);

      store.dispatch(setNodeCustomField(d.type, d.id, customField));

      nodes.push(d);
    });

    // links past
    const links = Chart.getLinks();
    data.links = data.links.map((d) => {
      if (isEmbed) {
        d.readOnly = true;
        d.sourceId = data.sourceId;
      }
      return d;
    });

    links.push(...data.links);
    if (isEmbed) {
      const { data: res } = await Api.labelShare(data.sourceId, data.label.id, graphId).catch((e) => e.response);
      if (res.status !== 'ok') {
        toast.error(res.message);
        return;
      }
      const { labelEmbed } = res;
      const embedLabels = _.uniqBy([...Chart.data.embedLabels, labelEmbed], 'id');
      Chart.render({
        links, nodes, labels, embedLabels,
      });
      return;
    }
    Chart.render({ links, nodes, labels });
  }

  static labelDataChange = (graphId, labelId, force = false) => {
    const label = ChartUtils.getLabelById(labelId);
    if ((label.hasInEmbed && !label.sourceId) || force) {
      const { nodes, links } = ChartUtils.getFilteredGraphByLabel(labelId);
      const graph = {
        nodes, links, sourceId: +graphId, label, labelId: label.id, customFields: {},
      };
      store.dispatch(socketLabelDataChange(graph));
    }
  }
}

export default LabelUtils;
