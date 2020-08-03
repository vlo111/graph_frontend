import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import Select from '../form/Select';
import Input from '../form/Input';
import Button from '../form/Button';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';
import Checkbox from '../form/Checkbox';
import { DASH_TYPES } from '../../data/link';

class AddLinkModal extends Component {
  getTypes = memoizeOne((links) => {
    const types = links.filter((d) => d.type)
      .map((d) => ({
        value: d.type,
        label: d.type,
      }));

    return _.uniqBy(types, 'value');
  }, _.isEqual)

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
    const { linkData: { type } } = this.state;
    const links = Chart.getLinks();
    const types = this.getTypes(links);
    const linkData = {
      source,
      target,
      value: 2,
      direction: false,
      type: type || types[0]?.value || null,
      linkType: 'a',
      description: '',
    };
    this.setState({ linkData, show: true, errors: {} });
  }

  closeModal = () => {
    this.setState({ show: false });
  }

  addLink = async () => {
    const { linkData } = this.state;
    const links = Chart.getLinks();
    const errors = {};
    if (!linkData.type) {
      errors.type = 'Type is required';
    }

    if (links.find((d) => linkData.source === d.source && linkData.target === d.target && linkData.type === d.type)) {
      errors.type = 'Already exists';
    }

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
    const links = Chart.getLinks();
    const types = this.getTypes(links);
    return (
      <Modal
        className="ghModal"
        overlayClassName="ghModalOverlay"
        isOpen={show}
        onRequestClose={this.closeModal}
      >
        <h2>Add new Link</h2>

        <Select
          label="Link Type"
          value={[linkData.linkType]}
          error={errors.linkType}
          onChange={(v) => this.handleChange('linkType', v)}
          options={Object.keys(DASH_TYPES)}
          isSearchable={false}
          containerClassName="lineTypeSelect"
          getOptionValue={(v) => v}
          getOptionLabel={(v) => (
            <svg height="18" width="310">
              <line
                strokeLinecap={ChartUtils.dashLinecap(v)}
                strokeDasharray={ChartUtils.dashType(v, 2)}
                stroke="#7166F8"
                strokeWidth="2"
                x1="0"
                y1="10"
                x2="310 "
                y2="10"
              />
            </svg>
          )}
        />

        <Select
          label="Relation Type"
          placeholder=""
          value={[
            types.find((t) => t.value === linkData.type) || {
              value: linkData.type,
              label: linkData.type
            },
          ]}
          error={errors.type}
          onChange={(v) => this.handleChange('type', v?.value)}
          options={types}
          isClearable
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

const mapStateToProps = () => ({});
const mapDespatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(AddLinkModal);

export default Container;
