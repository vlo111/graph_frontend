import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from './form/Button';
import { setActiveButton } from '../store/actions/app'; 
import SaveGraph from './chart/SaveGraph';
import Undo from './Undo';
import { ReactComponent as InfoSvg } from '../assets/images/icons/info.svg';
import { ReactComponent as AddSvg } from '../assets/images/icons/add.svg';
import { ReactComponent as CloseSvg } from '../assets/images/icons/close.svg';
import { ReactComponent as LoopSvg } from '../assets/images/icons/loop.svg'; 
import { ReactComponent as TagSvg } from '../assets/images/icons/tag.svg';
import { getSingleGraphRequest } from '../store/actions/graphs';

class ToolBar extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
    activeButton: PropTypes.string.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  }

  handleClick = (button) => {
    this.props.setActiveButton(button);
  }

  resetGraph = () => {
    const { match: { params: { graphId } } } = this.props;
    if (window.confirm('Are you sure?')) {
      this.props.getSingleGraphRequest(graphId);
    }
  }
  render() {
    const { activeButton, match: { params: { graphId } } } = this.props;
    return (
      <div id="toolBar">
        <div className="top">
          
          <SaveGraph />
          <Undo />
          <div className="actionButtons">
            <Button
              className={activeButton === 'create' ? 'active' : undefined}
              icon={<AddSvg />}
              onClick={() => this.handleClick('create')}
            >
              Add Node
            </Button>
            <Button
              className={activeButton === 'create-label' ? 'active' : undefined}
              icon={<TagSvg />}
              onClick={() => this.handleClick('create-label')}
            >
              Create Label
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
              onClick={this.resetGraph}
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
  getSingleGraphRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToolBar);

export default withRouter(Container);
