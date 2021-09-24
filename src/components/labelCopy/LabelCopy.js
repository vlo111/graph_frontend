import React, { Component } from 'react';
import _ from 'lodash';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
<<<<<<< HEAD
import { toast } from 'react-toastify';
=======
>>>>>>> origin/master
import ContextMenu from '../contextMenu/ContextMenu';
import LabelUtils from '../../helpers/LabelUtils';
import Button from '../form/Button';
import Chart from '../../Chart';
import LabelCompare from './LabelCompare';
import CustomFields from '../../helpers/CustomFields';
import { removeNodeCustomFieldKey } from '../../store/actions/graphs';
import ChartUtils from '../../helpers/ChartUtils';
import { copyDocumentForGraphRequest } from '../../store/actions/document';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { ReactComponent as CompareNodesSvg } from '../../assets/images/icons/Compare_nodes.svg';
import { ReactComponent as KeepBothSvg } from '../../assets/images/icons/Keep_both.svg';
import { ReactComponent as MergeNodesSvg } from '../../assets/images/icons/Merge_nodes.svg';
import { ReactComponent as ReplaceSvg } from '../../assets/images/icons/Replace.svg';
import { ReactComponent as SkipNodesSvg } from '../../assets/images/icons/Skip_these_nodes.svg';
<<<<<<< HEAD
import { createNodesRequest, deleteNodesRequest, updateNodesRequest } from '../../store/actions/nodes';
import { createLinksRequest } from '../../store/actions/links';
import { createLabelsRequest } from '../../store/actions/labels';
import { getSingleGraphRequest } from '../../store/actions/graphs';
import Api from '../../Api';
=======
>>>>>>> origin/master

class LabelCopy extends Component {
  static propTypes = {
    copyDocumentForGraphRequest: PropTypes.func.isRequired,
    singleGraph: PropTypes.object.isRequired,
<<<<<<< HEAD
=======
    customFields: PropTypes.object.isRequired,
>>>>>>> origin/master
  }

  constructor(props) {
    super(props);
    this.state = {
      compare: {},
      position: [],
      data: {},
      showQuestionModal: false,
      showCompareModal: false,
    };
  }

  componentDidMount() {
    ContextMenu.event.on('label.append', this.handleLabelAppend);
    ContextMenu.event.on('node.append', this.handleNodeAppend);
    ContextMenu.event.on('label.embed', this.handleLabelEmbed);
  }

  componentWillUnmount() {
    ContextMenu.event.removeListener('label.append', this.handleLabelAppend);
    ContextMenu.event.removeListener('node.append', this.handleNodeAppend);
    ContextMenu.event.removeListener('label.embed', this.handleLabelEmbed);
  }

  copyDocuments = (fromGraphId, toGraphId, nodes) => {
    this.props.copyDocumentForGraphRequest(
      {
        graphId: fromGraphId,
        toGraphId,
        nodes,
      },
    );
<<<<<<< HEAD
=======
  }

  fixDuplications = () => {
    const { position } = this.state;
    const { id } = this.props.singleGraph;
    const data = LabelUtils.getData();
    LabelUtils.past(data, position);
    this.copyDocuments(data.sourceId, id, data.nodes);
    this.closeModal();
>>>>>>> origin/master
  }

  handleLabelAppend = async (ev, params) => {

    if(Chart.isAutoPosition)
       Chart.isAutoPosition = false;

    const { x, y } = params;
<<<<<<< HEAD
    const { singleGraph } = this.props;
=======
    const { id } = this.props.singleGraph;
    const compare = LabelUtils.compare();
    const position = [x, y];
>>>>>>> origin/master
    const data = LabelUtils.getData();

    // todo global loading
    const { data: compare } = await Api.dataPastCompare(singleGraph.id, data.nodes).catch((e) => e.response);

    const position = [x, y];
    if (_.isEmpty(compare.duplicatedNodes)) {
<<<<<<< HEAD
      this.copyDocument('keep');
=======
      LabelUtils.past(data, position);

      this.copyDocuments(data.sourceId, id, data.nodes);

>>>>>>> origin/master
      return;
    }
    this.setState({
      compare, data, position, showQuestionModal: true,
    });
  }

<<<<<<< HEAD
  handleNodeAppend = (ev, params) => {
    const data = LabelUtils.getData();
    this.setState({
      compare: params.compare, data, position: [params.x, params.y], showQuestionModal: true,
    });
  }

  skipDuplications = async () => {
    const { compare: { duplicatedNodes, sourceNodes }, position } = this.state;
    const { singleGraph } = this.props;
    const data = LabelUtils.getData();
=======
  skipDuplications = () => {
    const { compare: { duplicatedNodes, sourceNodes }, position } = this.state;
    const { id } = this.props.singleGraph;
    const data = LabelUtils.getData();
>>>>>>> origin/master
    const nodes = Chart.getNodes();
    data.links = data.links.map((l) => {
      const duplicateNode = data.nodes.find((n) => n.id === l.source);
      if (duplicateNode) {
        const sourceNode = sourceNodes.find((n) => n.name === duplicateNode.name);
        if (sourceNode) {
          l.source = sourceNode.id;
        }
      }

      const duplicateNodeTarget = data.nodes.find((n) => n.id === l.target);
      if (duplicateNodeTarget) {
        const sourceNode = sourceNodes.find((n) => n.name === duplicateNodeTarget.name);
        if (sourceNode) {
          l.target = sourceNode.id;
        }
      }
      return l;
    });
    data.nodes = data.nodes.filter((n) => !duplicatedNodes.some((d) => n.name === d.name));

    data.links = ChartUtils.cleanLinks(data.links, [...data.nodes, ...nodes]);
<<<<<<< HEAD
    this.copyDocuments(data.sourceId, singleGraph.id, data.nodes);
=======
    LabelUtils.past(data, position);
    this.copyDocuments(data.sourceId, id, data.nodes);
>>>>>>> origin/master
    this.closeModal();

    // const {
    //   updateNodes, createNodes, createLinks, createLabel,
    // } = await LabelUtils.past(data, position);
    // this.props.updateNodesRequest(singleGraph.id, updateNodes);
    // this.props.createNodesRequest(singleGraph.id, createNodes);
    // this.props.createLinksRequest(singleGraph.id, createLinks);
    // this.props.createLabelsRequest(singleGraph.id, [createLabel]);
  }

  closeModal = () => {
    this.setState({
      compare: {}, data: {}, position: [], showQuestionModal: false, showCompareModal: false,
    });
  }

<<<<<<< HEAD
  replaceDuplications = async () => {
=======
  replaceDuplications = () => {
>>>>>>> origin/master
    const { customFields, singleGraph } = this.props;
    const { position } = this.state;
    const data = LabelUtils.getData();
    const nodes = Chart.getNodes();
    data.nodes = data.nodes.map((n) => {
      const duplicate = nodes.find((d) => n.name === d.name);
      if (duplicate) {
        const originalId = n.id;
        n.id = duplicate.id;
        n.replace = true;
        const customField = CustomFields.get(customFields, duplicate.type, duplicate.id);
        _.forEach(customField, (v, name) => {
          this.props.removeNodeCustomFieldKey(duplicate.type, name, duplicate.id);
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
      }
      return n;
    });
<<<<<<< HEAD
=======
    LabelUtils.past(data, position);
>>>>>>> origin/master
    this.copyDocuments(data.sourceId, singleGraph.id, data.nodes);

    this.closeModal();
  }

  toggleCompareNodes = (showCompareModal) => {
    this.setState({ showCompareModal });
  }

<<<<<<< HEAD
  compareAndMerge = async (sources, duplications) => {
    Chart.loading(true);
    const merge = {
      sources: sources.map((d) => d.id),
      duplications: duplications.map((d) => d.id),
    };
=======
  merge = () => {
    const { customFields, singleGraph } = this.props;
>>>>>>> origin/master
    const { position } = this.state;
    const { x, y } = ChartUtils.calcScaledPosition(position[0], position[1]);
    const { id } = this.props.singleGraph;
    const data = LabelUtils.getData();
<<<<<<< HEAD
=======
    LabelUtils.pastAndMerge(data, position, [], data.nodes, customFields);

>>>>>>> origin/master
    this.closeModal();
    const { data: res } = await Api.dataPast(id, undefined, [x, y], 'merge-compare', {
      labels: data.labels,
      nodes: data.nodes,
      links: data.links,
      merge,
    }).catch((e) => e.response || {});
    if (res.status === 'error') {
      toast.error(res.message);
    }
    Chart.loading(false);
  }

<<<<<<< HEAD
  copyDocument = async (action, sourceId = undefined) => {
    Chart.loading(true);
=======
  compareAndMerge = (sources, duplicates) => {
>>>>>>> origin/master
    const { position } = this.state;
    const { x, y } = ChartUtils.calcScaledPosition(position[0], position[1]);
    const { id } = this.props.singleGraph;
    const data = LabelUtils.getData();
<<<<<<< HEAD
    this.closeModal();
=======
    let nodes = Chart.getNodes();
    let links = Chart.getLinks();
    nodes = nodes.map((n) => {
      const i = duplicates.findIndex((d) => d && d.name === n.name);
      if (!sources.some((s) => s.id === n.id)) {
        if (i !== -1) {
          return undefined;
        }
        return n;
      }
      if (i > -1) {
        data.nodes = data.nodes.filter((d) => {
          if (d.name === n.name) {
            d.merge = true;
          }
          return d;
        });
      } else {
        data.nodes = data.nodes.filter((d) => d.name !== n.name);
      }
      return n;
    });

    nodes = _.compact(nodes);
    // duplicates = _.compact(duplicates);
>>>>>>> origin/master

    const { data: res } = await Api.dataPast(id, sourceId, [x, y], action, {
      labels: data.labels,
      nodes: data.nodes,
      links: data.links,
    }).catch((e) => e.response);
    if (res.status === 'error') {
      toast.error(res.message);
      Chart.loading(false);
      return;
    }
    await this.props.getSingleGraphRequest(id)
    Chart.loading(false);
  }

<<<<<<< HEAD
  handleLabelEmbed = async (params) => {
    const { x, y } = params;
    const { sourceId } = LabelUtils.getData();
    const position = [x, y];
    await this.setState({ position })
    this.copyDocument('embed', sourceId);
=======
    Chart.render({ nodes, links });
    LabelUtils.past(data, position);

    this.setState({
      compare: {}, data: {}, position: [], showQuestionModal: false, showCompareModal: false,
    });
>>>>>>> origin/master
  }

  render() {
    const {
      compare, data, showQuestionModal, showCompareModal, position,
    } = this.state;
    const {
      singleGraph,
    } = this.props;
    if (!showQuestionModal && !showCompareModal) {
      return null;
    }
    return (
      <>
        <Modal
          isOpen={showQuestionModal}
          className="ghModal graphCopy"
          overlayClassName="ghModalOverlay graphCopyOverlay"
          onRequestClose={this.closeModal}
        >
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeModal} />
          <h2 className="title">
            {`The destinations has ${compare.duplicatedNodes?.length || 0} nodes with the same type and name`}
          </h2>
          <p className="subtitle">
<<<<<<< HEAD
            {'Moving '}
            <span className="headerContents">
              {data.nodes?.length}
            </span>
            {' nodes from '}
            <span className="headerContents">
              {data.title}
            </span>
            {' to '}
            <span className="headerContents">
              {singleGraph.title}
            </span>
            {'. '}
=======
            Moving
            {' '}
            <span className="headerContents">
              {data.nodes.length}
            </span>
            {' '}
            nodes from
            {' '}
            <span className="headerContents">
              {data.title}
            </span>
            {' '}
            to
            {' '}
            <span className="headerContents">
              {singleGraph.title}
            </span>
            .
>>>>>>> origin/master
          </p>
          <div className="buttonsWrapper">
            <div className="part">
              <div className="component">
                <Button
                  onClick={() => this.toggleCompareNodes(true)}
                  className="actionButton"
                  icon={<CompareNodesSvg />}
                />
                <p className="textContent">Compare nodes</p>

              </div>
              <div className="component">
                <Button
<<<<<<< HEAD
                  onClick={() => this.copyDocument('merge')}
=======
                  onClick={() => this.compareAndMerge(compare.sourceNodes, compare.duplicatedNodes)}
>>>>>>> origin/master
                  className="actionButton"
                  icon={<MergeNodesSvg />}
                />
                <p className="textContent">Merge nodes</p>
              </div>
              <div className="component">
<<<<<<< HEAD
                <Button onClick={() => this.copyDocument('skip')} className="actionButton" icon={<SkipNodesSvg />} />
=======
                <Button onClick={this.skipDuplications} className="actionButton" icon={<SkipNodesSvg />} />
>>>>>>> origin/master
                <p className="textContent">Skip these nodes</p>
              </div>
            </div>
            <div className="part">
              <div className="component">
<<<<<<< HEAD
                <Button onClick={() => this.copyDocument('replace')} className="actionButton" icon={<ReplaceSvg />} />
                <p className="textContent">Replace the nodes in the destination</p>
              </div>
              <div className="component">
                <Button onClick={() => this.copyDocument('keep')} className="actionButton" icon={<KeepBothSvg />} />
=======
                <Button onClick={this.replaceDuplications} className="actionButton" icon={<ReplaceSvg />} />
                <p className="textContent">Replace the nodes in the destination</p>
              </div>
              <div className="component">
                <Button onClick={this.fixDuplications} className="actionButton" icon={<KeepBothSvg />} />
>>>>>>> origin/master
                <p className="textContent">Keep both</p>
              </div>
            </div>
          </div>
        </Modal>
        {showCompareModal
          ? (
            <LabelCompare
              compare={compare}
              position={position}
              onRequestClose={() => this.toggleCompareNodes(false)}
              onSubmit={this.compareAndMerge}
            />
          )
          : null}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
});
const mapDispatchToProps = {
  copyDocumentForGraphRequest,
  removeNodeCustomFieldKey,
  createNodesRequest,
  updateNodesRequest,
  deleteNodesRequest,
  createLinksRequest,
  createLabelsRequest,
  getSingleGraphRequest
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LabelCopy);

export default Container;
