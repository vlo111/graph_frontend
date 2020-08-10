import React, { Component } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '../form/Button';
import Chart from '../../Chart';
import NodesFilter from './NodeTypesFilter';
import IsolatedFilter from './IsolatedFilter';
import { resetFilter } from '../../store/actions/app';
import LinkTypesFilter from './LinkTypesFilter';
import LinkValueFilter from './LinkValueFilter';

class FiltersModal extends Component {
  static propTypes = {
    resetFilter: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    const nodes = Chart.getNodes();
    const links = Chart.getLinks();
    this.state = {
      nodes,
      links,
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
    this.setState({ nodes, links });
  }

  render() {
    const { nodes, links } = this.state;
    return (
      <Modal
        className="ghModal ghModalFilters"
        overlayClassName="ghModalOverlay ghModalFiltersOverlay"
        isOpen
      >
        <div className="row resetAll">
          <Button transparent onClick={this.props.resetFilter}>RESET ALL</Button>
          {`Showing ${nodes.filter((d) => !d.hidden).length} nodes out of ${nodes.length}`}
        </div>

        <IsolatedFilter />

        <NodesFilter nodes={nodes} />

        <LinkTypesFilter links={links} />

        <LinkValueFilter links={links} />

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

export default Container;
