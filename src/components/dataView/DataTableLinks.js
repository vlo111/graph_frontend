import React, { Component } from 'react';
import ReactDataSheet from 'react-datasheet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { toast } from 'react-toastify';
import { setActiveButton, setGridIndexes, toggleGrid } from '../../store/actions/app';
import Chart from '../../Chart';
import Input from '../form/Input';
import Select from '../form/Select';
import Convert from '../../helpers/Convert';
import { DASH_TYPES } from '../../data/link';
import SvgLine from '../SvgLine';
import Validate from '../../helpers/Validate';

class DataTableLinks extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    setActiveButton: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.array.isRequired,
    selectedLinks: PropTypes.array.isRequired,
    links: PropTypes.array.isRequired,
    toggleGrid: PropTypes.func.isRequired,
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
      const [error, value] = Validate.link(d.cell.key, d.value);
      if (error) {
        toast.error(error);
      }
      grid[d.row][d.col] = { ...grid[d.row][d.col], value };
    });
    this.setState({ grid });
    const linksChanged = Convert.gridDataToLink(grid);
    const links = Chart.getLinks().map((d) => {
      const changed = linksChanged.find((c) => c.index === d.index);
      if (changed) {
        // eslint-disable-next-line no-param-reassign
        d = changed;
      }
      return d;
    });

    Chart.render({ links });
  }

  sheetRenderer = (props) => {
    // const { grid } = this.state;
    // const { selectedLinks } = this.props;
    // const allChecked = grid.length === selectedLinks.length;
    return (
      <table className={props.className}>
        <thead>
          <tr>
            <th className="cell index" width="60">
              <label>
                {/*<input*/}
                {/*  type="checkbox"*/}
                {/*  checked={grid.length === selectedLinks.length}*/}
                {/*  onChange={() => this.props.setGridIndexes('links', allChecked ? [] : grid.map((g) => g[0].value))}*/}
                {/*/>*/}
                {/*All*/}
              </label>
            </th>
            <th className="cell type" width="150"><span>Type</span></th>
            <th className="cell source" width="150"><span>Source</span></th>
            <th className="cell target" width="150"><span>Target</span></th>
            <th className="cell value" width="50"><span>Value</span></th>
            <th className="cell linkType" width="100"><span>Link Type</span></th>
            <th className="cell direction" width="90"><span>Direction</span></th>
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
    if (cell.key === 'index') {
      return (
        <td className="cell index">
          <label>
            <input
              type="checkbox"
              checked={selectedLinks.includes(cell.value)}
              onChange={() => this.props.toggleGrid('links', cell.value)}
            />
            {props.row + 1}
          </label>
        </td>
      );
    }
    return (
      <td {...p} className={`cell ${cell.key || ''}`}>
        {children}
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
          menuIsOpen
          value={nodes.find((d) => d.name === props.value)}
          getOptionLabel={(d) => d.name}
          getOptionValue={(d) => d.name}
          onChange={(v) => v && props.onChange(v.name)}
        />
      );
    }
    if (props.cell.key === 'linkType') {
      return (
        <Select
          {...defaultProps}
          value={[props.value]}
          menuIsOpen
          onChange={(v) => props.onChange(v)}
          options={Object.keys(DASH_TYPES)}
          containerClassName="lineTypeSelect"
          getOptionValue={(v) => v}
          getOptionLabel={(v) => <SvgLine type={v} />}
        />
      );
    }
    if (props.cell.key === 'direction') {
      return (
        <Select
          {...defaultProps}
          value={[props.value]}
          menuIsOpen
          placeholder="No"
          onChange={(v) => props.onChange(v)}
          options={[false, true]}
          containerClassName="lineDirectionSelect"
          getOptionValue={(v) => v}
          getOptionLabel={(v) => (v ? 'Yes' : 'No')}
        />
      );
    }
    if (props.cell.key === 'value') {
      defaultProps.type = 'number';
      defaultProps.min = '1';
    }
    return (
      <Input {...defaultProps} />
    );
  }

  renderValueViewer = (props) => {
    if (props.cell.key === 'linkType') {
      return (
        <span className="value-viewer">
          <SvgLine type={props.value} />
        </span>
      );
    }
    if (props.cell.key === 'direction') {
      return (
        <span className="value-viewer">
          {props.value ? 'Yes' : 'No'}
        </span>
      );
    }
    return (
      <span className="value-viewer">
        {props.value}
      </span>
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
        valueViewer={this.renderValueViewer}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  activeButton: state.app.activeButton,
  selectedLinks: state.app.selectedGrid.links,
});
const mapDispatchToProps = {
  setActiveButton,
  toggleGrid,
  setGridIndexes,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DataTableLinks);

export default Container;
