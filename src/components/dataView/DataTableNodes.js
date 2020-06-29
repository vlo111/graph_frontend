import React, { Component } from 'react';
import ReactDataSheet from 'react-datasheet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setActiveButton, setGridIndexes, toggledGrid } from '../../store/actions/app';
import Chart from '../../Chart';
import Input from '../form/Input';
import FileInput from '../form/FileInput';
import DataEditorDescription from './DataEditorDescription';
import DataEditorFiles from './DataEditorFiles';
import DataEditorLinks from './DataEditorLinks';
import Convert from '../../helpers/Convert';
import stripHtml from "string-strip-html";
class DataTableNodes extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    toggledGrid: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.func.isRequired,
    selectedNodes: PropTypes.array.isRequired,
  }

  constructor(props) {
    super(props);
    const nodes = Chart.getNodes();
    this.state = {
      grid: Convert.nodeDataToGrid(nodes),
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


  sheetRenderer = (props) => {
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
            <th className="cell description" width="200">Description</th>
            <th className="cell icon" width="272">Icon</th>
          </tr>
        </thead>
        <tbody>
          {props.children}
        </tbody>
      </table>
    );
  }

  cellRenderer = (props) => {
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


  renderDataEditor = (props) => {
    const defaultProps = {
      autoFocus: true,
      value: props.value,
      onKeyDown: props.onKeyDown,
      onChangeText: props.onChange,
    };
    if (['value'].includes(props.cell.key)) {
      defaultProps.type = 'number';
    }
    if (props.cell.key === 'icon') {
      return (
        <FileInput {...defaultProps} onChangeFile={props.onChange} />
      );
    }
    if (props.cell.key === 'files') {
      return (
        <DataEditorFiles {...defaultProps} onClose={this.onMouseDown} />
      );
    }
    if (props.cell.key === 'links') {
      return (
        <DataEditorLinks {...defaultProps} onClose={this.onMouseDown} />
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
    return (
      <ReactDataSheet
        className="ghGridTable ghGridTableNodes"
        data={this.state.grid}
        valueRenderer={(cell) => cell.value}
        cellRenderer={this.cellRenderer}
        onCellsChanged={this.handleDataChange}
        sheetRenderer={this.sheetRenderer}
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
