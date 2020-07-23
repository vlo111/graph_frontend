import React, { Component } from 'react';
import ReactDataSheet from 'react-datasheet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setActiveButton, setGridIndexes, toggledGrid } from '../../store/actions/app';
import Chart from '../../Chart';
import Input from '../form/Input';
import FileInput from '../form/FileInput';
import DataEditorDescription from './DataEditorDescription';
import Convert from '../../helpers/Convert';

class DataTableNodes extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    toggledGrid: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.func.isRequired,
    selectedNodes: PropTypes.array.isRequired,
  }

  initGridValues = memoizeOne((nodes) => {
    if (!_.isEmpty(nodes)) {
      const grid = Convert.nodeDataToGrid(nodes);
      this.setState({ grid });
    }
  }, _.isEqual)

  constructor(props) {
    super(props);
    this.state = {
      grid: []
    };
  }

  handleDataChange = (changes) => {
    const { grid } = this.state;
    changes.forEach((d) => {
      grid[d.row][d.col] = { ...grid[d.row][d.col], value: d.value };
    });
    const nodes = Convert.gridDataToNode(grid);
    Chart.render({ nodes });
  }

  renderSheet = (props) => {
    const { selectedNodes } = this.props;
    const { grid } = this.state;
    const allChecked = grid.length === selectedNodes.length;
    return (
      <table className={props.className}>
        <thead>
          <tr>
            <th className="cell index" width="60">
              <label>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={() => this.props.setGridIndexes('nodes', allChecked ? [] : grid.map((g) => g[0].value))}
                />
                All
              </label>
            </th>
            <th className="cell name" width="150"><span>Name</span></th>
            <th className="cell description" width="272">Description</th>
            <th className="cell icon" width="272">Icon</th>
            <th className="cell color" width="120">Color</th>
            <th className="cell link" width="272">Link</th>
          </tr>
        </thead>
        <tbody>
          {props.children}
        </tbody>
      </table>
    );
  }

  renderCell = (props) => {
    const { selectedNodes } = this.props;
    const {
      cell, children,
      onContextMenu, onDoubleClick, onKeyUp, onMouseOver,
    } = props;
    let { onMouseDown } = props;
    if (['description', 'files', 'links'].includes(props.cell.key)) {
      this.onMouseDown = onMouseDown;
      onMouseDown = undefined;
    }
    return (
      <td
        onContextMenu={onContextMenu}
        onDoubleClick={onDoubleClick}
        onKeyUp={onKeyUp}
        onMouseDown={onMouseDown}
        onMouseOver={onMouseOver}
        className={`cell ${cell.key || ''}`}
      >
        {cell.key === 'index' ? (
          <label>
            <input
              type="checkbox"
              checked={selectedNodes.includes(cell.value)}
              onChange={() => this.props.toggledGrid('nodes', cell.value)}
            />
            {cell.value + 1}
          </label>
        ) : children}
      </td>
    );
  }

  renderView = (props) => {
    const { cell } = props;
    const { value } = props;
    if (cell.key === 'description') {
      return (
        <span className="value-viewer" dangerouslySetInnerHTML={{ __html: value }} />
      );
    }
    return (
      <span className="value-viewer">
        {props.value}
      </span>
    );
  }

  renderDataEditor = (props) => {
    const defaultProps = {
      autoFocus: true,
      value: props.value,
      onKeyDown: props.onKeyDown,
      onChangeText: props.onChange,
    };
    if (props.cell.key === 'value') {
      defaultProps.type = 'number';
    }
    if (props.cell.key === 'link') {
      defaultProps.type = 'url';
    }
    if (props.cell.key === 'icon') {
      return (
        <FileInput {...defaultProps} onChangeFile={props.onChange} />
      );
    }
    if (props.cell.key === 'description') {
      return (
        <DataEditorDescription {...defaultProps} onClose={this.onMouseDown} />
      );
    }
    return (
      <Input {...defaultProps} />
    );
  }

  render() {
    const { grid } = this.state;
    const { nodes } = this.props;
    this.initGridValues(nodes);
    return (
      <ReactDataSheet
        className="ghGridTable ghGridTableNodes"
        data={grid || []}
        valueRenderer={(cell) => String(cell.value || '')}
        valueViewer={this.renderView}
        cellRenderer={this.renderCell}
        onCellsChanged={this.handleDataChange}
        sheetRenderer={this.renderSheet}
        dataEditor={this.renderDataEditor}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  selectedNodes: state.app.selectedGrid.nodes,
});
const mapDespatchToProps = {
  setActiveButton,
  toggledGrid,
  setGridIndexes,
};

const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(DataTableNodes);

export default Container;
