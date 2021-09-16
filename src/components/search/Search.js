import React, { Component } from "react";
import PropTypes from "prop-types";
import SearchModal from "./SearchModal";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Chart from "../../Chart";

const  { REACT_APP_MAX_NODE_AND_LINK } = process.env

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
      history: {location: {pathname}}
    } = this.props;
    const nodes = Chart.getNodes()

    if(!pathname.startsWith('/graphs/view/')) {
      return <></>
    }
    return <SearchModal history={this.props.history} />;
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
};

const Container = connect(mapStateToProps, mapDispatchToProps)(Search);

export default withRouter(Container);
