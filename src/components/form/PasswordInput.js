import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Input from './Input';
import { ReactComponent as ViewSvg } from '../../assets/images/icons/view.svg';
import { ReactComponent as EyeSvg } from '../../assets/images/icons/eye.svg';
import Utils from '../../helpers/Utils';

class PasswordInput extends Component {
  static propTypes = {
    containerClassName: PropTypes.string,
  }

  static defaultProps = {
    containerClassName: '',
  }

  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
  }

  toggleShowPassword = async (show) => {
    await this.setState({ show });
    Utils.moveCursorToEnd(this.ref);
  }

  render() {
    const { show } = this.state;
    const { containerClassName, ...props } = this.props;
    return (
      <Input
        {...props}
        onRef={(ref) => this.ref = ref}
        containerClassName={`ghFormFieldPassword ${containerClassName} `}
        type={show ? 'text' : 'password'}
        icon={show ? (
          <EyeSvg
            width={14}
            onClick={() => this.toggleShowPassword(false)}
            
          />
        ) : (
          <ViewSvg
            width={14}
            onClick={() => this.toggleShowPassword(true)}
          />
        )}
      />
    );
  }
}

export default PasswordInput;
