import React, { Component } from 'react';
import Button from './form/Button';
import { ReactComponent as UndoSvg } from '../assets/images/icons/undo.svg';
import { ReactComponent as UndoBackSvg } from '../assets/images/icons/undo-back.svg';
import Chart from '../Chart';
import ContextMenu from './ContextMenu';
import Utils from "../helpers/Utils";

class Undo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      undoCount: 0,
      redoCount: 0,
    }
  }

  componentDidMount() {
    Chart.event.on('render', this.handleChartRender);
    ContextMenu.event.on('undo', this.handleUndo);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    Chart.event.removeListener('render', this.handleChartRender);
    ContextMenu.event.removeListener('undo', this.handleUndo);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (ev) => {
    const ctrl = Utils.getOS() === 'macos' ? ev.metaKey : ev.ctrlKey;
    if (ctrl && ev.keyCode === 90) {
      if (ev.shiftKey) {
        Chart.undoManager.redo();
      } else {
        Chart.undoManager.undo();
      }
    }
  }

  handleUndo = () => {
    Chart.undoManager.undo();
  }

  handleChartRender = () => {
    this.setState({
      undoCount: Chart.undoManager.undoCount(),
      redoCount: Chart.undoManager.redoCount(),
    });
  }

  render() {
    const { undoCount, redoCount } = this.state;
    return (
      <div className="undoWrapper">
        <Button
          onClick={() => Chart.undoManager.undo()}
          className="undo"
          icon={<UndoSvg fill="#717ea0" />}
          disabled={!undoCount}
        >
          {undoCount}
        </Button>
        <Button
          onClick={() => Chart.undoManager.redo()}
          className="undoBack"
          icon={<UndoBackSvg fill="#717ea0" />}
          disabled={!redoCount}
        >
          {redoCount}
        </Button>
      </div>
    );
  }
}

export default Undo;
