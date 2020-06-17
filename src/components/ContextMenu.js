import React, { Component } from 'react';
import EventEmitter from 'events';
import Button from './form/Button';

const contextEvent = new EventEmitter();

class ContextMenu extends Component {
  static event = contextEvent;

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      x: 0,
      y: 0,
      params: {},
    };
  }

  componentDidMount() {
    document.addEventListener('contextmenu', this.onHandleContextMenu);
  }

  componentWillUnmount() {
    contextEvent.removeAllListeners();
    document.removeEventListener('contextmenu', this.onHandleClick);
  }

  onHandleContextMenu = async (ev) => {
    ev.preventDefault();
    const { show } = this.state;
    if (show) {
      this.setState({ show: false });
      return;
    }
    const { x, y } = ev;
    let element;
    let params = {};
    if (ev.target.parentNode.classList.contains('node')) {
      const index = +ev.target.parentNode.getAttribute('data-i');
      params = { index };
      element = 'node';
    } else if (ev.target.tagName === 'line') {
      const index = +ev.target.getAttribute('data-i');
      params = { index };
      element = 'link';
    } else if (ev.target.tagName === 'svg') {
      element = 'chart';
    }

    this.setState({
      x, y, show: element, params,
    });
  }

  closeMenu = () => {
    this.setState({ show: false });
  }

  handleClick = (type) => {
    const { params } = this.state;
    params.contextMenu = true;
    contextEvent.emit(type, params);
  }

  render() {
    const { x, y, show } = this.state;
    if (!show) {
      return null;
    }
    return (
      <div className="contextmenuOverlay" onClick={this.closeMenu}>
        <div className="contextmenu" style={{ left: x, top: y }}>
          {show === 'node' ? (
            <Button icon="fa-pencil-square-o" onClick={() => this.handleClick('node.edit')}>
              Edit
            </Button>
          ) : null}
          {show === 'node' ? (
            <Button icon="fa-eraser" onClick={() => this.handleClick('node.delete')}>
              Delete
            </Button>
          ) : null}
          {show === 'link' ? (
            <Button icon="fa-eraser" onClick={() => this.handleClick('link.delete')}>
              Delete
            </Button>
          ) : null}
          <Button icon="fa-crop" onClick={() => this.handleClick('crop')}>
            Crop
          </Button>
          <Button icon="fa-undo" onClick={() => this.handleClick('undo')}>
            Undo
            <sub>(Ctrl+Z)</sub>
          </Button>
        </div>
      </div>
    );
  }
}

export default ContextMenu;
