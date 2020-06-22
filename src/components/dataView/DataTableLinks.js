import React, { Component } from 'react';
import ReactDataSheet from 'react-datasheet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setActiveButton, setGridIndexes, toggledGrid } from '../../store/actions/app';
import Chart from '../../Chart';
import Input from '../form/Input';
import Select from '../form/Select';
import Convert from '../../helpers/Convert';

class DataTableLinks extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    onChangeSelect: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.array.isRequired,
    selectedLinks: PropTypes.array.isRequired,
    toggledGrid: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    const links = Chart.getLinks();
    this.state = {
      grid: Convert.linkDataToGrid(links),
    };
  }


  handleDataChange = (changes) => {
    const { grid } = this.state;
    changes.forEach((d) => {
      grid[d.row][d.col] = { ...grid[d.row][d.col], value: d.value };
    });
    this.setState({ grid });
    const links = Convert.gridDataToLink(grid);
    Chart.render({ links });
  }

  sheetRenderer = (props) => {
    const { grid } = this.state;
    const { selectedLinks } = this.props;
    const allChecked = grid.length === selectedLinks.length;
    return (
      <table className={props.className}>
        <thead>
          <tr>
            <th className="cell index" width="60">
              <label>
                <input
                  type="checkbox"
                  checked={grid.length === selectedLinks.length}
                  onChange={() => this.props.setGridIndexes('links', allChecked ? [] : grid.map((g) => g[0].value))}
                />
                All
              </label>
            </th>
            <th className="cell source" width="150">Source</th>
            <th className="cell target" width="150">Target</th>
            <th className="cell value" width="100">Value</th>
          </tr>
        </thead>
        <tbody>
          {props.children}
        </tbody>
      </table>
    );
  }

  cellRenderer = (props) => {
    const { selectedLinks } = this.props;
    const {
      cell, children, ...p
    } = props;
    return (
      <td {...p} className={`cell ${cell.key || ''}`}>
        {cell.key === 'index' ? (
          <label>
            <input
              type="checkbox"
              checked={selectedLinks.includes(cell.value)}
              onChange={() => this.props.toggledGrid('links', cell.value)}
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
    if (['source', 'target'].includes(props.cell.key)) {
      const nodes = Chart.getNodes();
      return (
        <Select
          {...defaultProps}
          options={nodes}
          isSearchable={false}
          value={nodes.find((d) => d.name === props.value)}
          getOptionLabel={(d) => d.name}
          getOptionValue={(d) => d.name}
          onChange={(v) => v && props.onChange(v.name)}
        />
      );
    }
    return (
      <Input {...defaultProps} />
    );
  }

  render() {
    return (
      <ReactDataSheet
        className="ghGridTable ghGridTableLinks"
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
  selectedLinks: state.app.selectedGrid.links,
});
const mapDespatchToProps = {
  setActiveButton,
  toggledGrid,
  setGridIndexes,
};

const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(DataTableLinks);

export default Container;
