import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import Button from '../form/Button';
import Chart from '../../Chart';
import Validate from '../../helpers/Validate';
import Input from '../form/Input';

class AddLabelModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labelData: {},
      show: false,
      errors: {},
    };
  }

  componentDidMount() {
    Chart.event.on('label.new', this.handleLabelCrate);
  }

  handleLabelCrate = (ev, d) => {
    this.setState({ show: true, labelData: d });
  }

  deleteLabel = () => {
    const { labelData } = this.state;
    let labels = Chart.getLabels();
    labels = labels.filter((l) => l.color !== labelData.color);
    Chart.render({ labels });
    this.setState({ show: false });
  }

  addLabel = async (ev) => {
    ev.preventDefault();
    const { labelData } = this.state;
    let labels = Chart.getLabels();
    const errors = {};
    [errors.name, labelData.name] = Validate.labelName(labelData.name);

    if (!Validate.hasError(errors)) {
      labels = labels.map((l) => {
        if (l.color === labelData.color) {
          return labelData;
        }
        return l;
      });
      Chart.render({ labels });
      this.setState({ show: false });
    }
    this.setState({ errors });
  }

  handleChange = (path, value) => {
    const { labelData, errors } = this.state;
    _.set(labelData, path, value);
    _.remove(errors, path);
    this.setState({ labelData, errors });
  }

  render() {
    const { labelData, errors, show } = this.state;
    if (!show) {
      return null;
    }
    return (
      <Modal
        className="ghModal"
        overlayClassName="ghModalOverlay"
        isOpen
        onRequestClose={this.deleteLabel}
      >
        <form onSubmit={this.addLabel}>
          <h2>Add new label</h2>
          <Input
            value={labelData.name}
            error={errors.name}
            label="Name"
            onChangeText={(v) => this.handleChange('name', v)}
          />
          <div className="buttons">
            <Button onClick={this.deleteLabel}>
              Cancel
            </Button>
            <Button type="submit">
              Add
            </Button>
          </div>
        </form>
      </Modal>
    );
  }
}

const mapStateToProps = () => ({});
const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddLabelModal);

export default Container;
