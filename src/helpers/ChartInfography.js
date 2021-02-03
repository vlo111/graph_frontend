import Chart from '../Chart';
import ChartUtils from './ChartUtils';

class ChartInfography {
  static render = (chart) => {
    chart.nodesWrapper.selectAll('.infography rect')
      .on('mousemove', (ev) => {
        ChartUtils.keyEvent(ev);
        const { parentNode } = ev.target;
        if (ev.ctrlPress) {
          if (!parentNode.classList.contains('crop')) {
            parentNode.classList.add('crop');
          }
        } else if (parentNode.classList.contains('crop')) {
          parentNode.classList.remove('crop');
        }
      });
  }
}

export default ChartInfography;
