import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Chart from '../Chart';
import ChartUtils from '../helpers/ChartUtils';
import moment from 'moment';
import { ReactComponent as EditSvg } from '../assets/images/icons/edit.svg';
import SaveGraphModal from './chart/SaveGraphModal';
import CreateGraphModal from './CreateGraphModal';
import Button from './form/Button';
import Api from '../Api';
import Input from './form/Input';

const LIMIT = 3

class GraphName extends Component {
    static propTypes = {
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

    toggleDropDown = () => {
      const { showDropDown } = this.state;
      this.setState({ showDropDown: !showDropDown });
    }
    
    graphSearch = async (e) => {
      const search = e.target.value
      this.setState({search})
      const result = await Api.getGraphsList(1, {
        onlyTitle: true,
        s: search,
        limit: search === '' ? LIMIT : undefined,
        graphName: 'true'
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

    startGraph = () => {
      window.location.href = '/graphs/create';
    }

    toggleModal = (showModal) => {
      this.setState({ showModal });
    }


    render() {
      const { showDropDown } = this.state;
      const { singleGraph } = this.props;
      const { showModal, preventReload, search, graphList } = this.state;
      return (
        <div className="GraphNames">
          <button className="dropdown-btn" onClick={this.toggleDropDown}>
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
          {showDropDown ? (
        <Outside onClick={this.toggleDropDown} exclude=".GraphNames">
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
              
                return <div>
                   <Link to={`/graphs/view/${graph.id}`}>
                     {graph.title}
                   </Link>
                  </div>
               
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
            </Outside>
            ) : null}

          </div>
       
     
      );
    }
}


const mapStateToProps = (state) => (
  {
    singleGraph: state.graphs.singleGraph,
  });


const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphName);

export default Container;
