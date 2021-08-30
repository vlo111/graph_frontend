import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import PropTypes from 'prop-types'; 
import { getGraphInfoRequest } from '../store/actions/graphs';


class ToolBarFooter extends Component {
  static propTypes = {
    getGraphInfoRequest: PropTypes.func.isRequired,
    graphId: PropTypes.number.isRequired,
    graphInfo: PropTypes.object.isRequired,
  };   

  render() {
    const { graphInfo } = this.props;; 
    return (
      <>
        <footer id="graphs-data-info">
          
            <div className="nodesMode">
              <span>
                {`Nodes (${graphInfo.totalNodes || 0})`}
              </span>
            </div>
            <div className="linksMode">
              <span>
                {`Links (${graphInfo.totalLinks || 0})`}
              </span>
            </div>
            <div className="labelsMode">
              <span>
                {`Labels (${graphInfo.totalLabels || 0})`}
              </span>
            </div> 
        </footer> 
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  graphInfo: state.graphs.graphInfo, 
  graphId: state.graphs.singleGraph.id,
});
const mapDispatchToProps = {
  getGraphInfoRequest
};
const Container = connect(mapStateToProps, mapDispatchToProps)(ToolBarFooter);

export default withRouter(Container);
