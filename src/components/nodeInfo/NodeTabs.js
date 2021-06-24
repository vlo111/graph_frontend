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
import { getNodeCustomFieldsRequest, removeNodeCustomFieldKey, setActiveTab } from '../../store/actions/graphs';
import MapsInfo from '../maps/MapsInfo';
import Sortable from './Sortable';
import ChartUtils from '../../helpers/ChartUtils';
import { updateNodesCustomFieldsRequest } from "../../store/actions/nodes";
import Loading from "../Loading";
import Utils from "../../helpers/Utils";
import Api from "../../Api";

class NodeTabs extends Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    removeNodeCustomFieldKey: PropTypes.func.isRequired,
    activeTab: PropTypes.string.isRequired,
    setActiveTab: PropTypes.func.isRequired,
  };

  constructor(props) {
        super(props);
        this.state = {
            activeTab: '',
            formModalOpen: null,
            loading: false,
            showLocation: false,
            updateCustomField: null,
        };
    }

  updateTabFilePath = async (data) => {
      const {graphId, nodeId, nodeCustomFields} = this.props;
      let changedPath = false;

      for (let i = 0; i < nodeCustomFields.length; i++) {
          const tab = nodeCustomFields[i];

          if (tab.value.includes('blob')) {

              const { documentElement } = Utils.tabHtmlFile(tab.value);

              for (let j = 0; j < documentElement.length; j++) {
                  const media = documentElement[j];

                  let documentPath = media.querySelector('img')?.src ?? media.querySelector('a')?.href;

                  if (documentPath) {
                      const id = media.querySelector('#docId').innerText;
                      const path = await Api.documentPath(graphId, id).catch((d) => d);

                      nodeCustomFields[i].value = nodeCustomFields[i].value.replace(documentPath, path.data?.path);

                      changedPath = true;
                  }
              }
          }
      }

      if (changedPath) {
          this.props.updateNodesCustomFieldsRequest(graphId, [{
              id: nodeId,
              customFields: nodeCustomFields,
          }]);
      }
      if (data) {
          this.setState({formModalOpen: null, activeTab: data.name});
      }
  }

  setDocumentsPath = memoizeOne(async () => {
        await this.updateTabFilePath();
    }, _.isEqual);

  setFirstTab = memoizeOne((location, customField) => {
    if (location) {
      this.setState({ activeTab: "_location" });
      this.setActiveTab("_location");
    } else if (this.state.activeTab) {
      this.setActiveTab("");
      return;
    } else {
      this.setState({ activeTab: _.get(customField, "name", "") });
    }
    if (this.props.activeTab) {
      this.setActiveTab(this.props.activeTab);
    }
  }, _.isEqual);

  getCustomFields = memoizeOne(async (graphId, nodeId) => {
    this.setState({ loading: true });
    await this.props.getNodeCustomFieldsRequest(graphId, nodeId);
    this.setState({ loading: false });
  }, _.isEqual);

  componentDidMount() {
    ContextMenu.event.on("node.fields-edit", this.openFormModal);
    ContextMenu.event.on("node.fields-delete", this.deleteCustomField);
  }

  componentWillUnmount() {
    ContextMenu.event.removeListener("node.fields-edit", this.openFormModal);
    ContextMenu.event.removeListener(
      "node.fields-delete",
      this.deleteCustomField
    );
  }

  setActiveTab = (activeTab) => {
    this.setState({ activeTab });
  };

  openFormModal = (ev, params) => {
    this.setState({ formModalOpen: params?.fieldName || "" });
  };

  closeFormModal = async (data) => {
        await this.updateTabFilePath(data);
  }

  deleteCustomField = (ev, params = {}) => {
    const { fieldName } = params;
    const { nodeId, graphId } = this.props;
    if (fieldName && window.confirm("Are you sure?")) {
      const { nodeCustomFields } = this.props;
      this.props.updateNodesCustomFieldsRequest(graphId, [
        {
          id: nodeId,
          customFields: nodeCustomFields.filter((f) => f.name !== fieldName),
        },
      ]);
    }
  };

  showLocation() {
    this.setState({ showLocation: true });
  }

  handleOrderChange = (customFields) => {
    const { nodeId, graphId } = this.props;
    this.props.updateNodesCustomFieldsRequest(graphId, [
      {
        id: nodeId,
        customFields,
      },
    ]);
    // Chart.setNodeData(nodeId, { customFields });
    this.forceUpdate();
  };

    render() {
        const {activeTab, formModalOpen, loading } = this.state;
        const {graphId, nodeId, editable, nodeCustomFields} = this.props;
        const node = ChartUtils.getNodeById(nodeId);
        // const customFields = CustomFields.getCustomField(node, Chart.getNodes());
        this.getCustomFields(graphId, nodeId);

        this.setFirstTab(node.location, nodeCustomFields[0]);

        this.setDocumentsPath();

        return (
            <div className="nodeTabs">
                {loading ? (
                    <div className="loadingWrapper">
                        <Loading/>
                    </div>
                ) : null}
                <div className="container-tabs">

          <Sortable
            onChange={this.handleOrderChange}
            items={nodeCustomFields}
            keyExtractor={(v) => v.name}
            renderItem={(p) => (
              <Button
                className={activeTab === p.value.name ? "active" : undefined}
                key={p.value.name}
                onMouseDown={() => this.setActiveTab(p.value.name)}
              >
                <p>{p.value.name}</p>
              </Button>
            )}
          />
          {node.location ? (
            <Button
              className={
                activeTab === "_location" ? "active activeNoShadow" : undefined
              }
              onClick={() => this.setActiveTab("_location")}
            >
              <p>Location</p>
            </Button>
          ) : null}

          {editable &&
          !node.sourceId &&
          node.customFields?.length < CustomFields.LIMIT ? (
            <Tooltip overlay="Add New Tab" placement="top">
              <Button
                className="addTab"
                icon="fa-plus"
                onClick={() => this.openFormModal()}
              />
            </Tooltip>
          ) : null}
        </div>
        {!_.isNull(formModalOpen) ? (
          <NodeTabsFormModal
            node={node}
            customFields={nodeCustomFields}
            fieldName={formModalOpen}
            onClose={this.closeFormModal}
          />
        ) : null}
        {activeTab === "_location" ? (
          this.state.showLocation ? (
            <MapsInfo node={node} />
          ) : (
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
          <NodeTabsContent
            name={activeTab}
            node={node}
            customFields={nodeCustomFields}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  activeTab: state.graphs.activeTab,
  graphId: state.graphs.singleGraph.id,
  nodeCustomFields: state.graphs.nodeCustomFields,
});

const mapDispatchToProps = {
  setActiveTab,
  removeNodeCustomFieldKey,
  getNodeCustomFieldsRequest,
  updateNodesCustomFieldsRequest,
};

const Container = connect(mapStateToProps, mapDispatchToProps)(NodeTabs);

export default Container;
