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
    exploreMode: PropTypes.bool.isRequired,
  };

  render() {
    const {
      showSearch,
      exploreMode,
      match: {
        params: { graphId },
      },
    } = this.props;
    if (!graphId || !showSearch) {
      return null;
    }
    if (showSearch === true && exploreMode === false) {
      Chart.render({nodes:[], links:[], labels: []}, {ignoreAutoSave: true,})
    }
    return <SearchModal history={this.props.history} />;
  }
}

const mapStateToProps = (state) => ({
  filters: state.app.filters,
  customFields: state.graphs.singleGraph.customFields,
  showSearch: state.app.showSearch,
  exploreMode: state.app.exploreMode,
});

const mapDispatchToProps = {
};

const Container = connect(mapStateToProps, mapDispatchToProps)(Search);

export default withRouter(Container);
