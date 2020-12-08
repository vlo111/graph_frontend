import React, { Component } from 'react';
import _ from 'lodash';
import { Jodit } from 'jodit';
import 'jodit/build/jodit.min.css';
import PropTypes from 'prop-types';
import Utils from '../../helpers/Utils';
import Outside from '../Outside';

class Editor extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    ref: PropTypes.func,
    value: PropTypes.string.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    buttons: PropTypes.array,
  }

  static defaultProps = {
    className: '',
    ref: null,
    label: '',
    placeholder: '',
    error: '',
    buttons: ['bold', 'italic', 'underline', '|', 'file', '|', 'link'],
  }

  constructor(props) {
    super(props);
    this.state = {
      showPopUp: null,
      popUpData: {},
    };
  }

  componentDidMount() {
    const {
      value, ref, className, onChange, label, error, buttons, ...options
    } = this.props;
    if (this.editor) {
      this.editor.destruct();
    }
    options.buttons = buttons;

    options.buttonsMD = options.buttonsMD || buttons;

    options.buttonsSM = options.buttonsSM || buttons;

    options.buttonsXS = options.buttonsXS || buttons;

    options.controls = options.controls || {};
    options.controls.file = {
      popup: (jodit, anchor) => {
        const popUpData = {};
        const selected = window.getSelection().toString().trim();

        if (anchor && anchor.getAttribute) {
          popUpData.file = anchor.getAttribute('href');
          popUpData.fileName = anchor.getAttribute('download');
          popUpData.text = anchor.innerText;
          popUpData.update = anchor.outerHTML;
        } else if (selected) {
          popUpData.update = selected;
          popUpData.text = selected;
        }

        this.setState({ showPopUp: 'file', popUpData });
      },
    };

    this.editor = new Jodit(this.textarea, options);

    if (ref) {
      ref(this.editor);
    }

    this.editor.events.on('change', onChange);
    this.editor.value = value;
  }

  componentDidUpdate() {
    const { value } = this.props;
    if (value !== this.editor.value) {
      this.editor.value = value;
    }
  }

  componentWillUnmount() {
    if (this.editor) {
      this.editor.destruct();
    }
  }

  closePopUp = () => {
    this.setState({ showPopUp: null, popUpData: {} });
  }

  insertFile = (ev) => {
    ev.preventDefault();
    const { popUpData } = this.state;
    if (popUpData.file) {
      const anchor = `<a href="${popUpData.file}" download="${popUpData.fileName}">${popUpData.text || popUpData.fileName}</a>`;
      let html;
      if (popUpData.update) {
        html = this.editor.value.replace(popUpData.update, anchor);
      } else {
        html = this.editor.value + anchor;
      }
      this.editor.value = html;
    }

    this.setState({ showPopUp: null, popUpData: {} });
  }

  handlePopUpDataChange = (path, value) => {
    const { popUpData } = this.state;
    _.set(popUpData, path, value);
    this.setState({ popUpData });
  }

  render() {
    const { showPopUp, popUpData } = this.state;
    const { className, error, label } = this.props;
    let top;
    let left;
    if (showPopUp) { 
      const pos = document.querySelector(`.jodit-toolbar-button_${showPopUp}`).getBoundingClientRect(); 
	  top = pos.top + 35;
      left = pos.left;

    }
    return (
      <div className={`contentEditor ${className} ${error ? 'hasError' : ''}`}>
        {label ? <span className="label">{label}</span> : null}
        <textarea ref={(ref) => this.textarea = ref} />
        {error ? <span className="error">{error}</span> : null}
        {showPopUp === 'file' ? (
          <Outside onClick={this.closePopUp}>
            <div className="gh-jodit-popup jodit-popup jodit-popup_strategy_leftbottom" style={{ top, left }}>
              <div className="jodit-popup__content">
                <div className="jodit-tabs">
                  <div className="jodit-tabs__buttons">
                    <label className="jodit-ui-button" aria-pressed="true">
                      <span className="jodit-ui-button__text">
                        {popUpData.fileName || 'Select File'}
                      </span>
                      <input
                        className="hidden"
                        type="file"
                        onChange={(ev) => {
                          const file = ev.target.files[0];
                          const url = file ? Utils.fileToBlob(file) : '';
                          this.handlePopUpDataChange('file', url);
                          this.handlePopUpDataChange('fileName', file?.name || '');
                        }}
                      />
                    </label>
                  </div>
                  <div className="jodit-tabs__wrapper">
                    <div className="jodit-tab jodit-tab_active">
                      <form onSubmit={this.insertFile} className="jodit-form-2">
                        {!(popUpData.file || '').startsWith('blob:') ? (
                          <div className="jodit-form__group">
                            <input
                              className="jodit-input"
                              type="url"
                              required
                              value={popUpData.file || ''}
                              placeholder="http://"
                              onChange={(ev) => {
                                ev.preventDefault();
                                this.handlePopUpDataChange('fileName', '');
                                this.handlePopUpDataChange('file', ev.target.value);
                              }}
                            />
                          </div>
                        ) : null}

                        <div className="jodit-form__group">
                          <input
                            className="jodit-input"
                            type="text"
                            value={popUpData.text || ''}
                            placeholder="Alternative text"
                            onChange={(ev) => this.handlePopUpDataChange('text', ev.target.value)}
                          />
                        </div>
                        <div>
                          <button className="jodit-button jodit-ui-button_status_primary">
                            <span className="jodit-ui-button__icon" />
                            <span className="jodit-ui-button__text">
                              {popUpData.update ? 'Update' : 'Insert'}
                            </span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Outside>
        ) : null}
      </div>
    );
  }
}

export default Editor;
