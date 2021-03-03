import React, { Component } from 'react';
import _ from 'lodash';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
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
import { createNodesRequest, deleteNodesRequest, updateNodesRequest } from '../../store/actions/nodes';
import { createLinksRequest } from '../../store/actions/links';
import { createLabelsRequest } from '../../store/actions/labels';

class LabelCopy extends Component {
  static propTypes = {
    copyDocumentForGraphRequest: PropTypes.func.isRequired,
    singleGraph: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
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
  }

  componentWillUnmount() {
    ContextMenu.event.removeListener('label.append', this.handleLabelAppend);
  }

  copyDocuments = (fromGraphId, toGraphId, nodes) => {
    this.props.copyDocumentForGraphRequest(
      {
        graphId: fromGraphId,
        toGraphId,
        nodes,
      },
    );
  }

  fixDuplications = async () => {
    const { position } = this.state;
    const { id } = this.props.singleGraph;
    const data = LabelUtils.getData();
    this.copyDocuments(data.sourceId, id, data.nodes);
    this.closeModal();
    const { updateNodes, createNodes } = await LabelUtils.past(data, position);
    console.log(updateNodes, createNodes);
  }

  handleLabelAppend = async (ev, params) => {
    const { x, y } = params;
    const { singleGraph } = this.props;
    const compare = LabelUtils.compare();
    const position = [x, y];
    const data = LabelUtils.getData();
    if (_.isEmpty(compare.duplicatedNodes)) {
      this.copyDocuments(data.sourceId, singleGraph.id, data.nodes);
      // const { createNodes, createLinks, createLabel } = await LabelUtils.past(data, position);
      // this.props.createNodesRequest(singleGraph.id, createNodes);
      // this.props.createLinksRequest(singleGraph.id, createLinks);
      // this.props.createLabelsRequest(singleGraph.id, [createLabel]);
      return;
    }
    this.setState({
      compare, data, position, showQuestionModal: true,
    });
  }

  skipDuplications = async () => {
    const { compare: { duplicatedNodes, sourceNodes }, position } = this.state;
    const { singleGraph } = this.props;
    const data = LabelUtils.getData();
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
    this.copyDocuments(data.sourceId, singleGraph.id, data.nodes);
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
      compare: {}, data: {}, position: [], showQuestionModal: false,
    });
  }

  replaceDuplications = async () => {
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
    this.copyDocuments(data.sourceId, singleGraph.id, data.nodes);

    this.closeModal();
    // const { updateNodes, createNodes, createLinks, createLabel } = await LabelUtils.past(data, position);
    // this.props.updateNodesRequest(singleGraph.id, updateNodes);
    // this.props.createNodesRequest(singleGraph.id, createNodes);
    // this.props.createLinksRequest(singleGraph.id, createLinks);
    // this.props.createLabelsRequest(singleGraph.id, [createLabel]);
  }

  toggleCompareNodes = (showCompareModal) => {
    this.setState({ showCompareModal });
  }

  compareAndMerge = async (sources, duplicates) => {
    const { position } = this.state;
    const { singleGraph } = this.props;
    const data = LabelUtils.getData();
    let nodes = Chart.getNodes();
    let links = Chart.getLinks();
    const deleteNodes = [];
    nodes = nodes.map((n) => {
      const i = duplicates.findIndex((d) => d && d.name === n.name);
      if (!sources.some((s) => s.id === n.id)) {
        if (i !== -1) {
          deleteNodes.push(n);
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

    links = ChartUtils.cleanLinks(links, nodes);

    Chart.render({ nodes, links });

    this.setState({
      compare: {}, data: {}, position: [], showQuestionModal: false, showCompareModal: false,
    });
    // const { updateNodes, createNodes, createLinks, createLabel } = await LabelUtils.past(data, position);
    // this.props.updateNodesRequest(singleGraph.id, updateNodes);
    // this.props.createNodesRequest(singleGraph.id, createNodes);
    // this.props.deleteNodesRequest(singleGraph.id, deleteNodes);
    //
    // this.props.createLinksRequest(singleGraph.id, createLinks);
    // this.props.createLabelsRequest(singleGraph.id, [createLabel]);
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
                  onClick={() => this.compareAndMerge(compare.sourceNodes, compare.duplicatedNodes)}
                  className="actionButton"
                  icon={<MergeNodesSvg />}
                />
                <p className="textContent">Merge nodes</p>
              </div>
              <div className="component">
                <Button onClick={this.skipDuplications} className="actionButton" icon={<SkipNodesSvg />} />
                <p className="textContent">Skip these nodes</p>
              </div>
            </div>
            <div className="part">
              <div className="component">
                <Button onClick={this.replaceDuplications} className="actionButton" icon={<ReplaceSvg />} />
                <p className="textContent">Replace the nodes in the destination</p>
              </div>
              <div className="component">
                <Button onClick={this.fixDuplications} className="actionButton" icon={<KeepBothSvg />} />
                <p className="textContent">Keep both</p>
              </div>
            </div>
          </div>
        </Modal>
        {showCompareModal
          ? (
            <LabelCompare
              nodes={Chart.getNodes()}
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
  customFields: state.graphs.singleGraph.customFields || {},
});
const mapDispatchToProps = {
  copyDocumentForGraphRequest,
  removeNodeCustomFieldKey,
  createNodesRequest,
  updateNodesRequest,
  deleteNodesRequest,
  createLinksRequest,
  createLabelsRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LabelCopy);

export default Container;
