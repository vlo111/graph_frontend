import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import _ from 'lodash';
import LabelUtils from '../../helpers/LabelUtils';
import LabelCompareItem from './LabelCompareItem';
import Button from "../form/Button";
import Chart from "../../Chart";
import ChartUtils from "../../helpers/ChartUtils";

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
      sources = sourceNodes;
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
      duplicates = duplicatedNodes;
    } else {
      duplicates = [];
    }
    this.setState({ duplicates });
  }

  handleSubmit = () => {
    const { compare: { duplicatedNodes, sourceNodes } } = this.props;
    const { sources, duplicates } = this.state;
    const data = LabelUtils.getData();
    let links = Chart.getLinks();
    let nodes = Chart.getNodes();
    data.nodes = duplicates.map((n) => {
      const merge = sources.find((d) => n.name === d.name);
      if (merge) {
        const originalId = n.id;
        n.id = merge.id;
        n.merge = true;
        data.links = data.links.map((l) => {
          if (l.source === originalId) {
            l.source = n.id;
          }
          if (l.target === originalId) {
            l.target = n.id;
          }
          return l;
        });
      } else {
        nodes = nodes.filter((d) => n.name !== d.name);
      }

      return n;
    });
    links = ChartUtils.cleanLinks(links, nodes);
    Chart.render({ nodes, links });
    LabelUtils.past(data, [0, 0]);
    this.props.closeAll();
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
                <span>A</span>
              </div>
              <div className="node node_right">
                <input
                  type="checkbox"
                  checked={duplicates.length === duplicatedNodes.length}
                  onClick={() => this.toggleAllDuplicate()}
                />
                {'Nodes already in from '}
                <span>B</span>
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
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LabelCompare);

export default Container;
