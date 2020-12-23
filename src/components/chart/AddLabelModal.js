import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import Button from '../form/Button';
import Chart from '../../Chart';
import Validate from '../../helpers/Validate';
import Input from '../form/Input';
import ChartUtils from '../../helpers/ChartUtils';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import ContextMenu from '../contextMenu/ContextMenu';

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
    ContextMenu.event.on('folder.new', this.handleFolderCrate);
  }

  componentWillUnmount() {
    ContextMenu.event.removeListener('folder.new', this.handleFolderCrate);
  }

  handleLabelCrate = (ev, d) => {
    this.setState({ show: true, labelData: { ...d } });
  }

  handleFolderCrate = (ev, d) => {
    const { x, y } = ChartUtils.calcScaledPosition(ev.x, ev.y);
    const labels = Chart.getLabels();
    const labelData = {
      id: `f_${ChartUtils.uniqueId(labels)}`,
      color: ChartUtils.labelColors(),
      d: [[x, y]],
      name: '',
      type: 'folder',
    };
    this.setState({ show: true, labelData });
  }

  deleteLabel = () => {
    const { labelData } = this.state;
    let labels = Chart.getLabels();
    labels = labels.filter((l) => l.id !== labelData.id);
    Chart.render({ labels });
    this.setState({ show: false });
  }

  addLabel = async (ev) => {
    ev.preventDefault();
    const { labelData } = this.state;
    const labels = Chart.getLabels();
    const errors = {};
    [errors.name, labelData.name] = Validate.labelName(labelData.name);
    if (!Validate.hasError(errors)) {
      const i = labels.findIndex((l) => l.id === labelData.id);
      if (i > -1) {
        labels[i] = labelData;
      } else {
        labels.push(labelData);
      }
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
        <div className="containerModal">
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.deleteLabel} />
          <form className="form" onSubmit={this.addLabel}>
            <h2>Add new label</h2>
            <Input
              value={labelData.name}
              error={errors.name}
              label="Name"
              onChangeText={(v) => this.handleChange('name', v)}
            />
            <div className="buttons">
              <Button className="ghButton cancel transparent alt" onClick={this.deleteLabel}>
                Cancel
              </Button>
              <Button className="ghButton accent alt" type="submit">
                Add
              </Button>
            </div>
          </form>
        </div>
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
