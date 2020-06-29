import React, { Component } from 'react';
import _ from 'lodash';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import memoizeOne from 'memoize-one';
import Button from '../form/Button';
import Chart from '../../Chart';
import Input from '../form/Input';
import Utils from '../../helpers/Utils';
import { createGraphRequest, updateGraphRequest } from '../../store/actions/graphs';
import ShortCode from '../../helpers/ShortCode';

class SaveGraphModal extends Component {
  static propTypes = {
    createGraphRequest: PropTypes.func.isRequired,
    updateGraphRequest: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,
  }

  initValues = memoizeOne((singleGraph) => {
    const { title, description } = singleGraph;
    this.setState({
      requestData: {
        title,
        description,
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
      },
    };
  }

  saveGraph = async () => {
    const { requestData } = this.state;
    const { match: { params: { graphId } } } = this.props;

    const nodes = Chart.getNodes();
    const links = Chart.getLinks();
    const thumbnail = await Utils.graphToPng();
    const icons = await Promise.all(nodes.map((d) => {
      if (d.icon && d.icon.startsWith('blob:')) {
        return Utils.blobToBase64(d.icon);
      }
      let files = ShortCode.fileParse(d.files);
      files = files.map((file) => {
        if (file.url.startsWith('blob:')) {
          file.url = Utils.blobToBase64(file.url);
        }
        return file;
      }).filter((f) => f.url);
      d.files = ShortCode.fileStringify(files);
      return d.icon;
    }));
    nodes.forEach((d, k) => {
      nodes[k].icon = icons[k];
    });
    if (graphId) {
      this.props.updateGraphRequest(graphId, {
        ...requestData,
        nodes,
        links,
        thumbnail,
      });
    } else {
      this.props.createGraphRequest({
        ...requestData,
        nodes,
        links,
        thumbnail,
      });
    }
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
        <Button onClick={() => this.toggleModal(true)}>
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
const mapDespatchToProps = {
  createGraphRequest,
  updateGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(SaveGraphModal);

export default withRouter(Container);
