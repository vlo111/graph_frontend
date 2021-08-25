import React, { Component } from 'react';
import _ from 'lodash';
import Modal from 'react-modal';
// import SVG, { Props as SVGProps } from 'react-inlinesvg';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import memoizeOne from 'memoize-one';
import { toast } from 'react-toastify';
import moment from 'moment';
import Switch from 'rc-switch';
import Button from '../form/Button';
import Chart from '../../Chart';
import Input from '../form/Input';
import Utils from '../../helpers/Utils';
import {
  createGraphRequest,
  getSingleGraphRequest,
  updateGraphRequest,
  updateGraphThumbnailRequest,
  deleteGraphRequest,
} from '../../store/actions/graphs';
import { setActiveButton, setLoading } from '../../store/actions/app';
import ChartUtils from '../../helpers/ChartUtils';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import 'rc-switch/assets/index.css';
import ImageUploader from '../ImageUploader'
import Api from '../../Api';

class EditGraphModal extends Component {
  static propTypes = {
    createGraphRequest: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    updateGraphThumbnailRequest: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    updateGraphRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    toggleModal: PropTypes.func.isRequired,
    setLoading: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
  }

  initValues = memoizeOne((singleGraph) => {
    const {
      title, description, status, publicState, defaultImage
    } = singleGraph;

    this.setState({
      requestData: {
        title,
        description,
        publicState,
        status: status === 'template' ? 'active' : status,
        userImage: defaultImage
      },
      image: '',
    });
  })

  constructor(props) {
    super(props);
    this.state = {
requestData: {
        title: '',
        description: '',
        status: 'active',
        publicState: false,
        disabled: false,
        userImage: false
      },
    };
  }

  async componentDidMount () {
    const { match: { params: { graphId } }, singleGraph: {defaultImage} } = this.props;
    const svg = ChartUtils.getChartSvg();
    if (!defaultImage) {
      await this.props.updateGraphThumbnailRequest(graphId, svg, 'small');
      this.props.getSingleGraphRequest()
    }
  }

  async deleteGraph(graphId) {
    if (window.confirm('Are you sure?')) {
      await this.props.deleteGraphRequest(graphId);

      toast.info('Successfully deleted');

      
      if(this.props.deleteGraph) {
        this.props.deleteGraph(graphId);
        this.props.toggleModal(false)  
      } else {
        this.props.history.push('/');
      }
    }
  }

  onChange = (value) => {
    const { requestData } = this.state;
    _.set(requestData, 'publicState', value);
    this.setState({ requestData });
  }

  saveGraph = async (status) => {
    const { requestData, image } = this.state;

    let { singleGraph, graph } = this.props;
    
    if(graph) {
      singleGraph = graph
    }

    const { id: graphId } = singleGraph;

    this.props.setLoading(true);
    const labels = Chart.getLabels();
    const svg = ChartUtils.getChartSvg();
    let resGraphId;
    
    if (image) {
      let userEdited = true
      if (typeof(image) === 'string') {
        image = svg
        userEdited = false
      }
      await this.props.updateGraphThumbnailRequest(graphId, image, 'medium', userEdited)
    }

    const { payload: { data } } = await this.props.updateGraphRequest(graphId, {
      ...requestData,
      labels,
      status,
      svg,
    });

    resGraphId = data.graphId;

    if (resGraphId) {
      toast.info('Successfully saved');
      this.props.getSingleGraphRequest(resGraphId);
    } else {
      toast.error('Something went wrong. Please try again');
    }

    if(graph) {
      const { payload : { data: { graph: newGraph } } } = (await this.props.getSingleGraphRequest(resGraphId))
      
      this.props.updateGraph(newGraph);  
    }

    this.props.setLoading(false);
    this.props.toggleModal(false);
  }

  handleChange = async (path, value) => {
    const { id: graphId } = this.props.singleGraph;

    const { requestData } = this.state;
    if (path == 'image') {
      if (value == '') {
        const svg = ChartUtils.getChartSvg();
        _.set(requestData, 'userImage', false);
        let savedImageRequest = await Api.updateGraphThumbnail(graphId, svg, "small", "tmp")
        const image = savedImageRequest?.data?.thumbUrl + `?t=${moment(graph.updatedAt).unix()}`
        this.setState({[path]: image})
      } else {
        this.setState({ [path]: value})
        _.set(requestData, 'userImage', true);
      }
    } else {
      _.set(requestData, path, value);
      this.setState({ requestData });
    }
  }

  render() {
    const { requestData, disabled, image } = this.state;
    let { singleGraph, graph } = this.props;
    
    if(graph) {
      singleGraph = graph
    }

    const { id: graphId } = singleGraph;

    this.initValues(singleGraph);
    const { publicState } = singleGraph;
    return (
      <Modal
        className="ghModal ghModalEdit"
        overlayClassName="ghModalOverlay"
        isOpen
        onRequestClose={() => this.props.toggleModal(false)}
      >
        <Button
          color="transparent"
          className="close"
          icon={<CloseSvg />}
          onClick={() => this.props.toggleModal(false)}
        />
        <div className="form">
          <div>
            <ImageUploader
              className="thumbnailSave"
              value={image || `${singleGraph.thumbnail}?t=${moment(singleGraph.updatedAt).unix()}`}
              onChange={(val) => this.handleChange('image', val)}
            />

          </div>
          <div className="impData">
            <Input
              className="graphInputName"
              value={requestData.title}
              onChangeText={(v) => this.handleChange('title', v)}
            />
            <label className="switchLabel">
              <span className="switchPublic">Publish graph</span>
              <div>
                <Switch
                  onChange={this.onChange}
                  onClick={this.onChange}
                  disabled={disabled}
                  defaultChecked={publicState}
                />
              </div>
            </label>
            <div className="infoGraph">
              <label>Owner</label>
              <span className="item1">{`${singleGraph.user.firstName} ${singleGraph.user.lastName}`}</span>
            </div>
            <div className="infoGraph">
              <label>Created</label>
              <span className="item2">{moment(singleGraph.createdAt).format('YYYY.MM.DD')}</span>
            </div>
            <div className="infoGraph">
              <label>Last modfied</label>
              <span className="item3">{moment(singleGraph.updatedAt).format('YYYY.MM.DD hh:mm')}</span>
            </div>
          </div>
          <div className="textareaEdit">
            <Input
              placeholder="Description"
              className="textarea"
              value={requestData.description}
              textArea
              onChangeText={(v) => this.handleChange('description', v)}
            />
          </div>

          <div className="buttonsSave">
            <>
              <Button
                onClick={() => this.deleteGraph(graphId)}
                className="btn-delete"
              >
                Delete
              </Button>
              <Button
                className="btn-classic"
                onClick={() => this.saveGraph(requestData.status)}
              > Save </Button>
            </>
          </div>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {
  createGraphRequest,
  updateGraphRequest,
  updateGraphThumbnailRequest,
  getSingleGraphRequest,
  setActiveButton,
  setLoading,
  deleteGraphRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EditGraphModal);

export default withRouter(Container);
