import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import Select from '../form/Select';
import Input from '../form/Input';
import Button from '../form/Button';
import Chart from '../../Chart';
import ChartUtils from "../../helpers/ChartUtils";
import Checkbox from "../form/Checkbox";

class AddLinkModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      linkData: {},
      show: false,
      errors: {},
    };
  }

  componentDidMount() {
    Chart.event.on('line.new', this.handleAddNewLine);
  }

  handleAddNewLine = (d) => {
    const { source, target } = d;
    const linkData = {
      source,
      target,
      value: 2,
      type: 'a',
      direction: true,
      description: '',
    };
    this.setState({ linkData, show: true });
  }

  closeModal = () => {
    this.setState({ show: false });
  }

  addLink = async () => {
    const { linkData } = this.state;
    const errors = {};
    const links = Chart.getLinks();
    if (_.isEmpty(errors)) {
      links.push(linkData);

      this.setState({ show: false });
      Chart.render({ links });
    }
    this.setState({ errors });
  }

  handleChange = (path, value) => {
    const { linkData, errors } = this.state;
    _.set(linkData, path, value);
    _.remove(errors, path);
    this.setState({ linkData, errors });
  }

  render() {
    const { linkData, errors, show } = this.state;
    return (
      <Modal
        className="ghModal"
        overlayClassName="ghModalOverlay"
        isOpen={show}
        onRequestClose={this.closeModal}
      >
        <h2>Add new Link</h2>

        <Select
          label="Type"
          value={[linkData.type]}
          error={errors.type}
          onChange={(v) => this.handleChange('type', v)}
          options={['a', 'b', 'c', 'd', 'e']}
          isSearchable={false}
          containerClassName="lineTypeSelect"
          getOptionValue={(v) => v}
          getOptionLabel={(v) => (
            <svg height="18" width="310">
              <line
                strokeLinecap={ChartUtils.dashLinecap(v)}
                strokeDasharray={ChartUtils.dashType(v, 2)}
                stroke="#1f77b4"
                strokeWidth="2"
                x1="0"
                y1="10"
                x2="310 "
                y2="10"
              />
            </svg>
          )}
        />


        <Input
          label="Value"
          value={linkData.value}
          error={errors.value}
          type="number"
          onChangeText={(v) => this.handleChange('value', v)}
        />

        <Input
          label="Description"
          value={linkData.description}
          error={errors.description}
          textArea
          rows={4}
          type="number"
          onChangeText={(v) => this.handleChange('description', v)}
        />
        <Checkbox
          label="Show Direction"
          checked={linkData.direction}
          onChange={() => this.handleChange('direction', !linkData.direction)}
        />
        <div className="buttons">
          <Button onClick={this.closeModal}>
            Cancel
          </Button>
          <Button onClick={this.addLink}>
            Add
          </Button>
        </div>

      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDespatchToProps = {};

const Container = connect(
)(AddLinkModal);

export default Container;
