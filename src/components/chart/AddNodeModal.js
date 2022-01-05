import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import Tooltip from 'rc-tooltip';
import { toggleNodeModal } from '../../store/actions/app';
import Select from '../form/Select';
import ColorPicker from '../form/ColorPicker';
import Input from '../form/Input';
import Button from '../form/Button';
import Chart from '../../Chart';
import FileInput from '../form/FileInput';
import { NODE_TYPES, NODE_STATUS } from '../../data/node';
import Validate from '../../helpers/Validate';
import Utils from '../../helpers/Utils';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import ChartUtils from '../../helpers/ChartUtils';
import Api from '../../Api';
import markerImg from '../../assets/images/icons/marker-black.svg';
import MapsLocationPicker from '../maps/MapsLocationPicker';
import { updateNodesCustomFieldsRequest } from '../../store/actions/nodes';

class AddNodeModal extends Component {
  static propTypes = {
    toggleNodeModal: PropTypes.func.isRequired,
    currentUserId: PropTypes.string.isRequired,
    addNodeParams: PropTypes.object.isRequired,
    currentUserRole: PropTypes.string.isRequired,
    updateNodesCustomFieldsRequest: PropTypes.string.isRequired,
    graphId: PropTypes.string.isRequired,
    graphNodes: PropTypes.string.isRequired,
  }

  initNodeData = memoizeOne((addNodeParams) => {
    const nodes = Chart.getNodes();
    const {
      fx, fy, name, icon, nodeType, status, type, keywords, location, index = null, customField, scale, link,
      d, infographyId, manually_size, customFields,
    } = _.cloneDeep(addNodeParams);
    const _type = type || _.last(nodes)?.type || '';
    this.setState({
      nodeData: {
        fx,
        fy,
        name: name || '',
        link: link || '',
        icon: icon || '',
        status: status || 'approved',
        nodeType: nodeType || 'circle',
        type: _type,
        keywords: keywords || [],
        location,
        color: ChartUtils.nodeColorObj[_type] || '',
        d,
        scale,
        infographyId,
        manually_size: manually_size || 1,
        customFields,
      },
      nodeId: addNodeParams.id,
      customField,
      index,
      errors: {},
    });
  }, _.isEqual)

  getTypes = memoizeOne((nodes) => {
    const types = nodes.filter((d) => d.type)
      .map((d) => ({
        value: d.type,
        label: d.type,
      }));

    return _.uniqBy(types, 'value');
  }, _.isEqual)

  constructor(props) {
    super(props);
    this.state = {
      nodeData: {
        keywords: [],
      },
      imgUrl: '',
      customField: null,
      errors: {},
      index: null,
      openMap: false,
      editLocation: null,
      expand: false,
    };
  }

  closeModal = () => {
    this.closeExpand();
    this.props.toggleNodeModal();
  }

  saveNode = async (ev) => {
    ev.preventDefault();
    this.setState({ loading: true });
    const { currentUserId, graphId, graphNodes } = this.props;
    const {
      nodeData, index, nodeId, imgUrl,
    } = this.state;

    const errors = {};
    let nodes = [...Chart.getNodes()];

    const update = !_.isNull(index);
    [errors.name, nodeData.name] = Validate.nodeName(nodeData.name, update, graphNodes);
    [errors.type, nodeData.type] = Validate.nodeType(nodeData.type);
    // [errors.location, nodeData.location] = Validate.nodeLocation(nodeData.location);
    [errors.color, nodeData.color] = Validate.nodeColor(nodeData.color, nodeData.type);

    if (!nodeData.color) {
      nodeData.color = ChartUtils.nodeColor(nodeData);
    }

    if (nodeData.link) {
      [errors.link, nodeData.link] = Validate.nodeLink(nodeData.link);
    }

    nodeData.updatedAt = moment().unix();
    nodeData.updatedUser = currentUserId;

    if (!Validate.hasError(errors)) {
      nodeData.id = nodeId || ChartUtils.uniqueId(nodes);

      if (imgUrl && (imgUrl !== 'error')) {
        nodeData.icon = imgUrl;
        this.setState({ imgUrl: '' });
      } else if (_.isObject(nodeData.icon) && !_.isEmpty(nodeData.icon)) {
        const { data = {} } = await Api.uploadNodeIcon(graphId, nodeData.id, nodeData.icon).catch((d) => d);
        nodeData.icon = data.icon;
      }

      if (update) {
        const d = { ...nodes[index], ...nodeData };
        nodes[index] = d;
        nodeData.update = true;
      } else {
        nodeData.create = true;
        nodeData.createdAt = moment().unix();
        nodeData.createdUser = currentUserId;
        nodes.push(nodeData);

        if (!_.isEmpty(nodeData.customFields)) {
          this.props.updateNodesCustomFieldsRequest(graphId, [{
            id: nodeData.id,
            customFields: nodeData.customFields,
          }]);
        }
      }

      if (nodeData.color) {
        nodes = nodes.map((n) => {
          if (n.type === nodeData.type) {
            n.color = nodeData.color;
          }
          return n;
        });
      }

      Chart.render({ nodes });

      this.closeExpand();
      this.props.toggleNodeModal();
    }
    this.setState({ errors, nodeData });
  }

  handleChange = (path, item, editIndex) => {
    let value = item;

    const { nodeData, errors } = this.state;

    if (path === 'type') {
      _.set(nodeData, path, value);
      _.unset(errors, path);

      // edit color with type
      path = 'color';
      value = ChartUtils.nodeColorObj[value] || '';
    } else if (path === 'icon' && editIndex === 'cancel') {
      _.unset(nodeData, path, '');
    }

    _.set(nodeData, path, value);
    _.unset(errors, path);

    this.setState({
      nodeData, errors,
    });
  }

  handleCustomFieldsChange = (customField) => {
    this.setState({ customField: { ...customField } });
  }

  openMap = () => {
    this.setState({ openMap: true });
  }

  toggleMap = () => {
    const { openMap } = this.state;
    this.setState({
      openMap: !openMap,
    });
  }

  closeExpand = () => {
    this.setState({ expand: false, imgUrl: '' });
  }

  toggleExpand = () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  handleImgPreviewChange = (url) => {
    this.setState({
      imgUrl: url,
    });
  }

  render() {
    const {
      nodeData, errors, index, openMap, expand, imgUrl,
    } = this.state;
    const { addNodeParams, currentUserRole, currentUserId } = this.props;
    const { editPartial } = addNodeParams;
    this.initNodeData(addNodeParams);
    const nodes = Chart.getNodes();
    const groups = this.getTypes(nodes);

    Utils.orderGroup(groups, nodeData.type);
    return (
      <Modal
        className={expand ? 'ghModal expandAddNode' : 'ghModal'}
        overlayClassName="ghModalOverlay addNode"
        isOpen={!_.isEmpty(addNodeParams)}
        onRequestClose={this.closeModal}
      >
        <div className="addNodeContainer containerModal">
          <div className="addNodetitle">
            <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeModal} />
            <h2 className="add-node-text">{_.isNull(index) ? 'Add New Node' : 'Edit Node'}</h2>
          </div>
          <form
            className={`form ${imgUrl === 'error' ? '' : (nodeData.icon ? 'update-upload' : '')}`}
            onSubmit={this.saveNode}
          >
            <div className="node-type">
              <Select
                label="Node Type"
                isCreatable
                value={[
                  groups.find((t) => t.value === nodeData.type) || {
                    value: nodeData.type,
                    label: nodeData.type ? nodeData.type : 'Node Type',
                  },
                ]}
                options={groups}
                error={errors.type}
                onChange={(v) => this.handleChange('type', v?.value || '')}
              />
            </div>
            <Input
              containerClassName="nodeName"
              label="Node Name"
              value={nodeData.name}
              error={errors.name}
              autoFocus
              onChangeText={(v) => this.handleChange('name', v)}
              autoComplete="off"
            />
            {expand ? (
              <>
                <Input
                  label="Node Link"
                  value={nodeData.link}
                  error={errors.link}
                  autoFocus
                  onChangeText={(v) => this.handleChange('link', v)}
                  autoComplete="off"
                />
                <Select
                  label="Node Status"
                  options={NODE_STATUS}
                  isDisabled={currentUserRole === 'edit' && addNodeParams.createdUser !== currentUserId}
                  value={NODE_STATUS.filter((t) => t.value === nodeData.status)}
                  error={errors.status}
                  onChange={(v) => this.handleChange('status', v?.value || '')}
                />
                {!editPartial ? (
                  <>
                    <Select
                      label="Shape"
                      options={NODE_TYPES}
                      value={NODE_TYPES.filter((t) => t.value === nodeData.nodeType)}
                      error={errors.nodeType}
                      onChange={(v) => this.handleChange('nodeType', v?.value || '')}
                    />
                    <ColorPicker
                      label="Select Color"
                      value={nodeData.color}
                      error={errors.color}
                      readOnly
                      style={{ color: nodeData.color }}
                      onChangeText={(v) => this.handleChange('color', v)}
                      autoComplete="off"
                      expand={!expand}
                    />
                    <div style={{ backgroundColor: nodeData.color }} className="color-preview" />

                    <FileInput
                      label="Past icon link or select"
                      accept=".png,.jpg,.gif,.svg"
                      value={nodeData.icon}
                      onChangeImgPreview={(v) => this.handleImgPreviewChange(v)}
                      onChangeFile={(v, file) => this.handleChange('icon', file)}
                      preview={nodeData.icon}
                      previewError={imgUrl}
                    />

                    <Select
                      isCreatable
                      isMulti
                      value={nodeData.keywords.map((v) => ({ value: v, label: v }))}
                      menuIsOpen={false}
                      label="Keywords"
                      onChange={(value) => this.handleChange('keywords', (value || []).map((v) => v.value))}
                    />
                  </>
                ) : null}

                <label className="nodeSize" htmlFor="nodeSize">Set size manually</label>

                <div className="number-wrapper">
                  <Input
                    id="nodeSize"
                    value={nodeData.manually_size}
                    error={errors.manually_size}
                    type="text"
                    autoComplete="off"
                    isNumber
                    onChangeText={(v) => this.handleChange('manually_size', v)}
                  />
                </div>
                {openMap && (
                <MapsLocationPicker
                  onClose={this.toggleMap}
                  value={nodeData.location}
                  onChange={(v) => this.handleChange('location', v)}
                />
                )}
                <div className="ghFormField locationExpandForm">
                  <div className="locForm">
                    <div className="locEdit">
                      <Tooltip overlay="Select location" placement="top">
                        <span
                          onClick={this.openMap}
                        >
                          <img
                            src={markerImg}
                            className="locMarker"
                            alt="marker"
                          />
                          <p>{nodeData?.location?.address}</p>
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
            <div className="footerButtons">
              <div className="buttons">
                <button className="btn-classic" type="submit">
                  {_.isNull(index) ? 'Add' : 'Save'}
                </button>
              </div>
            </div>

            <div className="advanced right">
              <div className="show-more" onClick={this.toggleExpand}>
                {!expand ? 'Show More' : 'Show Less'}
              </div>
            </div>
          </form>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  addNodeParams: state.app.addNodeParams,
  currentUserId: state.account.myAccount.id,
  graphId: state.graphs.singleGraph.id,
  currentUserRole: state.graphs.singleGraph.currentUserRole || '',
  graphNodes: state.graphs.singleGraph.nodesPartial,
});

const mapDispatchToProps = {
  toggleNodeModal,
  updateNodesCustomFieldsRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddNodeModal);

export default Container;
