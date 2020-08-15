import Chart from '../Chart';

class ChartUndoManager {
  constructor() {
    this.pointer = 0;
    this.data = [];
  }

  get data() {
    let data;
    try {
      data = JSON.parse(sessionStorage.getItem('chartUndoManager'));
    } catch (e) {
      //
    }
    return data || [];
  }

  set data(data) {
    sessionStorage.setItem('chartUndoManager', JSON.stringify(data));
  }

  async add(datum) {
    if (!datum.nodes?.length && !datum.links?.length) {
      return;
    }
    this.data = [...this.data, datum];
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
    const datum = this.data.reverse()[this.pointer];
    if (datum) {
      Chart.render(datum, { dontRemember: true });
    }
  }

  async redo() {
    if (this.pointer > 0) {
      this.pointer -= 1;
    }
    const datum = this.data.reverse()[this.pointer];
    if (datum) {
      Chart.render(datum, { dontRemember: true });
    }
  }
}

export default ChartUndoManager;
