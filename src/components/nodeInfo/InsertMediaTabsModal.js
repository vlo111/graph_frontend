import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Button from '../form/Button';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import File from '../form/File';
import Utils from '../../helpers/Utils';
import Input from '../form/Input';

class InsertMediaTabsModal extends Component {
  static propTypes = {
    close: PropTypes.func,
    insertFile: PropTypes.func,
  }

  static defaultProps = {
    close: null,
    insertFile: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      popUpData: {},
      tags: [],
    };
  }

  closeInsertMedia = () => {
    this.props.close();
  }

  insertData = () => {
    const { popUpData, tags } = this.state;
    this.props.insertFile(popUpData, tags);
    this.props.close();
  }

  handleFileChange = async (path, value) => {
    const file = value?.name;
    let url = file ? Utils.fileToBlob(value) : '';
    url = await Utils.blobToBase64(url);
    const { popUpData } = this.state;

    _.set(popUpData, path, url);
    _.set(popUpData, 'fileName', value?.name);
    this.setState({ popUpData });
  }

  handleTextChange = (path, value) => {
    const { popUpData } = this.state;
    _.set(popUpData, path, value);
    this.setState({ popUpData });
  }

  removeTag = (i) => {
    const newTags = [...this.state.tags];
    newTags.splice(i, 1);
    this.setState({ tags: newTags });
  }

  inputTagKeyDown = (e) => {
    const val = e.target.value;

    if (e.key === 'Enter' && val) {
      if (this.state.tags.find((tag) => tag.toLowerCase() === val.toLowerCase())) {
        return;
      }
      this.setState({ tags: [...this.state.tags, val] });
      this.tagInput.value = null;

      const { popUpData } = this.state;
      _.set(popUpData, 'tags', [...this.state.tags, val]);
      this.setState({ popUpData });
      e.target.value = '';
    } else if (e.key === 'Backspace' && !val) {
      this.removeTag(this.state.tags.length - 1);
    }
  }

  render() {
    const { popUpData, tags } = this.state;

    return (
      <Modal
        className="ghModal insertMediaModal"
        overlayClassName="ghModalOverlay"
        isOpen
        onRequestClose={this.closeInsertMedia}
      >
        <div className="containerModal">
          <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeInsertMedia} />
          <div className="form">
            <h2>Select media</h2>
            <File
              onChangeFile={(file) => this.handleFileChange('file', file)}
            />
            <img src={popUpData?.file} alt="" />
            <Input
              type="text"
              value={popUpData.desc || ''}
              label="Description"
              onChange={(ev) => this.handleTextChange('desc', ev.target.value)}
            />
            <Input
              type="text"
              value={popUpData.alt || ''}
              label="Alternative text"
              onChange={(ev) => this.handleTextChange('alt', ev.target.value)}
            />
            <div className="input-tag">
              <ul className="input-tag__tags">
                { tags.map((tag, i) => (
                  <li key={tag}>
                    {tag}
                    <button type="button" onClick={() => { this.removeTag(i); }}>+</button>
                  </li>
                ))}
                {/* <li className="input-tag__tags__input"> */}
                {/* </li> */}
              </ul>
            </div>
            <Input
              placeholder="Insert tag"
              type="text"
              onKeyDown={this.inputTagKeyDown}
              ref={(c) => { this.tagInput = c; }}
            />
            <div className="buttons">
              <Button className="cancel transparent alt" onClick={this.closeInsertMedia}>
                Back
              </Button>
              <Button onClick={this.insertData} className="accent alt" type="submit">
                Insert
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default InsertMediaTabsModal;
