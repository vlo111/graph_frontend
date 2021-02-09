import _ from 'lodash';
import Chart from '../Chart';

const MAX_COUNT = 10;

class ChartUndoManager {
  constructor() {
    this.pointer = 0;
    this.data = [];
  }

  reset() {
    this.pointer = 0;
    this.data = [];
  }

  normalize = (datum) => {
    datum.nodes = datum.nodes.map((d) => ({
      ...d,
      lx: undefined,
      ly: undefined,
      fx: undefined,
      fy: undefined,
    }));
    return datum;
  }

  async push(datum) {
    if (_.isEmpty(datum?.nodes) && _.isEmpty(datum?.links)) {
      return;
    }
    if (_.isEqual(_.last(this.data), datum)) {
      return;
    }
    if (this.data.length > MAX_COUNT - 1) {
      this.data.shift();
    }
    this.data.push(_.cloneDeep(datum));
  }

  undoCount() {
    const count = this.data.length - this.pointer - 1;
    return count < 1 ? 0 : count;
  }

  redoCount() {
    const count = this.pointer;
    return count < 1 ? 0 : count;
  }

  async undo() {
    if (this.pointer + 1 < this.data.length) {
      this.pointer += 1;
    }
    const datum = this.data[this.data.length - this.pointer - 1];
    if (datum) {
      Chart.render(datum, { dontRemember: true });
    }
  }

  async redo() {
    if (this.pointer > 0) {
      this.pointer -= 1;
    }
    const datum = this.data[this.data.length - this.pointer - 1];
    if (datum) {
      Chart.render(datum, { dontRemember: true });
    }
  }
}

export default ChartUndoManager;
