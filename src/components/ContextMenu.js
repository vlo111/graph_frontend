import React, { Component } from 'react';
import EventEmitter from 'events';
import Button from './form/Button';
import Chart from '../Chart';

class ContextMenu extends Component {
  static event = new EventEmitter();

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
    this.constructor.event.removeAllListeners();
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
      params = Chart.getNodes().find((d) => d.index === index);
      element = 'node';
    } else if (ev.target.tagName === 'line') {
      const index = +ev.target.getAttribute('id').replace('l', '');
      params = { index };
      element = 'link';
    } else if (ev.target.tagName === 'svg') {
      element = 'chart';
    } else if (ev.target.closest('.contentWrapper')) {
      element = 'nodeFullInfo';
      params = { name: ev.target.closest('.contentWrapper').getAttribute('data-name') };
    }
    this.setState({
      x, y, show: element, params,
    });
  }

  closeMenu = () => {
    this.setState({ show: false });
  }

  handleClick = (type, additionalParams) => {
    const { params } = this.state;
    params.contextMenu = true;
    this.constructor.event.emit(type, { ...params, ...additionalParams });
  }

  nodeFullInfoContext = () => {
    const { x, y, params } = this.state;
    return (
      <div className="contextmenuOverlay contextmenuOverlayFullInfo" onClick={this.closeMenu}>
        <div className="contextmenu" style={{ left: x, top: y }}>
          <Button icon="fa-pencil-square-o" onClick={() => this.handleClick('node.full_info', params.name)}>
            Edit
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const {
      x, y, show, params,
    } = this.state;
    if (!show) {
      return null;
    }
    if (show === 'nodeFullInfo') {
      return this.nodeFullInfoContext();
    }
    const undoCount = Chart.undoManager.undoCount();
    const showInMap = Chart.getNodes().some((d) => d.location);
    return (
      <div className="contextmenuOverlay" onClick={this.closeMenu}>
        <div className="contextmenu" style={{ left: x, top: y }}>
          {show === 'node' ? (
            <Button icon="fa-pencil-square-o" onClick={() => this.handleClick('node.edit')}>
              Edit
            </Button>
          ) : null}
          {params.link ? (
            <Button icon="fa-link" title={params.link}>
              <a href={params.link} target="_blank" rel="noopener noreferrer">
                Open Link
              </a>
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
          {showInMap ? (
            <Button icon="fa-globe" onClick={() => this.handleClick('active-button', { button: 'maps-view' })}>
              Show in map
            </Button>
          ) : null}
          <Button icon="fa-crop" onClick={() => this.handleClick('crop')}>
            Crop
          </Button>
          <Button disabled={!undoCount} icon="fa-undo" onClick={() => this.handleClick('undo')}>
            {'Undo '}
            <sub>(Ctrl+Z)</sub>
          </Button>
        </div>
      </div>
    );
  }
}

export default ContextMenu;
