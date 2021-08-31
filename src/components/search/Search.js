import React, { Component } from "react";
import PropTypes from "prop-types";
import SearchModal from "./SearchModal";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Chart from "../../Chart";
import memoizeOne from 'memoize-one';


class Search extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    showSearch: PropTypes.bool.isRequired,
  };

  renderChart = memoizeOne((filters, customFields) => {
    if (customFields) {
      Chart.render(undefined, { filters, customFields });
    }
  })

  render() {
    const {
      filters,
      customFields,
      showSearch,
      match: {
        params: { graphId },
      },
    } = this.props;
    this.renderChart(filters, customFields);
    if (!graphId || !showSearch) {
      return null;
    }
    return <SearchModal history={this.props.history} />;
  }
}

const mapStateToProps = (state) => ({
  filters: state.app.filters,
  customFields: state.graphs.singleGraph.customFields,
  showSearch: state.app.showSearch
});

const mapDispatchToProps = {
  // setFilter,
};

const Container = connect(mapStateToProps, mapDispatchToProps)(Search);

export default withRouter(Container);
