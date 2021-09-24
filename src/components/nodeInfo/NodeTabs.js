import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import Tooltip from 'rc-tooltip/es';
import Button from '../form/Button';
import NodeTabsContent from './NodeTabsContent';
import ContextMenu from '../contextMenu/ContextMenu';
<<<<<<< HEAD
import { getNodeCustomFieldsRequest, removeNodeCustomFieldKey, setActiveTab } from '../../store/actions/graphs';
import Sortable from './Sortable';
import ChartUtils from '../../helpers/ChartUtils';
import { updateNodesCustomFieldsRequest } from '../../store/actions/nodes';
import Utils from '../../helpers/Utils';
import Api from '../../Api';
import NodeTabsFormModal from './NodeTabsFormModal';
=======
import { removeNodeCustomFieldKey, setActiveTab } from '../../store/actions/graphs';
import FlexTabs from '../FlexTabs';
import MapsInfo from '../maps/MapsInfo';
>>>>>>> origin/master

class NodeTabs extends Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    removeNodeCustomFieldKey: PropTypes.func.isRequired,
    activeTab: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired,
<<<<<<< HEAD
  };
=======
  }
>>>>>>> origin/master

  constructor(props) {
    super(props);
    this.state = {
      activeTab: '',
      updateCustomField: null,
      formModalOpen: null,
    };
  }

<<<<<<< HEAD
  updateTabFilePath = async (data) => {
    const { graphId, nodeId, nodeCustomFields } = this.props;

    let changedPath = false;

    for (let i = 0; i < nodeCustomFields.length; i++) {
      const tab = nodeCustomFields[i];

      if (tab.value?.includes('blob')) {
        const { documentElement } = Utils.tabHtmlFile(tab.value);

        for (let j = 0; j < documentElement.length; j++) {
          const media = documentElement[j];

          const documentPath = media.querySelector('img')?.src ?? media.querySelector('a')?.href;

          if (documentPath) {
            const id = media.querySelector('#docId').innerText;
            const path = await Api.documentPath(graphId, id).catch((d) => d);

            nodeCustomFields[i].value = nodeCustomFields[i].value.replace(documentPath, path.data?.path);

            changedPath = true;
          }
        }
      }
    }

    this.props.updateNodesCustomFieldsRequest(graphId, [{
      id: nodeId,
      customFields: nodeCustomFields,
    }]);

    if (data) {
      this.setState({ formModalOpen: null });
    }
  }

  setDocumentsPath = memoizeOne(async () => {
    await this.updateTabFilePath();
  }, _.isEqual);

  setFirstTab = memoizeOne(() => {
    this.setState({ activeTab: '_description' });
    this.props.setActiveTab('_description');
=======
  setFirstTab = memoizeOne((node, customField) => {
    this.setState(
      {
        activeTab: !_.isEmpty(customField)
          ? (this.props.activeTab ? this.props.activeTab : Object.keys(customField)[0])
          : node.location ? '_location' : '',
      },
    );
    this.props.setActiveTab('');
>>>>>>> origin/master
  }, _.isEqual);

  componentDidMount() {
    ContextMenu.event.on('node.fields-edit', this.openFormModal);
    ContextMenu.event.on('node.fields-delete', this.deleteCustomField);
  }

  componentWillUnmount() {
    ContextMenu.event.removeListener('node.fields-edit', this.openFormModal);
    ContextMenu.event.removeListener(
      'node.fields-delete',
      this.deleteCustomField,
    );
  }

  setActiveTab = (activeTab) => {
    this.setState({ activeTab });
  };

  openFormModal = (ev, params) => {
    this.setState({ formModalOpen: params || '' });
  };

  closeFormModal = async (data) => {
    await this.updateTabFilePath(data);
  }

  deleteCustomField = (ev, fieldName = {}) => {
    const { nodeId, graphId } = this.props;
    if (fieldName && window.confirm('Are you sure?')) {
      const { nodeCustomFields } = this.props;
      this.props.updateNodesCustomFieldsRequest(graphId, [{
        id: nodeId,
        customFields: nodeCustomFields.filter((f) => f.name !== fieldName),
      }]);
    }
    this.setActiveTab('_description');
  };

  handleOrderChange = (customFields) => {
    const { nodeId, graphId } = this.props;
    this.props.updateNodesCustomFieldsRequest(graphId, [{
      id: nodeId,
      customFields,
    }]);
    // Chart.setNodeData(nodeId, { customFields });
    this.forceUpdate();
  }

  /**
   * Show/Hide tab data scroll arrow
   */
  componentDidUpdate(nextProps, nextState) {
    const tabData = document.getElementsByClassName('tab-data')[0];

    if (tabData && tabData.childElementCount && tabData.scrollWidth > 650) {
      document.querySelectorAll('.left-arrow, .right-arrow').forEach((box) => { box.style.display = 'flex'; });
    } else {
      document.querySelectorAll('.left-arrow, .right-arrow').forEach((box) => { box.style.display = 'none'; });
    }
  }

  render() {
    const { activeTab, formModalOpen } = this.state;
    const {
      nodeId, editable, nodeCustomFields,
    } = this.props;
    const node = ChartUtils.getNodeById(nodeId);

    this.setFirstTab();

    this.setDocumentsPath();

    if (!_.isNull(formModalOpen) && nodeCustomFields[0]?.name !== '_description') {
      nodeCustomFields.unshift({
        value: node.description,
        name: '_description',
      });
    }

    return (
      <div className="nodeTabs">
<<<<<<< HEAD
        <div className="container-tabs">
          <div className="tab-names">
            <Sortable
              onChange={this.handleOrderChange}
              items={nodeCustomFields.filter((p) => p.name !== '_description')}
              keyExtractor={(v) => v.name}
              editable={editable}
              node={node}
              activeTab={activeTab}
              setActiveTab={this.setActiveTab}
              openAddTabModal={this.openFormModal}
              renderItem={(p) => (
                <Tooltip overlay={<div className="tab-data-hover">{p.value.name}</div>} placement="top">
                  <Button
                    className={`${activeTab === p.value.name ? 'active' : ''} tab-button`}
                    key={p.value.name}
                    onMouseDown={() => this.setActiveTab(p.value.name)}
                  >
                    <p>{p.value.name}</p>
                  </Button>
                </Tooltip>
              )}
            />
          </div>
        </div>
=======
        <FlexTabs>
          {_.map(customField, (val, key) => (
            <Button
              className={activeTab === key ? 'active' : undefined}
              key={key}
              onClick={() => this.setActiveTab(key)}
            >
              <p>{key.length > 15 ? `${key.substr(0, 13)}..` : key}</p>
            </Button>
          ))}
          {node.location ? (
            <Button
              className={activeTab === '_location' ? 'active activeNoShadow' : undefined}
              onClick={() => this.setActiveTab('_location')}
            >
              <p>Location</p>
            </Button>
          ) : null}
          {editable && !node.sourceId && Object.values(customField).length < CustomFields.LIMIT ? (
            <Tooltip overlay="Add New Tab" placement="top">
              <Button className="addTab" icon="fa-plus" onClick={() => this.openFormModal()} />
            </Tooltip>
          ) : null}
          <div className="empty" />
        </FlexTabs>
>>>>>>> origin/master
        {!_.isNull(formModalOpen) ? (
          <NodeTabsFormModal
            node={node}
            customFields={nodeCustomFields}
            fieldName={formModalOpen}
            onClose={this.closeFormModal}
            setActiveTab={this.setActiveTab}
          />
        ) : null}
        <details id="tab-title">
          <summary
            onClick={() => {
              document.getElementById('connection-title')?.removeAttribute('open');
            }}
          >
            Tabs
          </summary>
          {(activeTab !== '_location')
          && (
          <NodeTabsContent
            name={activeTab}
            node={node}
            customFields={nodeCustomFields}
            activeTab={activeTab}
            openAddTabModal={this.openFormModal}
            deleteCustomField={this.deleteCustomField}
          />
          )}
        </details>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
<<<<<<< HEAD
  activeTab: state.graphs.activeTab,
  graphId: state.graphs.singleGraph.id,
  nodeCustomFields: state.graphs.nodeCustomFields,
=======
  customFields: state.graphs.singleGraph.customFields || {},
  activeTab: state.graphs.activeTab,
>>>>>>> origin/master
});

const mapDispatchToProps = {
  setActiveTab,
  removeNodeCustomFieldKey,
  getNodeCustomFieldsRequest,
  updateNodesCustomFieldsRequest,
};

const Container = connect(mapStateToProps, mapDispatchToProps)(NodeTabs);

export default Container;
