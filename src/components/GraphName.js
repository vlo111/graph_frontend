import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setGraphNameButton } from '../store/actions/app';
import Chart from '../Chart';
import ChartUtils from '../helpers/ChartUtils';
import moment from 'moment';
import { ReactComponent as EditSvg } from '../assets/images/icons/edit.svg';
// import GraphEditModal from './chart/GraphEditModal';
// import Button from './form/Button';
import SaveGraphModal from './chart/SaveGraphModal';
import CreateGraphModal from './CreateGraphModal';
import Button from './form/Button';
import Api from '../Api';
import Input from './form/Input';

const LIMIT = 3

class GraphName extends Component {
    static propTypes = {
      showGraphNameButton: PropTypes.string.isRequired,
      setGraphNamedButton: PropTypes.func.isRequired,
      singleGraph: PropTypes.object.isRequired,
    }
    constructor(props) {
      super(props);
      this.state = {
        showModal: false,
        preventReload: false,
        search: '',
        graphList: [],
        openEdit: false
      };
    }
    
    graphSearch = async (e) => {
      const search = e.target.value
      this.setState({search})
      const result = await Api.getGraphsList(1, {
        onlyTitle: true,
        s: search,
        limit: search === '' ? LIMIT : undefined
      })
      const graphList = result?.data?.graphs
      if (graphList.length > 0) {
        this.setState({graphList})
      }
    }

    
    handleDataSave = async () => {
      // await this.setState({ preventReload: false });
      // this.props.history.push('/');
    }

    // 
      
    startGraph = () => {
      window.location.href = '/graphs/create';
      console.log(window.location.href);
    }

    // 

    toggleModal = (showModal) => {
      this.setState({ showModal });
    }

    handleClick = () => {
      const { showGraphNameButton } = this.props;
      if (showGraphNameButton !== 'show') {
        this.props.setGraphNameButton('show');
      } else this.props.setGraphNameButton('close');
    }

    orderData = (data) => data.sort((a, b) => {
      if (a.type.toUpperCase() < b.type.toUpperCase()) return -1;
      if (a.type.toUpperCase() > b.type.toUpperCase()) return 1;
      return 0;
    })

    render() {
      const { showGraphNameButton } = this.props;
      const { singleGraph } = this.props;
      const { showModal, preventReload, search, graphList } = this.state;
      console.log('graphList', graphList);
      return (
        <div className={showGraphNameButton === 'close' ? 'GraphNames' : 'GraphNames open'} onClick={this.toggleDropDown}>
          <button className="dropdown-btn" onClick={() => this.handleClick()}>
            <div className="graphNname1">
             
              <span className="graphNames">
                 {'   '}  
               {singleGraph.title}
              </span>
              <span className="carret2">
                <i class="fa fa-sort-down"></i>
              </span>
            </div> 
          </button>
       
          <div className="dropdown">
            <div className='graphname'>       
                <span className="graphNames">
                  {'   '}  
                  {singleGraph.title}
                </span>
                <Button icon={<EditSvg />} className="EditGraph" onClick={() => this.toggleModal(true)} />
               
               {showModal ? (
                  <SaveGraphModal toggleModal={this.toggleModal} onSave={this.handleDataSave} />
               ) : null}
            </div>

            <div>
              <Input    
                className="graphSearchName"             
                placeholder="Search ..."
                icon="fa-search"
                onChange={(e) => this.graphSearch(e)}
                value={search}
              />
            </div>
              <div className='graphNameList'>
              {graphList.reverse().map(graph => {
                return <p>{graph.title}</p>
              })}
              </div>
            
            <Button className="btn-classic" onClick={this.startGraph} >
                  New Graph
            </Button>
                  {showModal ? (
                     <CreateGraphModal toggleModal={this.toggleModal} />
                   ) : null}   

             <Button className="btn-delete" onClick={() => this.saveGraph('template', true)}>
                  Save as Template
              </Button>
          </div>
        </div>
     
      );
    }
}


const mapStateToProps = (state) => (
  {
    showGraphNameButton: state.app.GraphNameButton,
    singleGraph: state.graphs.singleGraph,
  });

const mapDispatchToProps = {
  setGraphNameButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphName);

export default Container;
