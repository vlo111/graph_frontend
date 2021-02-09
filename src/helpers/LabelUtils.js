import _ from 'lodash';
import { toast } from 'react-toastify';
import { uniqueId } from 'react-bootstrap-typeahead/lib/utils';
import Chart from '../Chart';
import ChartUtils from './ChartUtils';
import Utils from './Utils';
import store from '../store';
import CustomFields from './CustomFields';
import { removeNodeCustomFieldKey, renameNodeCustomFieldKey, setNodeCustomField } from '../store/actions/graphs';
import Api from '../Api';
import { socketLabelDataChange } from '../store/actions/socket';
import { LABEL_STATUS } from '../data/node';

class LabelUtils {
  static copy(sourceId, id, customFields, singleGraph) {
    const labels = Chart.getLabels();
    const label = labels.find((l) => l.id === id);
    if (label.type === 'folder') {
      label.open = true;
    }

    const nodes = Chart.getNodes().filter((n) => n.labels.includes(id)).map((d) => {
      delete d.lx;
      delete d.ly;
      d.labels = [id];
      return d;
    });

    const links = Chart.getLinks().filter((l) => nodes.some((n) => l.source === n.id) && nodes.some((n) => l.target === n.id));

    const data = {
      sourceId: +sourceId,
      label,
      nodes,
      links,
      customFields,
      title: singleGraph.title,
    };
    localStorage.setItem('label.copy', JSON.stringify(data));

    return data;
  }

  static getData() {
    let data;
    try {
      data = JSON.parse(localStorage.getItem('label.copy'));
    } catch (e) {
      //
    }
    return data || {};
  }

  static compare() {
    const data = this.getData();
    if (!data.label) {
      return {};
    }
    const nodes = Chart.getNodes();
    const sourceNodes = _.intersectionBy(nodes, data.nodes, 'name');
    const duplicatedNodes = _.intersectionBy(data.nodes, nodes, 'name');
    return {
      duplicatedNodes,
      sourceNodes,
    };
  }

  static pastAndMerge(data, position, sources, duplicates, customFields) {
    let links = Chart.getLinks();
    let nodes = Chart.getNodes();
    data.nodes = data.nodes.map((n) => {
      const selected = duplicates.find((d) => d.name === n.name);
      const merge = sources.find((d) => d.name === n.name);
      if (merge && selected) {
        const originalId = n.id;
        n.originalId = originalId;
        n.id = merge.id;
        n.merge = true;
        const customFieldDuplicate = CustomFields.get(data.customFields, n.type, n.id);
        const customField = CustomFields.get(customFields, merge.type, merge.id);
        _.forEach(customFieldDuplicate, (k, name) => {
          if (Object.keys(customField).includes(name)) {
            store.dispatch(renameNodeCustomFieldKey(merge.type, name, CustomFields.uniqueName(customFields, merge.type, name)));
          } else {
            // todo
          }
        });

        data.links = data.links.map((l) => {
          if (l.source === originalId) {
            l.source = n.id;
          }
          if (l.target === originalId) {
            l.target = n.id;
          }
          return l;
        });
      } else if (!merge && selected) {
        nodes = nodes.filter((d) => {
          if (n.name === d.name) {
            const customField = Object.keys(CustomFields.get(customFields, d.type, d.id));
            customField.forEach((name) => {
              store.dispatch(removeNodeCustomFieldKey(d.type, name, d.id));
            });
            return false;
          }
          return true;
        });
        links = ChartUtils.cleanLinks(links, nodes);
      } else if (merge && !selected) {

      } else {
        return undefined;
      }

      return n;
    });
    data.nodes = _.compact(data.nodes);
    data.links = ChartUtils.cleanLinks(data.links, data.nodes);
    links = ChartUtils.cleanLinks(links, nodes);
    Chart.render({ nodes, links });
    console.log(data.nodes, ' data.nodes');
    return LabelUtils.past(data, position);
  }

  static async past(data, position, isEmbed, graphId) {
    if (!data || !data.label) {
      return;
    }
    const { x: posX, y: posY } = ChartUtils.calcScaledPosition(position[0], position[1]);

    // label past
    const labels = Chart.getLabels();
    const labelOriginalId = data.label.id;
    let labelId = ChartUtils.uniqueId(labels);
    if (data.label.type === 'folder') {
      labelId = `f_${labelId}`;
    }

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

    let minX = Math.min(...data.label.d.map((l) => l[0]));
    let minY = Math.min(...data.label.d.map((l) => l[1]));

    if (data.label.type === 'folder') {
      minX = data.label.d[0][0];
      minY = data.label.d[0][1];
      data.label.d[0][0] = posX;
      data.label.d[0][1] = posY;
    } else {
      data.label.d = data.label.d.map((i) => {
        i[0] = i[0] - minX + posX;
        i[1] = i[1] - minY + posY;
        return i;
      });
    }

    // nodes past
    let nodes = Chart.getNodes();
    data.nodes.forEach((d) => {
      d.fx = d.fx - minX + posX;
      d.fy = d.fy - minY + posY;
      let id;
      if (d.replace) {
        id = d.id;
      } else if (d.merge) {
        id = nodes.find((n) => n.name === d.name).id;
      } else {
        id = ChartUtils.uniqueId(nodes);
      }

      if (isEmbed) {
        d.readOnly = true;
        d.sourceId = data.sourceId;
        data.links = data.links.map((l) => {
          if (l.source === d.id) {
            l.sx = l.sx - minX + posX;
            l.sy = l.sy - minY + posY;
          } else if (l.target === d.id) {
            l.tx = l.tx - minX + posX;
            l.ty = l.ty - minY + posY;
          }
          return l;
        });
      } else {
        d.labels = d.labels.map((l) => {
          if (l === labelOriginalId) {
            return labelId;
          }
          return l;
        });
        data.links = data.links.map((l) => {
          if (l.source === d.id) {
            l.source = id;
            l.sx = l.sx - minX + posX;
            l.sy = l.sy - minY + posY;
          } else if (l.target === d.id) {
            l.target = id;
            l.tx = l.tx - minX + posX;
            l.ty = l.ty - minY + posY;
          }
          return l;
        });
        d.originalId = d.id;
        d.id = id;
      }

      d.name = (d.replace || d.merge) ? d.name : ChartUtils.nodeUniqueName(d);
      d.labels = [labelId];

      const customField = CustomFields.get(data.customFields, d.type, d.originalId || d.id);
      store.dispatch(setNodeCustomField(d.type, d.id, customField, undefined, d.merge));

      if (d.replace) {
        nodes = nodes.map((n) => {
          if (n.id === d.id) {
            return d;
          }
          return n;
        });
      } else if (d.merge) {
        nodes = nodes.map((n) => {
          if (n.id === d.id) {
            n = ChartUtils.merge(d, n);
            data.links = data.links.map((l) => {
              if (l.source === d.originalId) {
                l.source = n.id;
              }
              if (l.target === d.originalId) {
                l.target = n.id;
              }
              return l;
            });
          }
          return n;
        });
      } else {
        nodes.push(d);
      }
    });

    // links past
    let links = Chart.getLinks();
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
      }, 'past');
      return;
    }

    links = ChartUtils.cleanLinks(links, nodes);
    links = ChartUtils.uniqueLinks(links);

    Chart.render({ links, nodes, labels }, 'past');
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

  /**
   * Return label status name for label status
   * @param {*} status
   */
  static lableStatusNane = (status = null) => {
    const labelStatus = LABEL_STATUS.filter((c) => c.value === status);
    return labelStatus.length ? labelStatus[0].label : null;
  }

  static getFolderPos(d) {
    const folderId = (d.labels || []).find((l) => l.startsWith('f_'));
    if (folderId) {
      const folder = Chart.getLabels().find((l) => l.id === folderId);
      if (folder) {
        if (!folder.open) {
          d.lx = folder.d[0][0];
          d.ly = folder.d[0][1];
        } else {
          delete d.lx;
          delete d.ly;
          return []
        }
      }
    }
    return [d.lx, d.ly];
  }
}

export default LabelUtils;
