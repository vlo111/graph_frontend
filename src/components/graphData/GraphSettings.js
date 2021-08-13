import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import memoizeOne from 'memoize-one';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';
import Outside from '../Outside';
import { ReactComponent as EditSvg } from '../../assets/images/icons/edit.svg';
import EditGraphModal from '../chart/EditGraphModal';
import SaveAsTempletModal from '../chart/SaveasTampletModal';
import CreateGraphModal from '../CreateGraphModal';
import Button from '../form/Button';
import Api from '../../Api';
import Input from '../form/Input';
import { setLoading } from '../../store/actions/app';
import { createGraphRequest } from '../../store/actions/graphs';
import { GRAPH_STATUS } from '../../data/graph';

const LIMIT = 3;
const PAGE = 1;

class GraphSettings extends Component {
    static propTypes = {
      singleGraph: PropTypes.object.isRequired,
      setLoading: PropTypes.func.isRequired,
      history: PropTypes.object.isRequired,

    }

    initValues = memoizeOne((singleGraph) => {
      const {
        title, description, status, publicState,
      } = singleGraph;

      this.setState({
        requestData: {
          title,
          description,
          publicState,
          status: status === 'template' ? 'active' : status,
        },
      });
    })

    constructor(props) {
      super(props);
      this.state = {
        showModal: false,
        showModalTemplet: false,
        search: '',
        graphList: [],
        openEdit: false,
        showDropDown: false,
        requestData: {
          title: '',
          description: '',
          status: 'active',
          publicState: false,
        },
      };
    }

    toggleDropDown = () => {
      const { showDropDown } = this.state;
      this.setState({ showDropDown: !showDropDown });
      if (!showDropDown) {
        this.graphSearch();
      }
    }

    graphSearch = async (e = null) => {
      const search = e === null ? '' : e.target.value;
      this.setState({ search });
      const result = await Api.getGraphsList(PAGE, {
        onlyTitle: true,
        s: search,
        limit: search === '' ? LIMIT : undefined,
        graphName: 'true',
      });

      const graphList = result?.data?.graphs;
      if (typeof (graphList) === 'object') {
        this.setState({ graphList });
      }
    }

    saveGraph = async (status, forceCreate) => {
      const { requestData } = this.state;

      this.props.setLoading(true);
      const labels = Chart.getLabels();
      const svg = ChartUtils.getChartSvg();
      let resGraphId;
      if (forceCreate || !graphId) {
        const { payload: { data } } = await this.props.createGraphRequest({
          ...requestData,
          status,
          svg,
        });
        resGraphId = data.graphId;
      } else {
        const { payload: { data } } = await this.props.updateGraphRequest(graphId, {
          ...requestData,
          labels,
          status,
          svg,
        });
        resGraphId = data.graphId;
      }

      if (resGraphId) {
        toast.info('Successfully saved');
        this.props.history.push('/');
      } else {
        toast.error('Something went wrong. Please try again');
      }
      this.props.setLoading(false);
    }

    handleDataSave = async () => {
      this.props.history.push('/');
    }

    startGraph = () => {
      window.location.href = '/graphs/create';
    }

    toggleModal = (showModal) => {
      this.setState({ showModal });
    }

    toggleModalTemplet = (showModalTemplet) => {
      this.setState({ showModalTemplet });
    }

    render() { 
      const { singleGraph } = this.props;
      const {showModal, showModalTemplet, search, graphList, requestData, showDropDown} = this.state;
      const nodes = Chart.getNodes();
      const isTemplate = singleGraph.status === 'template';
      const canSave = nodes.length && requestData.title;
      this.initValues(singleGraph);

      return (

        <div className="GraphNames">
          <button className="dropdown-btn" onClick={this.toggleDropDown}>
            <div className="graphNname1">

              <span title={singleGraph.title} className="graphNames">
                {singleGraph.title?.length > 11 ? `${singleGraph.title.substring(0, 11)}...` : singleGraph.title}
              </span>
              <span className="carret2">
                <i className="fa fa-sort-down" />
              </span>
            </div>
          </button>
          {showDropDown ? (
            <Outside onClick={this.toggleDropDown} exclude=".GraphNames">
              <div className="dropdown">
                <div className="graphname">
                  <span title={singleGraph.title} className="graphNames">
                    {singleGraph.title.length > 11 ? `${singleGraph.title.substring(0, 11)}...` : singleGraph.title}
                  </span>
                  <Button icon={<EditSvg />} className="EditGraph" onClick={() => this.toggleModal(true)} />
                </div>

                <div>
                  <Input
                    className="graphSearchName"
                    placeholder="Search"
                    icon="fa-search"
                    onChange={(e) => this.graphSearch(e)}
                    value={search}
                    autoComplete="off"
                  />
                </div>

                <div className="graphNameList">
                  {graphList.map((graph) => (
                    <Link to={`/graphs/view/${graph.id}`}>
                      <div title={graph.title}>
                        {graph.title.length > 11 ? `${graph.title.substring(0, 11)}...` : graph.title}
                      </div>
                    </Link>
                  ))}
                </div>

                <Button className="btn-classic" onClick={this.startGraph}>
                  New Graph
                </Button>
                {showModal ? (
                  <CreateGraphModal toggleModal={this.toggleModal} />
                ) : null}

                {false ? (
                  <Select
                    label="Status"
                    value={GRAPH_STATUS.find((o) => o.value === requestData.status)}
                    options={GRAPH_STATUS}
                    onChange={(v) => this.handleChange('status', v?.value || 'active')}
                  />
                ) : null}
                {isTemplate ? (
                  <>
                    <Button className="accent alt" onClick={() => this.saveGraph('active', true)} disabled={!canSave}>
                      Save as Graph
                    </Button>
                  </>
                ) : (
                  <Button className="btn-delete" onClick={() => this.toggleModalTemplet(true)}>
                    Save as Template
                  </Button>
                )}
              </div>
            </Outside>
          ) : null}
          {showModal ? (
            <EditGraphModal toggleModal={this.toggleModal} onSave={this.handleDataSave} />
          ) : null}
          {showModalTemplet ? (
            <SaveAsTempletModal toggleModal={this.toggleModalTemplet} onSave={this.handleDataSave} />
          ) : null}
        </div>

      );
    }
}

const mapStateToProps = (state) => (
  {
    singleGraph: state.graphs.singleGraph,
  });

const mapDispatchToProps = {
  setLoading,
  createGraphRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphSettings);

export default withRouter(Container);
