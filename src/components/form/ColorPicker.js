import React, { Component } from 'react';
import { SketchPicker, TwitterPicker } from 'react-color';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import Outside from '../Outside';
import Input from './Input';
import { NODE_COLOR } from '../../data/node';

class ColorPicker extends Component {
  static propTypes = {
    onChangeText: PropTypes.func.isRequired,
    containerClassName: PropTypes.string,
    value: PropTypes.string,
  }

  static defaultProps = {
    containerClassName: '',
    value: '',
  }

  constructor(props) {
    super(props);
    this.state = {
      target: null,
    };
  }

  handleColorClick = (ev) => {
    const title = ev.target.getAttribute('title');
    if (title && title.startsWith('#')) {
      this.closePicker();
    }
  }

  closePicker = () => {
    this.setState({ target: null });
  }

  toggleColorPicker = (ev) => {
    const { target } = this.state;
    this.setState({ target: !target ? ev.target : null });
  }

  renderPicker = () => {
    const { target } = this.state;
    const { value, onChangeText } = this.props;

    const { x, y, height } = target.getBoundingClientRect();
    return (
      ReactDOM.createPortal((
        <Outside exclude=".ghColorPicker" onClick={this.closePicker}>
          <div className="ghColorPickerPopUp" onClick={this.handleColorClick} style={{ left: x, top: y + height - 35 }}>
            <SketchPicker
              width={230}
              color={value}
              disableAlpha
              onChange={(v) => onChangeText(v.hex)}
              presetColors={[...NODE_COLOR].splice(0, 18)}
            />
          </div>
        </Outside>
      ), document.body)
    );
  }

  render() {
    const {
      excludeClose, containerClassName, ...props
    } = this.props;
    const { target } = this.state;
    return (
      <>
        <Input
          {...props}
          containerClassName={classNames(containerClassName, 'ghColorPicker')}
          onClick={this.toggleColorPicker}
        />
        {target ? this.renderPicker() : null}
      </>
    );
  }
}

export default ColorPicker;
