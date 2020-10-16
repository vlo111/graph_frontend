import React, { Component } from 'react';
import EventEmitter from 'events';
import Button from '../form/Button';
import Chart from '../../Chart';
import NodeContextMenu from './NodeContextMenu';
import LinkContextMenu from './LinkContextMenu';
import NodeFullInfoContext from './NodeFullInfoContext';
import LabelContextMenu from './LabelContextMenu';
import Icon from '../form/Icon';
import LabelUtils from '../../helpers/LabelUtils';

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
    if (ev.target.closest('.nodes')) {
      const index = +ev.target.parentNode.getAttribute('data-i');
      params = Chart.getNodes().find((d) => d.index === index);
      element = 'node';
    } else if (ev.target.closest('.links')) {
      const index = +ev.target.getAttribute('id').replace('l', '');
      params = { index };
      element = 'link';
    } else if (ev.target.tagName === 'svg') {
      element = 'chart';
    } else if (ev.target.closest('.contentWrapper')) {
      const el = ev.target.closest('.contentWrapper');
      const fieldName = el.getAttribute('data-field-name');
      if (fieldName) {
        element = 'nodeFullInfo';
        params = { fieldName };
      }
    } else if (ev.target.closest('.labels')) {
      params = { name: ev.target.getAttribute('data-name') };
      element = 'label';
    }
    this.setState({
      x, y, show: element, params,
    });
  }

  closeMenu = (ev) => {
    if (ev && ev.target.classList.contains('notClose')) {
      return;
    }
    this.setState({ show: false });
  }

  handleClick = (ev, type, additionalParams) => {
    const { params } = this.state;
    params.contextMenu = true;
    this.constructor.event.emit(type, ev, { ...params, ...additionalParams });
  }

  render() {
    const {
      x, y, show, params,
    } = this.state;
    if (!show) {
      return null;
    }
    const undoCount = Chart.undoManager.undoCount();
    const showInMap = Chart.getNodes().some((d) => d.location);
    return (
      <div className={`contextmenuOverlay ${x + 360 > window.innerWidth ? 'toLeft' : ''}`} onClick={this.closeMenu}>
        <div className="contextmenu" style={{ left: x, top: y }}>
          {show === 'node' ? <NodeContextMenu onClick={this.handleClick} params={params} /> : null}
          {show === 'link' ? <LinkContextMenu onClick={this.handleClick} params={params} /> : null}
          {show === 'label' ? <LabelContextMenu onClick={this.handleClick} params={params} /> : null}
          {show === 'nodeFullInfo' ? <NodeFullInfoContext onClick={this.handleClick} params={params} /> : null}
          <div className="ghButton notClose">
            <Icon value="fa-clipboard" />
            Past
            <Icon className="arrow" value="fa-angle-right" />
            <div className="contextmenu">
              <Button onClick={(ev) => {
                LabelUtils.past(x, y);
                this.handleClick(ev, 'label.append');
              }}
              >
                Append
              </Button>
              <Button onClick={(ev) => this.handleClick(ev, 'label.embed')}>
                Past Embedded (//todo)
              </Button>
            </div>
          </div>
          {['node', 'link', 'label', 'chart'].includes(show) ? (
            <>
              {showInMap ? (
                <Button
                  icon="fa-globe"
                  onClick={(ev) => this.handleClick(ev, 'active-button', { button: 'maps-view' })}
                >
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
            </>
          ) : null}
        </div>
      </div>
    );
  }
}

export default ContextMenu;
