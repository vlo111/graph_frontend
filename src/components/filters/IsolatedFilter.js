import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Checkbox from '../form/Checkbox';
import { setFilter } from '../../store/actions/app';

class IsolatedFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
  };

  render() {
    const { filters } = this.props;
    return (
      <div className="row hideIsolated graphFilter">
        <div className="filterCheckBox">
          <Checkbox
              label="Hide isolated nodes"
              checked={filters.hideIsolated}
              onChange={() => this.props.setFilter('hideIsolated', !filters.hideIsolated)}

          />
          {/*<Checkbox*/}
          {/*  label="Hide isolated nodes"*/}
          {/*  checked={filters.hideIsolated}*/}
          {/*  // labelReverse*/}
          {/*  onChange={() => this.props.setFilter('hideIsolated', !filters.hideIsolated)}*/}
          {/*  className="graphsCheckbox"*/}
          {/*>*/}
          {/*  <span className="badge" />*/}
          {/*</Checkbox>*/}
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

const Container = connect(mapStateToProps, mapDispatchToProps)(IsolatedFilter);

export default Container;
