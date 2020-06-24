import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from './form/Button';
import { setActiveButton } from '../store/actions/app';
import Chart from "../Chart";

class ToolBar extends Component {
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown)
  }

  handleKeyDown = (ev) => {
    if (ev.ctrlKey && ev.key === 'z') {
      this.undo()
    }
  }

  handleClick = (button) => {
    this.props.setActiveButton(button);
  }

  reset = () => {
    const nodes = Chart.getNodes();
    nodes.forEach((d, i) => {
      delete nodes[i].fx;
      delete nodes[i].fy;
    });
    Chart.render({ nodes });
  }

  undo = () => {
    console.log(555)
  }

  render() {
    const { activeButton } = this.props;
    return (
      <div id="toolBar">
        <div className="top">
          <Button
            className={activeButton === 'create' ? 'active' : undefined}
            icon="fa-pencil"
            onClick={() => this.handleClick('create')}
          >
            Create
          </Button>
          <Button
            className={activeButton === 'delete' ? 'active' : undefined}
            icon="fa-eraser"
            onClick={() => this.handleClick('delete')}
          >
            Delete
          </Button>
          <Button
            className={activeButton === 'undo' ? 'active' : undefined}
            title="Undo: Click to undo (Ctrl+Z)"
            icon="fa-long-arrow-left"
            onClick={this.undo}
          >
            Undo
          </Button>
          <Button
            className={activeButton === 'reset' ? 'active' : undefined}
            icon="fa-repeat"
            onClick={this.reset}
          >
            Reset
          </Button>
          <Button
            className={activeButton === 'data' ? 'active' : undefined}
            icon="fa-table"
            onClick={() => this.handleClick('data')}
          >
            Data
          </Button>
          <Button
            className={activeButton === 'import' ? 'active' : undefined}
            icon="fa-upload"
            onClick={() => this.handleClick('import')}
          >
            Import
          </Button>
        </div>
        <div className="bottom">
          <Button icon="fa-question-circle" />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
});
const mapDespatchToProps = {
  setActiveButton,
};
const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(ToolBar);

export default Container;
