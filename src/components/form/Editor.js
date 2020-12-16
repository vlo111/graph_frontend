import React, { Component } from 'react';
import { Jodit } from 'jodit';
import 'jodit/build/jodit.min.css';
import PropTypes from 'prop-types';
import _ from 'lodash';
import InsertMediaTabsModal from '../nodeInfo/InsertMediaTabsModal';
import Utils from '../../helpers/Utils';

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
    buttons: [
      'bold', 'italic', 'underline', '|', 'file', '|', 'link', '|',
      'left',
      'center',
      'right',
      'justify',
    ],
  }

  constructor(props) {
    super(props);
    this.state = {
      showPopUp: null,
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
          popUpData.alt = anchor.innerText;
          popUpData.update = anchor.outerHTML;
        } else if (selected) {
          popUpData.update = selected;
          popUpData.alt = selected;
        }

        this.setState({ showPopUp: 'file' });
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
    this.setState({ showPopUp: null });
  }

  insertFile = (popUpData, tags) => {
    const file = popUpData.file[0];
    debugger;
    if (file) {
      const isImg = !_.isEmpty(['png', 'jpg', 'jpeg', 'gif', 'svg'].filter((p) => file.name.includes(p)));

      const desc = popUpData.desc ? `${popUpData.desc}` : '';

      let anchor = '';

      if (isImg && !popUpData.alt) {
        if (desc) {
          anchor = `
<table style="width: 200px;"><tbody>
<tr>
<td>
    <img
 class=scaled
 src=${file.preview} 
 tags="url={${file.preview}}, tager={${tags}}" 
 download="${file.name}" />
 ${desc}
     </td>
</tr>
</tbody>
</table>`;
        } else {
          anchor = `<img
          className=scaled
          src=${file.preview}
          tags="url={${file.name}}, tager={${tags}}"
          download="${file.name}"/>`;
        }
      } else {
        anchor = `<a 
href="${file.preview}"
tags="url={${file.name}}, tager={${tags}}, ${desc}" 
download="${file.name}">
${popUpData.alt || file.name}
</a>`;
      }

      let html;
      if (popUpData.update) {
        html = this.editor.value.replace(popUpData.update, anchor);
      } else {
        html = this.editor.value + anchor;
      }
      this.editor.value = html;
    }

    this.setState({ showPopUp: null });
  }

  render() {
    const { showPopUp } = this.state;
    const { className, error, label } = this.props;

    return (
      <div className={`contentEditor ${className} ${error ? 'hasError' : ''}`}>
        {label ? <span className="label">{label}</span> : null}
        <textarea ref={(ref) => this.textarea = ref} />
        {error ? <span className="error">{error}</span> : null}
        {showPopUp === 'file' ? (
          <InsertMediaTabsModal close={this.closePopUp} insertFile={this.insertFile} />
        ) : null}
      </div>
    );
  }
}

export default Editor;
