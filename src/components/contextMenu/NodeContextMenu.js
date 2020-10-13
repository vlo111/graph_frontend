import React, { Component } from 'react';
import EventEmitter from 'events';
import Button from '../form/Button';
import Chart from '../../Chart';

class ContextMenu extends Component {
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
            <Button icon="fa-pencil-square-o" onClick={(ev) => this.handleClick(ev, 'node.edit')}>
              Edit
            </Button>
          ) : null}
          {show === 'link' ? (
            <Button icon="fa-pencil-square-o" onClick={(ev) => this.handleClick(ev, 'link.edit')}>
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
            <Button icon="fa-eraser" onClick={(ev) => this.handleClick(ev, 'node.delete')}>
              Delete
            </Button>
          ) : null}
          {show === 'link' ? (
            <Button icon="fa-eraser" onClick={(ev) => this.handleClick(ev, 'link.delete')}>
              Delete
            </Button>
          ) : null}
          {show === 'label' ? (
            <Button icon="fa-clipboard" onClick={(ev) => this.handleClick(ev, 'label.copy')}>
              Copy
            </Button>
          ) : null}
          {show === 'label' ? (
            <Button icon="fa-eraser" onClick={(ev) => this.handleClick(ev, 'label.delete')}>
              Delete
            </Button>
          ) : null}
          {showInMap ? (
            <Button icon="fa-globe" onClick={(ev) => this.handleClick(ev, 'active-button', { button: 'maps-view' })}>
              Show in map
            </Button>
          ) : null}
          <Button icon="fa-crop" onClick={(ev) => this.handleClick(ev, 'crop')}>
            Crop
          </Button>
          <Button disabled={!undoCount} icon="fa-undo" onClick={(ev) => this.handleClick(ev, 'undo')}>
            {'Undo '}
            <sub>(Ctrl+Z)</sub>
          </Button>
        </div>
      </div>
    );
  }
}

export default ContextMenu;
