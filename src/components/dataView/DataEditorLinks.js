import React, { Component } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import Button from '../form/Button';
import FileInput from '../form/FileInput';
import Input from "../form/Input";

class DataEditorLinks extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onChangeText: PropTypes.func.isRequired,
    value: PropTypes.string,
  }

  static defaultProps = {
    value: '',
  }

  initValues = memoizeOne((valuesText) => {
    if (valuesText) {
      const regex = /\[link[^\]]+url="([^"]*)"[^\]]*]([^[\]]*)/ig;
      const values = [];
      let match;
      // eslint-disable-next-line no-cond-assign
      while (match = regex.exec(valuesText)) {
        values.push({
          url: match[1],
          name: match[2],
        });
      }
      this.setState({ values });
    } else {
      this.setState({ values: [{ url: '', name: '' }] });
    }
  });

  constructor(props) {
    super(props);
    this.state = {
      values: [],
    };
  }

  closeModal = async (ev) => {
    this.props.onClose(ev);
    document.dispatchEvent(new Event('mousedown'));
    document.dispatchEvent(new Event('mouseup'));
  }

  addNewItem = () => {
    const { values } = this.state;
    values.push({ url: '', name: '' });
    this.setState({ values });
  }

  handleChange = (value, path) => {
    const { values } = this.state;
    _.set(values, path, value);
    this.setValue(values);
  }

  deleteItem = (i) => {
    const { values } = this.state;
    values.splice(i, 1);
    this.setValue(values);
  }

  setValue = (values) => {
    this.setState({ values });
    const valuesText = values.map((f) => `[link url="${f.url || ''}"]${f.name || ''}[/file]`).join(' ');
    this.props.onChangeText(valuesText);
  }

  render() {
    const {
      onClose, onChangeText, value, ...props
    } = this.props;
    const { values } = this.state;
    this.initValues(value);
    return (
      <div>
        <Modal
          isOpen
          className="ghModal ghTableModal"
          overlayClassName="ghModalOverlay"
          onRequestClose={this.closeModal}
        >
          <h3>Links</h3>
          <div className="list">
            {values.map((val, i) => (
              <div className="listItem">
                <span className="legend">{`Link ${i + 1}`}</span>
                <Button icon="fa-close" className="close" onClick={() => this.deleteItem(i)} />
                <Input
                  value={val.url || ''}
                  icon="fa-link"
                  type="url"
                  placeholder="Url"
                  onChangeText={(v) => this.handleChange(v, `${i}.url`)}
                />
                <Input
                  value={val.name || ''}
                  icon="fa-font"
                  placeholder="Name"
                  onChangeText={(v) => this.handleChange(v, `${i}.name`)}
                />
              </div>
            ))}
            {values.length < 10 ? (
              <Button className="addNewItem" icon="fa-plus" onClick={this.addNewItem} />
            ) : null}
          </div>
          <Button onMouseDown={this.closeModal}>Save</Button>
        </Modal>
        {props.value}
      </div>
    );
  }
}

export default DataEditorLinks;
