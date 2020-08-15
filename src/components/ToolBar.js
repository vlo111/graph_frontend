import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Button from './form/Button';
import { setActiveButton } from '../store/actions/app';
import Chart from '../Chart';
import { ReactComponent as Logo } from '../assets/images/logo.svg';
import SaveGraph from './chart/SaveGraph';
import Undo from './Undo';
import { ReactComponent as InfoSvg } from '../assets/images/icons/info.svg';
import { ReactComponent as AddSvg } from '../assets/images/icons/add.svg';
import { ReactComponent as CloseSvg } from '../assets/images/icons/close.svg';
import { ReactComponent as LoopSvg } from '../assets/images/icons/loop.svg';

class ToolBar extends Component {
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (ev) => {
    if (ev.ctrlKey && ev.key === 'z') {
      this.undo();
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
    console.log(555);
  }

  render() {
    const { activeButton } = this.props;
    return (
      <div id="toolBar">
        <div className="top">
          <Link to="/">
            <Logo className="logo" />
          </Link>
          <SaveGraph />
          <Undo />
          <div className="actionButtons">
            <Button
              className={activeButton === 'create' ? 'active' : undefined}
              icon={<AddSvg />}
              onClick={() => this.handleClick('create')}
            >
              Add
            </Button>
            <Button
              icon={<CloseSvg style={{ width: 10, margin: '0 2px' }} />}
              className={activeButton === 'delete' ? 'active' : undefined}
              onClick={() => this.handleClick('delete')}
            >
              Remove
            </Button>
            <Button
              icon={<LoopSvg />}
              className={activeButton === 'reset' ? 'active' : undefined}
              onClick={this.reset}
            >
              Reset project
            </Button>
            <Button
              className={activeButton === 'data' ? 'active' : undefined}
              icon={<LoopSvg />}
              onClick={() => this.handleClick('data')}
            >
              Data sheet
            </Button>
            <Button
              className={activeButton === 'import' ? 'active' : undefined}
              icon={<LoopSvg />}
              onClick={() => this.handleClick('import')}
            >
              Import data
            </Button>
          </div>
        </div>
        <div className="bottom helpWrapper">
          <Button icon={<InfoSvg />}>
            Help
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
});
const mapDispatchToProps = {
  setActiveButton,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToolBar);

export default Container;
