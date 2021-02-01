import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Checkbox from '../form/Checkbox';
import { setFilter } from '../../store/actions/app';

class IsolatedFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
  }

  render() {
    const { filters } = this.props;
    return (
      <div className="row hideIsolated graphFilter">
        <div>
          <input
            onChange={() => this.props.setFilter('hideIsolated', !filters.hideIsolated)}
            checked={filters.hideIsolated}
            className="graphsCheckbox"
            type="checkbox"
            name="layout"
            id="isolated"
          />
          <label className="pull-left" htmlFor="isolated">Hide isolated nodes</label>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  filters: state.app.filters,
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(IsolatedFilter);

export default Container;
