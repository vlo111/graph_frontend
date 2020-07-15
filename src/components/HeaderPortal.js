import { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

class HeaderPortal extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  }

  constructor(props) {
    super(props);
    this.el = document.createElement('div');
  }

  componentDidMount() {
    document.getElementById('headerPortal').appendChild(this.el);
  }

  componentWillUnmount() {
    document.getElementById('headerPortal').removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.el,
    );
  }
}

export default HeaderPortal;
