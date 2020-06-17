function UndoItem(perform, data) {
  this.perform = perform;
  this.data = data;
}


class UndoStack {
  constructor() {
    this.stack = [];
    this.current = -1;
  }

  push = (perform, data) => {
    this.current += 1;
    this.stack.splice(this.current);
    this.stack.push(new UndoItem(perform, data));
  }

  undo = () => {
    let item;
    if (this.current >= 0) {
      item = this.stack[this.current];
      item.perform.call(this.self, false, item.data);
      this.current -= 1;
    } else {
      throw new Error('Already at oldest change');
    }
  }

  redo = () => {
    const item = this.stack[this.current + 1];
    if (item) {
      item.perform.call(this.self, true, item.data);
      this.current += 1;
    } else {
      throw new Error('Already at newest change');
    }
  }

  invalidateAll = () => {
    this.stack = [];
    this.current = -1;
  }
}
