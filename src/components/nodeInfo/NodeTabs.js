import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Button from '../form/Button';
import NodeTabsContent from './NodeTabsContent';
import CustomFields from '../../helpers/CustomFields';
import memoizeOne from "memoize-one";
import Tooltip from "rc-tooltip";
import { Link } from "react-router-dom";

class NodeTabs extends Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      activeTab: '',
    };
  }

  setFirstTab = memoizeOne((customField) => {
    this.setState({ activeTab: Object.keys(customField)[0] });
  }, _.isEqual);

  setActiveTab = (activeTab) => {
    this.setState({ activeTab });
  }

  render() {
    const { activeTab } = this.state;
    const { node: { type, name }, customFields } = this.props;
    const customField = CustomFields.get(customFields, type, name);
    const content = customField[activeTab];
    this.setFirstTab(customField);
    return (
      <div className="nodeTabs">
        <div className="tabs">
          {_.map(customField, (val, key) => (
            <Button
              className={activeTab === key ? 'active' : undefined}
              key={key}
              onClick={() => this.setActiveTab(key)}
            >
              {key}
            </Button>
          ))}
          <Tooltip overlay="Add New Tab" placement="top">
            <Button icon="fa-plus" onClick={this.toggleNewField} />
          </Tooltip>
        </div>
        <NodeTabsContent content={content} />
      </div>
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
)(NodeTabs);

export default Container;
