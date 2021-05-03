import React, { Component } from 'react';
import { ReactComponent as PlaySvg } from '../assets/images/icons/play.svg';
import { ReactComponent as ControlSvg } from '../assets/images/icons/control.svg';
import Chart from '../Chart';
import { toast } from "react-toastify";

class AutoPlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      play: false,
    };
  }

  componentDidMount() {
    Chart.event.on('render', this.handleChartRender);
  }

  componentWillUnmount() {
    Chart.event.removeListener('render', this.handleChartRender);
  }

  handleChartRender = (chart) => {
    const { play: _play } = this.state;
    const play = chart.data.nodes[0]?.fx === undefined;
    if (play !== _play) {
      this.setState({ play });
    }
  }

  toggle = () => {
    const labels = Chart.getLabels();
    toast.dismiss(this.notification);
    const { play: _play } = this.state;
    const play = !_play;
    const nodes = Chart.getNodes();
    if (play) {
      if (labels.length) {
        this.notification = toast.info('You can not use this feature because you have a label(s)');
        return;
      }
      nodes.forEach((d, i) => {
        delete nodes[i].fx;
        delete nodes[i].fy;
      });
    }
    Chart.render({ nodes });
    this.setState({ play });
  }

  render() {
    const { play } = this.state;
    return (
      <div id="autoPlay" onClick={this.toggle}>
        {play ? (
          <ControlSvg width={15} height={22} />
        ) : (
          <PlaySvg width={15} height={15} />
        )}
      </div>
    );
  }
}

export default AutoPlay;
