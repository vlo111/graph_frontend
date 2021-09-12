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
    graphInfo: PropTypes.object.isRequired,
    showSearch: PropTypes.bool.isRequired,
    exploreMode: PropTypes.bool.isRequired,
  };

  render() {
    const {
      showSearch,
      exploreMode,
      graphInfo,
      match: {
        params: { graphId },
      },
        history: {location: {pathname}}
    } = this.props;
    const nodes = Chart.getNodes()

    if(!pathname.startsWith('/graphs/view/')) {
      return <></>
    }

    if(graphId && Object.keys(graphInfo)?.length && (
      showSearch 
      || (graphInfo?.totalNodes + graphInfo?.totalLinks > 1000
        && !nodes?.length && !exploreMode)
    )) {
      if (!exploreMode) {
        Chart.render({nodes:[], links:[], labels: []}, {ignoreAutoSave: true,})
      }
      return <SearchModal history={this.props.history} />;
    }
    return <></>
  }
}

const mapStateToProps = (state) => ({
  filters: state.app.filters,
  customFields: state.graphs.singleGraph.customFields,
  graphInfo: state.graphs.graphInfo,
  showSearch: state.app.showSearch,
  exploreMode: state.app.exploreMode,
});

const mapDispatchToProps = {
  // setFilter,
};

const Container = connect(mapStateToProps, mapDispatchToProps)(Search);

export default withRouter(Container);
