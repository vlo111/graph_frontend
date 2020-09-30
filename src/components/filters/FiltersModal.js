import React, { Component } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import Button from '../form/Button';
import Chart from '../../Chart';
import NodesFilter from './NodeTypesFilter';
import IsolatedFilter from './IsolatedFilter';
import { resetFilter } from '../../store/actions/app';
import LinkTypesFilter from './LinkTypesFilter';
import LinkValueFilter from './LinkValueFilter';
import NodeConnectionFilter from './NodeConnectionFilter';
import { ReactComponent as CloseIcon } from '../../assets/images/icons/close.svg';
import KeywordsFilter from './KeywordsFilter';
import LabelsFilter from './LabelsFilter';

class FiltersModal extends Component {
  static propTypes = {
    resetFilter: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    const nodes = Chart.getNodes();
    const links = Chart.getLinks();
    const labels = Chart.getLabels();
    this.state = {
      nodes,
      links,
      labels,
    };
  }

  componentDidMount() {
    Chart.event.on('render', this.handleChartRender);
  }

  componentWillUnmount() {
    Chart.event.removeListener('render', this.handleChartRender);
  }

  handleChartRender = () => {
    const nodes = Chart.getNodes();
    const links = Chart.getLinks();
    const labels = Chart.getLabels();
    this.setState({ nodes, links, labels });
  }

  render() {
    const { nodes, links, labels } = this.state;
    const { match: { params: { graphId = '' } } } = this.props;
    return (
      <Modal
        className="ghModal ghModalFilters"
        overlayClassName="ghModalOverlay ghModalFiltersOverlay"
        isOpen
      >
        <Link to={`/graphs/update/${graphId}`} replace>
          <Button className="close" icon={<CloseIcon />} onClick={this.closeFilter} />
        </Link>
        <div className="row resetAll">
          <Button onClick={this.props.resetFilter}>RESET ALL</Button>
          {`Showing ${nodes.filter((d) => !d.hidden).length} nodes out of ${nodes.length}`}
        </div>

        <IsolatedFilter />

        <NodesFilter nodes={nodes} />

        <LinkTypesFilter links={links} />

        <LabelsFilter labels={labels} nodes={nodes} />

        <LinkValueFilter links={links} />

        <NodeConnectionFilter links={links} nodes={nodes} />

        <KeywordsFilter nodes={nodes} />
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
});

const mapDispatchToProps = {
  resetFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FiltersModal);

export default withRouter(Container);
