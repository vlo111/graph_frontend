import React, {Component} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Modal from 'react-modal';
import _ from 'lodash';
import {connect} from 'react-redux';
import memoizeOne from 'memoize-one';
import {toggleNodeModal} from '../../store/actions/app';
import Select from '../form/Select';
import ColorPicker from '../form/ColorPicker';
import Input from '../form/Input';
import Button from '../form/Button';
import Chart from '../../Chart';
import FileInput from '../form/FileInput';
import {NODE_TYPES, NODE_STATUS} from '../../data/node';
import Validate from '../../helpers/Validate';
import Utils from '../../helpers/Utils';
import {ReactComponent as CloseSvg} from '../../assets/images/icons/close.svg';
import ChartUtils from '../../helpers/ChartUtils';
import Api from '../../Api';
import {ReactComponent as CompressScreen} from '../../assets/images/icons/compress.svg';
import {ReactComponent as FullScreen} from '../../assets/images/icons/full-screen.svg';
import markerImg from '../../assets/images/icons/marker.svg';
import delImg from '../../assets/images/icons/del.gif';
import showMore from '../../assets/images/icons/showMore.gif';
import MapsLocationPicker from '../maps/MapsLocationPicker';
import {updateNodesCustomFieldsRequest} from '../../store/actions/nodes';
import {Link} from 'react-router-dom';
import NoImg from '../../assets/images/image-not-available.png';

class AddNodeModal extends Component {
  static propTypes = {
    toggleNodeModal: PropTypes.func.isRequired,
    currentUserId: PropTypes.number.isRequired,
    addNodeParams: PropTypes.object.isRequired,
    currentUserRole: PropTypes.string.isRequired,
  }

  initNodeData = memoizeOne((addNodeParams) => {
    const nodes = Chart.getNodes();
    const {
      fx, fy, name, icon, nodeType, status, type, keywords, location, index = null, customField, scale,
      d, infographyId, manually_size, customFields,
    } = _.cloneDeep(addNodeParams);
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
    this.setState({loading: true});
    const {currentUserId, graphId} = this.props;
    const {
      nodeData, index, nodeId, imgUrl
    } = this.state;

    const errors = {};
    const nodes = [...Chart.getNodes()];

    const update = !_.isNull(index);

    [errors.name, nodeData.name] = Validate.nodeName(nodeData.name, update);
    [errors.type, nodeData.type] = Validate.nodeType(nodeData.type);
    // [errors.location, nodeData.location] = Validate.nodeLocation(nodeData.location);
    [errors.color, nodeData.color] = Validate.nodeColor(nodeData.color, nodeData.type);

    nodeData.updatedAt = moment().unix();
    nodeData.updatedUser = currentUserId;

    if (!Validate.hasError(errors)) {
      if (nodeData.color) {
        ChartUtils.setNodeTypeColor(nodeData.type, nodeData.color);
      }

      nodeData.id = nodeId || ChartUtils.uniqueId(nodes);

      if (imgUrl && (imgUrl !== 'error')) {
        let url = imgUrl;
        const toDataURL = url => fetch(url)
            .then(response => response.blob())
            .then(blob => new Promise((resolve, reject) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result)
              reader.onerror = reject
              reader.readAsDataURL(blob)
            }))

        const dataUrl = await toDataURL(url);

        const fileData = Utils.dataURLtoFile(dataUrl, 'image');

        const {data = {}} = await Api.uploadNodeIcon(graphId, nodeData.id, fileData).catch((d) => d);

        nodeData.icon = data.icon;
      } else if (_.isObject(nodeData.icon) && !_.isEmpty(nodeData.icon)) {
        const {data = {}} = await Api.uploadNodeIcon(graphId, nodeData.id, nodeData.icon).catch((d) => d);
        nodeData.icon = data.icon;
      }

      if (update) {
        const d = {...nodes[index], ...nodeData};
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

      Chart.render({nodes});

      this.closeExpand();
      // this.props.setNodeCustomField(nodeData.type, nodeData.id, customField);
      this.props.toggleNodeModal();
    }
    this.setState({errors, nodeData, loading: false});
  }

  handleChange = (path, value, editIndex) => {
    const {nodeData, errors, editLocation} = this.state;
    if (path === 'location') {
      if (nodeData.location) {
        if (Number.isInteger(editIndex)) {
          nodeData.location[editLocation] = value;
        } else {
          nodeData.location.push(value);
        }
      }
      _.set(nodeData, path, !nodeData.location ? [value] : nodeData.location);
    } else {
      _.set(nodeData, path, value);
    }
    _.remove(errors, path);
    if (path === 'type') {
      _.set(nodeData, 'color', ChartUtils.nodeColorObj[value] || '');
      _.remove(errors, 'color');
    }
    this.setState({nodeData, errors, editLocation: null, imgUrl: null});
  }

  deleteLocation = (lIndex) => {
    const {nodeData} = this.state;
    nodeData.location = nodeData.location.filter((p, index) => index !== lIndex);

    this.setState({nodeData});
  }

  editLocation = (index) => {
    this.setState({
      editLocation: index,
      openMap: true,
    });
  }

  handleCustomFieldsChange = (customField) => {
    this.setState({customField: {...customField}});
  }

  openMap = () => {
    this.setState({openMap: true});
  }

  toggleMap = () => {
    const {openMap} = this.state;
    this.setState({
      openMap: !openMap,
      editLocation: null,
    });
  }

  closeExpand = () => {
    this.setState({expand: false});
  }

  toggleExpand = () => {
    const {expand} = this.state;
    this.setState({expand: !expand});
  }

  handleImgPreviewChange = (url) => {
    this.setState({
      imgUrl: url
    })
  }

  render() {
    const {
      nodeData, errors, index, openMap, editLocation, expand, imgUrl
    } = this.state;
    const {addNodeParams, currentUserRole, currentUserId} = this.props;
    const {editPartial} = addNodeParams;
    this.initNodeData(addNodeParams);
    const nodes = Chart.getNodes();
    const groups = this.getTypes(nodes);

    Utils.orderGroup(groups, nodeData.type);
    return (
        <Modal
            className={expand ? 'ghModal expandAddNode' : 'ghModal'}
            overlayClassName="ghModalOverlay"
            isOpen={!_.isEmpty(addNodeParams)}
            onRequestClose={this.closeModal}
        >
          <div className="addNodeContainer containerModal">
            <Button
                className="expandButton"
                icon={expand ? <CompressScreen/> : <FullScreen/>}
                onClick={this.toggleExpand}
            />
            <Button color="transparent" className="close" icon={<CloseSvg/>} onClick={this.closeModal}/>
            <h2>{_.isNull(index) ? 'Add New Node' : 'Edit Node'}</h2>
            <form className="form" onSubmit={this.saveNode}>
              <Select
                  isCreatable
                  label="Node Type"
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
                  label="Node Name"
                  value={nodeData.name}
                  error={errors.name}
                  limit={250}
                  autoFocus
                  onChangeText={(v) => this.handleChange('name', v)}
                  autoComplete="off"
              />
              {expand ? (
                  <>
                    <Select
                        label="Status"
                        portal
                        options={NODE_STATUS}
                        isDisabled={currentUserRole === 'edit' && +addNodeParams.createdUser !== +currentUserId}
                        value={NODE_STATUS.filter((t) => t.value === nodeData.status)}
                        error={errors.status}
                        onChange={(v) => this.handleChange('status', v?.value || '')}
                    />
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
                    {!editPartial ? (
                        <>
                          <Select
                              label="Icon Chape"
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
                              style={{color: nodeData.color}}
                              onChangeText={(v) => this.handleChange('color', v)}
                              autoComplete="off"
                              expand={expand}
                          />

                          <FileInput
                              label={nodeData.nodeType === 'infography' ? 'Image' : 'Icon'}
                              accept=".png,.jpg,.gif,.svg"
                              value={nodeData.icon}
                              onChangeImgPreview={(v) => this.handleImgPreviewChange(v)}
                              onChangeFile={(v, file) => this.handleChange('icon', file)}
                          />

                          {imgUrl === 'error' ?
                              <img className="img-thumbnail" src={NoImg} alt="noImage"/> :
                              <img className="img-thumbnail" src={imgUrl ? imgUrl : Utils.fileSrc(nodeData.icon)}
                                   alt=""/>
                          }
                          <Select
                              label="Keywords"
                              isCreatable
                              isMulti
                              value={nodeData.keywords.map((v) => ({value: v, label: v}))}
                              menuIsOpen={false}
                              placeholder="Add..."
                              onChange={(value) => this.handleChange('keywords', (value || []).map((v) => v.value))}
                          />
                        </>
                    ) : null}
                    <div className="addLocation" onClick={this.openMap}>+ Add Location</div>
                    {openMap && (
                        <MapsLocationPicker
                            onClose={this.toggleMap}
                            value={editLocation != null
                                ? nodeData.location.filter((p, index) => index === editLocation) : nodeData.location}
                            onChange={(v, edit) => this.handleChange('location', v, edit)}
                            edit={Number.isInteger(editLocation) ? editLocation : null}
                        />
                    )}
                    <div className="ghFormField locationExpandForm">
                      {_.isObject(nodeData?.location) && nodeData.location.map((p, index) => (
                          <div className="locForm">
                            <div className="locName">
                              <p title={p.address}>
                                {p.address && p.address.length > (!expand ? 20 : 37)
                                    ? `${p.address.substr(0, !expand ? 20 : 37)} ...`
                                    : p.address}
                              </p>
                            </div>
                            <div className="locEdit">
                    <span title="edit" onClick={() => this.editLocation(index)}>
                      <img
                          src={markerImg}
                          className="locMarker"
                          alt="marker"
                      />
                    </span>
                            </div>
                            <div className="locDelete">
                    <span title="delete" onClick={() => this.deleteLocation(index)}>
                      <img
                          src={delImg}
                          className="locMarker"
                          alt="marker"
                      />
                    </span>
                            </div>
                          </div>
                      )).slice(!expand ? -2 : nodeData.location)}
                      {((nodeData.location && nodeData.location.length) > 2) && (
                          <div className="showMore" onClick={this.toggleExpand}>
                            <img
                                src={showMore}
                                className="locMarker"
                                alt="marker"
                            />
                          </div>
                      )}
                    </div>
                  </>
              ) : null}
              <div className="row advanced right">
                <Link className="" onClick={this.toggleExpand}>
                  {!expand ? `Advanced` : `Primitive`}
                </Link>
              </div>
              <div className="footerButtons">
                <div className="buttons">
                  <Button className="ghButton cancel transparent alt" onClick={this.closeModal}>
                    Cancel
                  </Button>
                  <Button className="ghButton accent alt main main" type="submit">
                    {_.isNull(index) ? 'Add' : 'Save'}
                  </Button>
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
