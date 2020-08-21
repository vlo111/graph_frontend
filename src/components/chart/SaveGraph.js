import React, { Component } from 'react';
import { withRouter, Prompt } from 'react-router-dom';
import Button from '../form/Button';
import SaveGraphModal from './SaveGraphModal';
import Chart from '../../Chart';
import Utils from "../../helpers/Utils";
import ChartUtils from "../../helpers/ChartUtils";

class SaveGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      preventReload: false,
    };
  }

  componentDidMount() {
    Chart.event.on('dataChange', this.handleChartChange);
    window.addEventListener('beforeunload', this.handleUnload);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    Chart.event.removeListener('dataChange', this.handleChartChange);
    window.removeEventListener('beforeunload', this.handleUnload);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (ev) => {
    ChartUtils.keyEvent(ev);
    if (ev.chartEvent && ev.ctrlPress && ev.keyCode === 83) {
      ev.preventDefault();
      this.setState({ showModal: true });
    }
  }

  handleUnload = (ev) => {
    const { preventReload } = this.state;
    if (preventReload) {
      ev.preventDefault();
      ev.returnValue = 'Changes you made may not be saved.';
    }
  }

  handleChartChange = () => {
    const { preventReload } = this.state;
    if (!preventReload) {
      this.setState({ preventReload: true });
    }
  }

  toggleModal = (showModal) => {
    this.setState({ showModal });
  }

  handleDataSave = async () => {
    await this.setState({ preventReload: false });
    this.props.history.push('/');
  }

  render() {
    const { showModal, preventReload } = this.state;
    return (
      <div className="saveGraphWrapper">
        <Button className="saveGraph" onClick={() => this.toggleModal(true)}>
          Save Graph
        </Button>
        <Prompt
          when={preventReload}
          message={() => 'Changes you made may not be saved.'}
        />
        {showModal ? (
          <SaveGraphModal toggleModal={this.toggleModal} onSave={this.handleDataSave} />
        ) : null}
      </div>
    );
  }
}

export default withRouter(SaveGraph);
