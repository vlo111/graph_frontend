import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { connect } from 'react-redux';
import FiltersModal from './FiltersModal';
import Chart from '../../Chart';
import { setFilter } from '../../store/actions/app';

class Filters extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    filters: PropTypes.object.isRequired,
  }

  renderChart = memoizeOne((filters) => {
    Chart.render(undefined, { filters });
  })

  render() {
    const { filters, match: { params: { graphId } }, location: { pathname } } = this.props;
    const show = pathname.startsWith('/graphs/filter/');
    const replace = pathname.startsWith('/graphs/view/') || pathname.startsWith('/graphs/filter/');
    this.renderChart(filters);
    if (!graphId) {
      return null;
    }
    return (
      <>
        {show ? (
          <Link to={`/graphs/view/${graphId}`} replace={replace} className="toggleFilter">filters</Link>
        ) : (
          <Link to={`/graphs/filter/${graphId}`} replace className="toggleFilter">filters</Link>
        )}
        {show ? <FiltersModal /> : null}
      </>
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
)(Filters);

export default withRouter(Container);
