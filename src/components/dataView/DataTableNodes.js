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
import FileInput from '../form/FileInput';
import DataEditorDescription from './DataEditorDescription';
import Convert from '../../helpers/Convert';
import Select from '../form/Select';
import { NODE_TYPES } from '../../data/node';
import Validate from '../../helpers/Validate';
import ChartUtils from "../../helpers/ChartUtils";

class DataTableNodes extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    toggleGrid: PropTypes.func.isRequired,
    setGridIndexes: PropTypes.func.isRequired,
    selectedNodes: PropTypes.array.isRequired,
    nodes: PropTypes.array.isRequired,
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
    const nodesChanged = Convert.gridDataToNode(grid);
    let links = Chart.getLinks();
    const nodes = Chart.getNodes().map((d) => {
      const changed = nodesChanged.find((c) => c.index === d.index);
      if (changed) {
        links = links.map((l) => {
          if (l.source === d.name) {
            l.source = changed.name;
          } else if (l.target === d.name) {
            l.target = changed.name;
          }
          return l;
        });
        // eslint-disable-next-line no-param-reassign
        d = changed;
      }
      return d;
    });
    Chart.render({ nodes, links });
  }

  toggleGrid = async (index) => {
    await this.props.toggleGrid('nodes', index);
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
              {/*<input*/}
              {/*  type="checkbox"*/}
              {/*  checked={allChecked}*/}
              {/*  onChange={() => this.props.setGridIndexes('nodes', allChecked ? [] : grid.map((g) => g[0].value))}*/}
              {/*/>*/}
              {/*All*/}
            </label>
          </th>
          <th className="cell name" width="180"><span>Name</span></th>
          <th className="cell type" width="150"><span>Type</span></th>
          <th className="cell description" width="272"><span>Description</span></th>
          <th className="cell nodeType" width="130"><span>Node Type</span></th>
          <th className="cell icon" width="272"><span>Icon</span></th>
          <th className="cell link" width="272"><span>Link</span></th>
          <th className="cell keywords" width="272"><span>Keywords</span></th>
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
    if (['description'].includes(props.cell.key)) {
      this.onMouseDown = onMouseDown;
      onMouseDown = undefined;
    }
    if (cell.key === 'index') {
      return (
        <td className="cell index">
          <label>
            <input
              type="checkbox"
              checked={selectedNodes.includes(cell.value)}
              onChange={() => this.toggleGrid(cell.value)}
            />
            {props.row + 1}
          </label>
        </td>
      );
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
        {children}
      </td>
    );
  }

  renderView = (props) => {
    const { cell } = props;
    const { value } = props;
    if (['description'].includes(cell.key)) {
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
        <FileInput {...defaultProps} accept=".png,.jpg,.gif" onChangeFile={props.onChange} />
      );
    }
    if (props.cell.key === 'description') {
      return (
        <DataEditorDescription {...defaultProps} onClose={this.onMouseDown} />
      );
    }
    if (props.cell.key === 'nodeType') {
      return (
        <Select
          menuIsOpen
          options={NODE_TYPES}
          value={NODE_TYPES.find((t) => t.value === props.value)}
          onChange={(v) => props.onChange(v?.value || '')}
        />
      );
    }
    if (props.cell.key === 'type') {
      let types = Chart.getNodes()
        .filter((d) => d.type)
        .map((d) => ({
          value: d.type,
          label: d.type,
        }));
      types = _.uniqBy(types, 'value');
      return (
        <Select
          menuIsOpen
          isCreatable
          autoFocus
          options={types}
          value={types.find((t) => t.value === props.value)}
          onChange={(v) => props.onChange(v?.value || props.value)}
        />
      );
    }
    if (props.cell.key === 'keywords') {
      const values = _.isString(props.value) ? props.value.split(',').filter((v) => v) : props.value;
      return (
        <Select
          isCreatable
          isMulti
          value={values.map((v) => ({ value: v, label: v }))}
          menuIsOpen={false}
          placeholder=""
          onChange={(value) => props.onChange((value || []).map((v) => v.value))}
        />
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
const mapDispatchToProps = {
  setActiveButton,
  toggleGrid,
  setGridIndexes,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DataTableNodes);

export default Container;
