import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import _ from 'lodash';
import LabelUtils from '../../helpers/LabelUtils';
import LabelCompareItem from './LabelCompareItem';
import Button from '../form/Button';
import { removeNodeCustomFieldKey, renameNodeCustomFieldKey } from '../../store/actions/graphs';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
<<<<<<< HEAD
import Checkbox from '../form/Checkbox';
=======
>>>>>>> origin/master

class LabelCompare extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sources: [],
      duplications: [],
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
    let { duplications } = this.state;
    if (duplicatedNodes.length !== duplications.length) {
      duplications = _.cloneDeep(duplicatedNodes);
    } else {
      duplications = [];
    }
    this.setState({ duplications });
  }

  handleSubmit = () => {
    const { sources, duplications } = this.state;

    if (sources.length || duplications.length) {
      this.props.onSubmit(sources, duplications);
    }
  }

  render() {
    const {
      compare: { duplicatedNodes, sourceNodes }, onRequestClose, customFields,
    } = this.props;

<<<<<<< HEAD
    const { sources, duplications } = this.state;
=======
    const { sources, duplicates } = this.state;
>>>>>>> origin/master
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
            <li className="item allChecked">
              <div className="bottom">
                <div className="node node_left">
                  <div className="allCheckedContent">
<<<<<<< HEAD
                    <Checkbox
                      id="all_left"
                      label="Select all"
                      onChange={() => this.toggleAllDuplicate()}
                      checked={duplications.length === duplicatedNodes.length}
=======
                    <input
                      onChange={() => this.toggleAllDuplicate()}
                      checked={duplicates.length === duplicatedNodes.length}
                      className="graphsCheckbox"
                      type="checkbox"
                      name="layout"
                      id="all_left"
                      value="All"
>>>>>>> origin/master
                    />
                    <label className="pull-left" htmlFor="all_left"> Select all </label>
                  </div>
                </div>
                <div className="node node_right">
                  <div className="allCheckedContent">
<<<<<<< HEAD
                    <Checkbox
                      id="all_right"
                      label="Select all"
                      onChange={() => this.toggleAllSource()}
                      checked={sources.length === sourceNodes.length}
=======
                    <input
                      onChange={() => this.toggleAllSource()}
                      checked={sources.length === sourceNodes.length}
                      className="graphsCheckbox"
                      type="checkbox"
                      name="layout"
                      id="all_right"
                      value="All"
>>>>>>> origin/master
                    />
                    <label className="pull-left" htmlFor="all_right"> Select all </label>
                  </div>
                </div>
              </div>
            </li>
            {duplicatedNodes.map((nodeDuplicate) => {
              const nodeSource = sourceNodes.find((n) => n.name === nodeDuplicate.name);
              return (
                <li className="item">
                  <div className="bottom">
                    <div className="node node_left">
                      <LabelCompareItem
                        node={nodeDuplicate}
                        customFields={data.customFields}
<<<<<<< HEAD
                        checked={duplications.some((d) => d.id === nodeDuplicate.id)}
                        onChange={(checked) => this.handleChange(checked, nodeDuplicate, 'duplications')}
=======
                        checked={duplicates.some((d) => d.id === nodeDuplicate.id)}
                        onChange={(checked) => this.handleChange(checked, nodeDuplicate, 'duplicates')}
>>>>>>> origin/master
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
<<<<<<< HEAD
          <Button onClick={this.handleSubmit} className="alt main" type="submit">
=======
          <Button onClick={this.handleSubmit} className="ghButton accent alt main main" type="submit">
>>>>>>> origin/master
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
