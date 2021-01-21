import React, { Component } from 'react';
import _ from 'lodash';
import Modal from 'react-modal';
import ContextMenu from '../contextMenu/ContextMenu';
import LabelUtils from '../../helpers/LabelUtils';
import Button from '../form/Button';
import Chart from '../../Chart';
import LabelCompare from './LabelCompare';
import { connect } from "react-redux";
import CustomFields from "../../helpers/CustomFields";
import { removeNodeCustomFieldKey } from "../../store/actions/graphs";
import ChartUtils from "../../helpers/ChartUtils";

class LabelCopy extends Component {
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

  fixDuplications = () => {
    const { position } = this.state;
    const data = LabelUtils.getData();
    LabelUtils.past(data, position);
    this.closeModal();
  }

  handleLabelAppend = (ev, params) => {
    const { x, y } = params;
    const compare = LabelUtils.compare();
    const position = [x, y];
    const data = LabelUtils.getData();
    if (_.isEmpty(compare.duplicatedNodes)) {
      LabelUtils.past(data, position);
      return;
    }
    this.setState({
      compare, data, position, showQuestionModal: true,
    });
  }

  skipDuplications = () => {
    const { compare: { duplicatedNodes }, position } = this.state;
    const data = LabelUtils.getData();
    data.nodes = data.nodes.filter((n) => !duplicatedNodes.some((d) => n.name === d.name));
    data.links = ChartUtils.cleanLinks(data.links, data.nodes);
    LabelUtils.past(data, position);
    this.closeModal();
  }

  closeModal = () => {
    this.setState({
      compare: {}, data: {}, position: [], showQuestionModal: false,
    });
  }

  replaceDuplications = () => {
    const { customFields } = this.props;
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
    LabelUtils.past(data, position);
    this.closeModal();
  }

  toggleCompareNodes = (showCompareModal) => {
    this.setState({ showCompareModal });
  }

  merge = () => {
    const { customFields } = this.props;
    const { position } = this.state;
    const data = LabelUtils.getData();
    LabelUtils.pastAndMerge(data, position, [], data.nodes, customFields);
    this.closeModal();
  }

  render() {
    const {
      compare, data, showQuestionModal, showCompareModal, position
    } = this.state;
    const {
      singleGraph
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
          <h4 className="subtitle">
            {`Moving ${data.nodes.length} nodes from ${data.title} to ${singleGraph.title}.`}
          </h4>
          <h2 className="title">
            {`The destinations has ${compare.duplicatedNodes?.length || 0} nodes with the same type and name`}
          </h2>
          <div className="buttonsWrapper">
            <Button onClick={() => this.toggleCompareNodes(true)} className="actionButton" icon="fa-balance-scale">
              Compare nodes
            </Button>
            <Button onClick={this.merge} className="actionButton" icon="fa-code-fork">
              Merge nodes
            </Button>
            <Button onClick={this.replaceDuplications} className="actionButton" icon="fa-retweet">
              Replace the nodes in the destination
            </Button>
            <Button onClick={this.skipDuplications} className="actionButton" icon="fa-compress">
              Skip these nodes
            </Button>
            <Button onClick={this.fixDuplications} className="actionButton" icon="fa-clone">
              Keep both
            </Button>
          </div>
        </Modal>
        {showCompareModal ?
          <LabelCompare
            nodes={Chart.getNodes()}
            compare={compare}
            position={position}
            onRequestClose={() => this.toggleCompareNodes(false)}
            closeAll={() => {
              this.toggleCompareNodes(false);
              this.closeModal();
            }}
          />
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
  removeNodeCustomFieldKey
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LabelCopy);

export default Container;
