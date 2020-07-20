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

class AddLinkModal extends Component {
  getGroups = memoizeOne((links) => {
    console.log(links)
    const types = links.filter((d) => d.group)
      .map((d) => ({
        value: d.group,
        label: d.group,
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
    const links = Chart.getLinks();
    const groups = this.getGroups(links);

    const linkData = {
      source,
      target,
      value: 2,
      type: 'a',
      direction: true,
      group: groups[0]?.value || null,
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
    if (!linkData.group) {
      errors.group = 'Group is required';
    }

    if (_.isEmpty(errors)) {
      const links = Chart.getLinks();
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
    const groups = this.getGroups(links);
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

        <Select
          label="Relation Type"
          placeholder=""
          value={[
            groups.find((t) => t.value === linkData.group) || { value: linkData.group, label: linkData.group },
          ]}
          error={errors.group}
          onChange={(v) => this.handleChange('group', v.value)}
          options={groups}
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

const mapStateToProps = (state) => ({});
const mapDespatchToProps = {};

const Container = connect(
)(AddLinkModal);

export default Container;
