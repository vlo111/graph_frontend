import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import Tooltip from 'rc-tooltip';
import Button from '../form/Button';
import NodeTabsContent from './NodeTabsContent';
import CustomFields from '../../helpers/CustomFields';
import NodeTabsFormModal from './NodeTabsFormModal';
import ContextMenu from '../ContextMenu';
import { removeNodeCustomFieldKey } from '../../store/actions/graphs';
import FlexTabs from "../FlexTabs";
import MapsInfo from "../maps/MapsInfo";

class NodeTabs extends Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    removeNodeCustomFieldKey: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      activeTab: '',
      formModalOpen: null,
    };
  }

  setFirstTab = memoizeOne((node, customField) => {
    this.setState({ activeTab: node.location ? '_location' : Object.keys(customField)[0] });
  }, _.isEqual);

  componentDidMount() {
    ContextMenu.event.on('node.fields-edit', this.openFormModal);
    ContextMenu.event.on('node.fields-delete', this.deleteCustomField);
  }

  componentWillUnmount() {
    ContextMenu.event.removeListener('node.fields-edit', this.openFormModal);
    ContextMenu.event.removeListener('node.fields-delete', this.deleteCustomField);
  }

  setActiveTab = (activeTab) => {
    this.setState({ activeTab });
  }

  openFormModal = (ev, params) => {
    this.setState({ formModalOpen: params?.fieldName || '' });
  }

  closeFormModal = () => {
    this.setState({ formModalOpen: null });
  }

  deleteCustomField = (ev, params = {}) => {
    const { fieldName } = params;
    const { node } = this.props;
    if (fieldName && window.confirm('Are you sure?')) {
      this.props.removeNodeCustomFieldKey(node.type, fieldName);
    }
  }

  render() {
    const { activeTab, formModalOpen } = this.state;
    const { node, customFields, editable } = this.props;
    const customField = CustomFields.get(customFields, node.type, node.name);
    const content = customField[activeTab];
    this.setFirstTab(node, customField);
    return (
      <div className="nodeTabs">
        <FlexTabs>
          {node.location ? (
            <Button
              className={activeTab === '_location' ? 'active activeNoShadow' : undefined}
              onClick={() => this.setActiveTab('_location')}
            >
              <p>Location</p>
            </Button>
          ) : null}
          {_.map(customField, (val, key) => (
            <Button
              className={activeTab === key ? 'active' : undefined}
              key={key}
              onClick={() => this.setActiveTab(key)}
            >
              <p>{key}</p>
            </Button>
          ))}
          {editable && Object.values(customField).length < CustomFields.LIMIT ? (
            <Tooltip overlay="Add New Tab" placement="top">
              <Button className="addTab" icon="fa-plus" onClick={() => this.openFormModal()} />
            </Tooltip>
          ) : null}
          <div className="empty" />
        </FlexTabs>
        {!_.isNull(formModalOpen) ? (
          <NodeTabsFormModal
            node={node}
            fieldName={formModalOpen}
            customField={customField}
            onClose={this.closeFormModal}
          />
        ) : null}
        {activeTab === '_location' ? (
          <MapsInfo node={node} />
        ) : (
          <NodeTabsContent name={activeTab} node={node} content={content} />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {
  removeNodeCustomFieldKey,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeTabs);

export default Container;
