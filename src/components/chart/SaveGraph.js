import React, { Component } from 'react';
import html2canvas from 'html2canvas';
import _ from 'lodash';
import Modal from 'react-modal';
import Button from '../form/Button';
import Chart from '../../Chart';
import Input from '../form/Input';
import Utils from '../../helpers/Utils';

class SaveGraphModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      requestData: {
        title: '',
      },
    };
  }

  saveGraph = async () => {
    const { requestData } = this.state;
    const nodes = Chart.getNodes();
    const links = Chart.getLinks();
    const thumbnail = await this.generateThumbnail();
    const icons = await Promise.all(nodes.map((d) => {
      if (d.icon && d.icon.startsWith('blob:')) {
        return Utils.blobToBase64(d.icon);
      }
      return d.icon;
    }));
    nodes.forEach((d, k) => {
      nodes[k].icon = icons[k];
    });

    console.log(JSON.stringify({
      ...requestData,
      nodes,
      links,
      thumbnail,
    }), null, 2);
  }

  generateThumbnail = async () => {
    const svg = document.querySelector('#graph svg');
    const canvas = await html2canvas(svg);
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    const img = canvas.toDataURL('image/png');
    document.body.removeChild(canvas);

    return img;
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
            label="Graph name"
            value={requestData.title}
            onChangeText={(v) => this.handleChange('title', v)}
          />
          <div className="buttons">
            <Button onCLick={() => this.toggleModal(false)}>
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

export default SaveGraphModal;
