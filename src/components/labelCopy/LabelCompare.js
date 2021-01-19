import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import _ from 'lodash';
import LabelUtils from '../../helpers/LabelUtils';
import LabelCompareItem from './LabelCompareItem';
import Button from '../form/Button';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';
import CustomFields from '../../helpers/CustomFields';
import { removeNodeCustomFieldKey, renameNodeCustomFieldKey } from '../../store/actions/graphs';

class LabelCompare extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sources: [],
      duplicates: [],
    };
  }

  handleChange = (checked, d, type) => {
    const checkedItems = this.state[type];
    const i = checkedItems.findIndex((id) => id === d.id);
    if (checked) {
      if (i === -1) {
        checkedItems.push(d);
      }
    } else {
      checkedItems.splice(i, 1);
    }
    this.setState({ [type]: checkedItems });
  }

  toggleAllSource = () => {
    const {
      compare: { sourceNodes },
    } = this.props;
    let { sources } = this.state;
    if (sourceNodes.length !== sources.length) {
      sources = _.cloneDeep(sourceNodes);
    } else {
      sources = [];
    }
    this.setState({ sources });
  }

  toggleAllDuplicate = () => {
    const {
      compare: { duplicatedNodes },
    } = this.props;
    let { duplicates } = this.state;
    if (duplicatedNodes.length !== duplicates.length) {
      duplicates = _.cloneDeep(duplicatedNodes);
    } else {
      duplicates = [];
    }
    this.setState({ duplicates });
  }

  handleSubmit = () => {
    const { position, customFields } = this.props;
    const { sources, duplicates } = this.state;
    const data = LabelUtils.getData();
    LabelUtils.pastAndMerge(data, position, sources, duplicates, customFields);
    this.props.closeAll();
  }

  render() {
    const {
      compare: { duplicatedNodes, sourceNodes }, onRequestClose, customFields, singleGraph,
    } = this.props;
    const { sources, duplicates } = this.state;
    const data = LabelUtils.getData();
    return (
      <Modal
        isOpen
        className="ghModal graphCompare"
        overlayClassName="ghModalOverlay graphCompareOverlay"
        onRequestClose={onRequestClose}
      >
        <h2 className="title">
          Which nodes do you want to keep?
        </h2>
        <h4 className="subtitle">
          If you select both versions, the moved node will have a number added to its name.
        </h4>
        <ul className="compareList">
          <li className="item">
            <div className="bottom">
              <div className="node node_left">
                <input
                  type="checkbox"
                  checked={sources.length === sourceNodes.length}
                  onClick={() => this.toggleAllSource()}
                />
                {'Nodes from '}
                <span>{singleGraph.title}</span>
              </div>
              <div className="node node_right">
                <input
                  type="checkbox"
                  checked={duplicates.length === duplicatedNodes.length}
                  onClick={() => this.toggleAllDuplicate()}
                />
                {'Nodes already in from '}
                <span>{data.title}</span>
              </div>
            </div>
          </li>
          {duplicatedNodes.map((nodeDuplicate) => {
            const nodeSource = sourceNodes.find((n) => n.name === nodeDuplicate.name);
            return (
              <li className="item">
                <div className="top">
                  <span className="name">{nodeSource.name}</span>
                </div>
                <div className="bottom">
                  <div className="node node_left">
                    <LabelCompareItem
                      node={nodeSource}
                      customFields={customFields}
                      checked={sources.some((d) => d.id === nodeSource.id)}
                      onChange={(checked) => this.handleChange(checked, nodeSource, 'sources')}
                    />
                  </div>
                  <div className="node node_right">
                    <LabelCompareItem
                      node={nodeDuplicate}
                      customFields={data.customFields}
                      checked={duplicates.some((d) => d.id === nodeSource.id)}
                      onChange={(checked) => this.handleChange(checked, nodeDuplicate, 'duplicates')}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <Button type="submit" onClick={this.handleSubmit}>Save</Button>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {
  removeNodeCustomFieldKey,
  renameNodeCustomFieldKey,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LabelCompare);

export default Container;
