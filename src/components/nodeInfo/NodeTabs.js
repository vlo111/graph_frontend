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
import ContextMenu from '../contextMenu/ContextMenu';
import { removeNodeCustomFieldKey, setActiveTab } from '../../store/actions/graphs';
import FlexTabs from '../FlexTabs';
import MapsInfo from '../maps/MapsInfo';
import Chart from '../../Chart';
import Sortable from './Sortable';
import ChartUtils from '../../helpers/ChartUtils';

class NodeTabs extends Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    removeNodeCustomFieldKey: PropTypes.func.isRequired,
    activeTab: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      activeTab: '',
      formModalOpen: null,
      showLocation: false,
    };
  }

  setFirstTab = memoizeOne((node, customFields) => {
    if (node.location) {
      this.setState({ activeTab: '_location' });
    } else {
      this.setState({ activeTab: _.get(customFields, '[0].name', '') });
    }
    this.props.setActiveTab('');
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

  closeFormModal = (data) => {
    this.setState({ formModalOpen: null, activeTab: data.name });
  }

  deleteCustomField = (ev, params = {}) => {
    const { fieldName } = params;
    const { node } = this.props;
    if (fieldName && window.confirm('Are you sure?')) {
      if (node.customFields) {
        this.props.removeNodeCustomFieldKey(node.type, fieldName, node.id);
        const customFields = node.customFields.filter((f) => f.name !== fieldName);
        Chart.setNodeData(node.id, { customFields });
      }
    }
  }

  showLocation() {
    this.setState({ showLocation: true });
  }

  handleOrderChange = (customFields) => {
    const { nodeId } = this.props;
    Chart.setNodeData(nodeId, { customFields });
    this.forceUpdate();
  }

  render() {
    const { activeTab, formModalOpen } = this.state;
    const { nodeId, editable } = this.props;
    const node = ChartUtils.getNodeById(nodeId);
    const customFields = CustomFields.getCustomField(node, Chart.getNodes());
    this.setFirstTab(node, customFields);
    return (
      <div className="nodeTabs">

        <div className="container-tabs">
          {node.location ? (
            <Button
              className={activeTab === '_location' ? 'active activeNoShadow' : undefined}
              onClick={() => this.setActiveTab('_location')}
            >
              <p>Location</p>
            </Button>
          ) : null}

          <Sortable
            onChange={this.handleOrderChange}
            items={customFields}
            keyExtractor={(v) => v.name}
            renderItem={(p) => (
              <Button
                className={activeTab === p.value.name ? 'active' : undefined}
                key={p.value.name}
                onClick={() => this.setActiveTab(p.value.name)}
              >
                <p>{p.value.name}</p>
              </Button>
            )}
          />

          {editable && !node.sourceId && node.customFields?.length < CustomFields.LIMIT ? (
            <Tooltip overlay="Add New Tab" placement="top">
              <Button className="addTab" icon="fa-plus" onClick={() => this.openFormModal()} />
            </Tooltip>
          ) : null}
        </div>
        {!_.isNull(formModalOpen) ? (
          <NodeTabsFormModal
            node={node}
            fieldName={formModalOpen}
            onClose={this.closeFormModal}
          />
        ) : null}
        {activeTab === '_location' ? (
          this.state.showLocation
            ? <MapsInfo node={node} />
            : (
              <div className="contentWrapper">
                <Button
                  icon="fa-globe"
                  className=" ghButton2  mapTabButton"
                  href="#"
                  onClick={() => this.showLocation()}
                >
                  Show on Map
                </Button>
              </div>
            )
        ) : (
          <NodeTabsContent name={activeTab} node={node} />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  customFields: state.graphs.singleGraph.customFields || {},
  activeTab: state.graphs.activeTab,
});

const mapDispatchToProps = {
  setActiveTab,
  removeNodeCustomFieldKey,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeTabs);

export default Container;
