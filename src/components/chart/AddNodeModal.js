import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import { toggleNodeModal } from '../../store/actions/app';
import { setNodeCustomField } from '../../store/actions/graphs';
import Select from '../form/Select';
import ColorPicker from '../form/ColorPicker';
import Input from '../form/Input';
import Button from '../form/Button';
import Chart from '../../Chart';
import FileInput from '../form/FileInput';
import { NODE_TYPES, NODE_STATUS } from '../../data/node';
import Validate from '../../helpers/Validate';
import LocationInputs from './LocationInputs';
import Utils from '../../helpers/Utils';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import ChartUtils from '../../helpers/ChartUtils';
import { createNodesRequest, updateNodesRequest } from '../../store/actions/nodes';
import Api from '../../Api';

class AddNodeModal extends Component {
  static propTypes = {
    toggleNodeModal: PropTypes.func.isRequired,
    setNodeCustomField: PropTypes.func.isRequired,
    currentUserId: PropTypes.number.isRequired,
    addNodeParams: PropTypes.object.isRequired,
    currentUserRole: PropTypes.string.isRequired,
  }

  initNodeData = memoizeOne((addNodeParams) => {
    const nodes = Chart.getNodes();
    const {
      fx, fy, name, icon, nodeType, status, type, keywords, location, index = null, customField, scale,
      d, infographyId, manually_size,
    } = _.cloneDeep(addNodeParams);
    console.log(addNodeParams)
    const _type = type || _.last(nodes)?.type || '';
    this.setState({
      nodeData: {
        fx,
        fy,
        name: name || '',
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
      customField: null,
      errors: {},
      index: null,
    };
  }

  closeModal = () => {
    this.props.toggleNodeModal();
  }

  saveNode = async (ev) => {
    ev.preventDefault();
    this.setState({ loading: true });
    const { currentUserId, graphId } = this.props;
    const {
      nodeData, index, nodeId, customField,
    } = this.state;

    const errors = {};
    const nodes = Chart.getNodes();

    const update = !_.isNull(index);

    [errors.name, nodeData.name] = Validate.nodeName(nodeData.name, update);
    [errors.type, nodeData.type] = Validate.nodeType(nodeData.type);
    [errors.location, nodeData.location] = Validate.nodeLocation(nodeData.location);
    [errors.color, nodeData.color] = Validate.nodeColor(nodeData.color, nodeData.type);

    nodeData.updatedAt = moment().unix();
    nodeData.updatedUser = currentUserId;

    if (!Validate.hasError(errors)) {
      if (nodeData.color) {
        ChartUtils.setNodeTypeColor(nodeData.type, nodeData.color);
      }

      nodeData.id = nodeId || ChartUtils.uniqueId(nodes);

      if (_.isObject(nodeData.icon)) {
        const { data = {} } = await Api.uploadNodeIcon(graphId, nodeData.id, nodeData.icon).catch((d) => d);
        nodeData.icon = data.icon;
      }
      if (update) {
        const d = { ...nodes[index], ...nodeData };
        nodes[index] = d;
      } else {
        nodeData.createdAt = moment().unix();
        nodeData.createdUser = currentUserId;
        nodes.push(nodeData);
      }

      Chart.render({ nodes });
      // this.props.setNodeCustomField(nodeData.type, nodeData.id, customField);
      this.props.toggleNodeModal();
    }
    this.setState({ errors, nodeData, loading: false });
  }

  handleChange = (path, value) => {
    const { nodeData, errors } = this.state;
    _.set(nodeData, path, value);
    _.remove(errors, path);
    if (path === 'type') {
      _.set(nodeData, 'color', ChartUtils.nodeColorObj[value] || '');
      _.remove(errors, 'color');
    }
    this.setState({ nodeData, errors });
  }

  handleCustomFieldsChange = (customField) => {
    this.setState({ customField: { ...customField } });
  }

  render() {
    const {
      nodeData, errors, index, loading,
    } = this.state;
    const { addNodeParams, currentUserRole, currentUserId } = this.props;
    const { editPartial } = addNodeParams;
    this.initNodeData(addNodeParams);
    const nodes = Chart.getNodes();
    const groups = this.getTypes(nodes);

    Utils.orderGroup(groups, nodeData.type);
    return (
      <Modal
        className="ghModal"
        overlayClassName="ghModalOverlay"
        isOpen={!_.isEmpty(addNodeParams)}
        onRequestClose={this.closeModal}
      >
        <div className="containerModal">
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeModal} />
          <form className="form" onSubmit={this.saveNode}>
            <h2>{_.isNull(index) ? 'Add new node' : 'Edit node'}</h2>
            <Select
              isCreatable
              label="Node type"
              value={[
                groups.find((t) => t.value === nodeData.type) || {
                  value: nodeData.type,
                  label: nodeData.type,
                },
              ]}
              limit={250}
              options={groups}
              error={errors.type}
              onChange={(v) => this.handleChange('type', v?.value || '')}
            />
            <Input
              label="Node name"
              value={nodeData.name}
              error={errors.name}
              limit={250}
              autoFocus
              onChangeText={(v) => this.handleChange('name', v)}
            />
            <Select
              label="Status"
              portal
              options={NODE_STATUS}
              isDisabled={currentUserRole === 'edit' && +addNodeParams.createdUser !== +currentUserId}
              value={NODE_STATUS.filter((t) => t.value === nodeData.status)}
              error={errors.status}
              onChange={(v) => this.handleChange('status', v?.value || '')}
            />
            {!editPartial ? (
              <>
                <Select
                  label="Icon shape"
                  portal
                  options={NODE_TYPES}
                  value={NODE_TYPES.filter((t) => t.value === nodeData.nodeType)}
                  error={errors.nodeType}
                  onChange={(v) => this.handleChange('nodeType', v?.value || '')}
                />
                <ColorPicker
                  label="Color"
                  value={nodeData.color}
                  error={errors.color}
                  readOnly
                  style={{ color: nodeData.color }}
                  onChangeText={(v) => this.handleChange('color', v)}
                  autoComplete="off"
                />

                <FileInput
                  label={nodeData.nodeType === 'infography' ? 'Image' : 'Icon'}
                  accept=".png,.jpg,.gif"
                  value={nodeData.icon}
                  onChangeFile={(v, file) => this.handleChange('icon', file)}
                />
                <Select
                  label="keywords"
                  isCreatable
                  isMulti
                  value={nodeData.keywords.map((v) => ({ value: v, label: v }))}
                  menuIsOpen={false}
                  placeholder="Add..."
                  onChange={(value) => this.handleChange('keywords', (value || []).map((v) => v.value))}
                />
              </>
            ) : null}
            <Input
              label="Set size manually"
              value={nodeData.manually_size}
              error={errors.manually_size}
              min="1"
              max="50"
              type="number"
              autoComplete="off"
              onBlur={() => {
                if (nodeData.value < 1) {
                  nodeData.value = 1;
                } else if (nodeData.value > 50) {
                  nodeData.value = 50;
                }
                this.handleChange('value', nodeData.value);
              }}
              onChangeText={(v) => this.handleChange('manually_size', v)}
            />
            <LocationInputs
              error={errors.location}
              value={nodeData.location}
              onChange={(v) => this.handleChange('location', v)}
            />
            <div className="buttons">
              <Button className="ghButton cancel transparent alt" onClick={this.closeModal}>
                Cancel
              </Button>
              <Button className="ghButton accent alt main main" type="submit" loading={loading}>
                {_.isNull(index) ? 'Add' : 'Save'}
              </Button>
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
});

const mapDispatchToProps = {
  toggleNodeModal,
  createNodesRequest,
  updateNodesRequest,
  setNodeCustomField,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddNodeModal);

export default Container;
