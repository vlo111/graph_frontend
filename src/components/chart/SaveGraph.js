import React, { Component } from 'react';
import _ from 'lodash';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import memoizeOne from 'memoize-one';
import { toast } from 'react-toastify';
import Button from '../form/Button';
import Chart from '../../Chart';
import Input from '../form/Input';
import Utils from '../../helpers/Utils';
import {
  createGraphRequest,
  getSingleGraphRequest,
  updateGraphRequest,
  updateGraphThumbnailRequest
} from '../../store/actions/graphs';
import { setActiveButton, setLoading } from '../../store/actions/app';

class SaveGraphModal extends Component {
  static propTypes = {
    createGraphRequest: PropTypes.func.isRequired,
    updateGraphThumbnailRequest: PropTypes.func.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    updateGraphRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
    singleGraph: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    setLoading: PropTypes.func.isRequired,
  }

  initValues = memoizeOne((singleGraph) => {
    const { title, description, tags } = singleGraph;
    this.setState({
      requestData: {
        title,
        description,
        tags,
      },
    });
  })

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      requestData: {
        title: '',
        description: '',
        tags: '',
      },
    };
  }

  saveGraph = async () => {
    const { requestData } = this.state;
    const { match: { params: { graphId } } } = this.props;
    this.props.setLoading(true);
    let nodes = Chart.getNodes();
    const links = Chart.getLinks();
    const icons = await Promise.all(nodes.map((d) => {
      if (d.icon && d.icon.startsWith('blob:')) {
        return Utils.blobToBase64(d.icon);
      }
      return d.icon;
    }));
    let files = {};
    let fIndex = new Date().getTime();
    nodes = nodes.map((d, i) => {
      d.icon = icons[i];
      d.description = d.description.replace(/\shref="(blob:https?:\/\/[^"]+)"/g, (m, url) => {
        fIndex += 1;
        files[fIndex] = Utils.blobToBase64(url);
        return ` href="<%= file_${fIndex} %>"`;
      });
      return d;
    });
    files = await Promise.allValues(files);

    const svg = Chart.printMode(400, 223);
    let resGraphId;
    if (graphId) {
      const { payload: { data } } = await this.props.updateGraphRequest(graphId, {
        ...requestData,
        nodes,
        links,
        files,
        svg,
      });
      resGraphId = data.graphId;
    } else {
      const { payload: { data } } = await this.props.createGraphRequest({
        ...requestData,
        nodes,
        links,
        files,
        svg,
      });
      resGraphId = data.graphId;
    }
    if (resGraphId) {
      toast.info('Successfully saved');
      const svgBig = Chart.printMode(800, 446);
      this.props.updateGraphThumbnailRequest(resGraphId, svgBig);
    } else {
      toast.error('Something went wrong. Please try again');
    }
    this.props.setLoading(false);
    this.setState({ showModal: false });
    this.props.setActiveButton('create');
    this.props.history.push('/');
  }

  handleChange = (path, value) => {
    const { requestData } = this.state;
    _.set(requestData, path, value);
    this.setState({ requestData });
  }

  toggleModal = (showModal) => {
    this.setState({ showModal });
  }

  render() {
    const { showModal, requestData } = this.state;
    const { singleGraph } = this.props;
    this.initValues(singleGraph);
    return (
      <>
        <Button color="blue" onClick={() => this.toggleModal(true)}>
          Save
        </Button>
        <Modal
          className="ghModal"
          overlayClassName="ghModalOverlay"
          isOpen={showModal}
          onRequestClose={() => this.toggleModal(false)}
        >
          <h2>Save this graph</h2>
          <Input
            label="Title"
            value={requestData.title}
            onChangeText={(v) => this.handleChange('title', v)}
          />
          <Input
            label="Description"
            value={requestData.description}
            textArea
            onChangeText={(v) => this.handleChange('description', v)}
          />
          <div className="buttons">
            <Button onClick={() => this.toggleModal(false)}>
              Cancel
            </Button>
            <Button onClick={this.saveGraph}>
              Save
            </Button>
          </div>

        </Modal>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
});
const mapDispatchToProps = {
  createGraphRequest,
  updateGraphRequest,
  updateGraphThumbnailRequest,
  getSingleGraphRequest,
  setActiveButton,
  setLoading,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SaveGraphModal);

export default withRouter(Container);
