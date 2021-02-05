import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import _ from 'lodash';
import LabelUtils from '../../helpers/LabelUtils';
import LabelCompareItem from './LabelCompareItem';
import Button from '../form/Button';
import { removeNodeCustomFieldKey, renameNodeCustomFieldKey } from '../../store/actions/graphs';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';

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
    const { sources, duplicates } = this.state;
    this.props.onSubmit(sources, duplicates);
  }

  render() {
    const {
      compare: { duplicatedNodes, sourceNodes }, onRequestClose, customFields,
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
        <Button color="transparent" className="close" icon={<CloseSvg />} onClick={onRequestClose} />
        <div className="graphCompareContainer">
          <h2 className="title">
            Select nodes you want to keep
          </h2>
          <h4 className="subtitle">
            If you select both versions, the moved node will have a number added to its name.
          </h4>
          <ul className="compareList">
            {duplicatedNodes.map((nodeDuplicate) => {
              const nodeSource = sourceNodes.find((n) => n.name === nodeDuplicate.name);
              return (
                <li className="item">
                  <div className="bottom">
                    <div className="node node_left">
                      <LabelCompareItem
                        node={nodeDuplicate}
                        customFields={data.customFields}
                        checked={duplicates.some((d) => d.id === nodeDuplicate.id)}
                        onChange={(checked) => this.handleChange(checked, nodeDuplicate, 'duplicates')}
                      />
                    </div>
                    <div className="node node_right">
                      <LabelCompareItem
                        node={nodeSource}
                        customFields={customFields}
                        checked={sources.some((d) => d.id === nodeSource.id)}
                        onChange={(checked) => this.handleChange(checked, nodeSource, 'sources')}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <Button onClick={this.handleSubmit} className="ghButton accent alt main main" type="submit">
            Save
          </Button>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
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
