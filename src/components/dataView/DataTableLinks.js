import React, { Component } from 'react';
import ReactDataSheet from 'react-datasheet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setActiveButton, setGridIndexes, toggledGrid } from '../../store/actions/app';
import Chart from '../../Chart';
import Input from '../form/Input';
import Select from '../form/Select';
import Convert from '../../helpers/Convert';

class DataTableLinks extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.array.isRequired,
    selectedLinks: PropTypes.array.isRequired,
    links: PropTypes.array.isRequired,
    toggledGrid: PropTypes.func.isRequired,
  }

  initGridValues = memoizeOne((links) => {
    if (!_.isEmpty(links)) {
      const grid = Convert.linkDataToGrid(links);
      this.setState({ grid });
    }
  }, _.isEqual)

  constructor(props) {
    super(props);
    this.state = {
      grid: [],
    };
  }

  handleDataChange = (changes) => {
    const { grid } = this.state;
    changes.forEach((d) => {
      grid[d.row][d.col] = { ...grid[d.row][d.col], value: d.value };
    });
    this.setState({ grid });
    const linksChanged = Convert.gridDataToLink(grid);
    const links = _.uniqBy([...linksChanged, ...Chart.getLinks()], 'index');
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
            {props.row + 1}
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
    const { grid } = this.state;
    const { links } = this.props;
    this.initGridValues(links);
    return (
      <ReactDataSheet
        className="ghGridTable ghGridTableLinks"
        data={grid}
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
