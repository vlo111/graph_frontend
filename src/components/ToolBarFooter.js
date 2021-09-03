import React, { Component  } from 'react'; 
import { connect } from 'react-redux'; 
import PropTypes from 'prop-types'; 
import { getGraphInfoRequest } from '../store/actions/graphs'; 
import { setActiveButton } from '../store/actions/app'; 
import Chart from '../Chart';  
import Button from './form/Button';  

class ToolBarFooter extends Component {
  static propTypes = {
    getGraphInfoRequest: PropTypes.func.isRequired, 
    graphInfo: PropTypes.object.isRequired,
    setActiveButton: PropTypes.func.isRequired,
  };  

  constructor(props) {
    super(props);
    this.state = {
      totalNodes: 0,
      totalLinks: 0,
      totalLabels: 0,
    };
  } 
  componentDidMount() { 
    Chart.event.on('expandData', this.expandData); 
  }

  componentWillUnmount() { 
    Chart.event.on('expandData', this.expandData); 
  }
  expandData = (ev) => {  
   let nodes = Chart.getNodes(true);
   let links = Chart.getLinks(true);
   let labels = Chart.getLabels(); 
    this.setState({
        totalNodes: nodes?.length, 
        totalLinks: links?.length, 
        totalLabels: labels?.length
      }); 
  }
  handleClick = (activeButton) => {
    this.props.setActiveButton(activeButton); 
  }
  render() {
    const {totalNodes, totalLinks, totalLabels } = this.state; 
    const { graphInfo, partOf } = this.props; 
    const showInMap = Chart.getNodes().some((d) => d.location); 
    return (
      <>
        <footer id="graphs-data-info"> 
        {showInMap ? (         
            <div className="mapMode">          
              <Button
                icon="fa-globe"
                onClick={(ev) => this.handleClick('maps-view')}
                className='bg-transparent'
              >
                Show on map
              </Button>              
            </div>
            ) : null}
            <div className="nodesMode">
              <span>
                {partOf ? `Nodes (${totalNodes} of ${graphInfo.totalNodes}) ` :  `Nodes (${graphInfo.totalNodes || 0 })`} 
              </span>
            </div>
            <div className="linksMode">
              <span>
                {partOf ? `Links (${totalLinks} of ${graphInfo.totalLinks}) ` :  `Links (${graphInfo.totalLinks || 0 })`} 
              </span>
            </div>
            <div className="labelsMode">
              <span>
              {partOf ? `Labels (${totalLabels} of ${graphInfo.totalLabels}) ` :  `Labels (${graphInfo.totalLabels || 0 })`}  
              </span>
            </div> 
        </footer> 
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  graphInfo: state.graphs.graphInfo,  
});

const mapDispatchToProps = {
  getGraphInfoRequest, 
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToolBarFooter);

export default Container;
 
