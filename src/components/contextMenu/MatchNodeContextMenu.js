import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getSingleGraphRequest } from '../../store/actions/graphs'; 
import Button from '../form/Button';
import Icon from '../form/Icon';
import Chart from '../../Chart'; 
import Zoom from '../Zoom'; 
import ChartUtils from '../../helpers/ChartUtils';
import { ReactComponent as MachSvg } from '../../assets/images/icons/nodes.svg';
import { ReactComponent as EyeBallSvg } from '../../assets/images/icons/eye-ball.svg';
import { ReactComponent as LinksSvg } from '../../assets/images/icons/link.svg';
class MatchNodeContextMenu extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    getSingleGraphRequest: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      mathNodes: [], 
      math: '', 
      hiddenData: 1
    };
  }
  hideData = (all = false) => {
    const { params:{id } } = this.props; 
    const node = all ?  Chart.getNodes().find((d) => d.id === id): true;   
    if (!node) return null;
    const nodes = all ? Chart.getNodes().filter((d) => d.id === id ) : []
    const links = [];
    const labels = [];
    // Hide data 
    // let nodes = Chart.getNodes();
    // let links = Chart.getLinks();
    // let label = Chart.getLabels();
    // nodes = nodes.map((d) => { 
    //   d.hidden = d.id !== id ? 1 : 0;  
    //   links = links.map((l) => {
    //     l.hidden = l.hidden || (nodes.some((n) => n.hidden !== 0 && (l.target === d.id || l.source === d.id)) ? 1 : 0);
    //     return l;
    //   });
    //   return d;    
    // });
    // label = label.map((d) => { d.hidden = -1;  return d;}) 
    Chart.render({nodes, links, labels}, { ignoreAutoSave: true }); 

  }
  mathType = ( type = '' ) => { 
    const { params:{ id }, nodesPartial, linksPartial } = this.props;
    let chartNodes = Chart.getNodes();
    let chartLinks = Chart.getLinks();
    const labels = [];
    const node = nodesPartial && nodesPartial.find((d) => type ? d.type === type : true); 
    const checkNode = Chart.getNodes().find((d) => d.id === id);; 
    if (!node || !checkNode) return null; 
   
    let nodes = nodesPartial.filter((d) =>   
           ((type ? d.type === type : true   ) &&
           d.keywords.length > 0 && checkNode.keywords.length > 0 && (d.keywords.some((n) =>  checkNode.keywords.includes(n)))
           
           ) ||
          chartNodes && chartNodes.some((n) => n.id === d.id) 
    );  
 
    // let links = linksPartial.filter((l) => 
    //     (nodesPartial && nodesPartial.some((n) => 
            
    //   ( (type ? n.type === type : true) ||
    //    chartNodes && chartNodes.some((d) => n.id === d.id) )
    //    &&
        
    //     (l.target === n.id || l.source === n.id)))
    //     ||
    //       chartLinks && chartLinks.some((n) => n.id === l.id) 
    //   );

    let links = ChartUtils.cleanLinks(linksPartial, nodes); 
    Chart.render({nodes, links, labels}, { ignoreAutoSave: true, isAutoPosition: true});  
    ChartUtils.autoScaleTimeOut();
    ChartUtils.autoScaleTimeOut(100);
    ChartUtils.autoScaleTimeOut(200);
    Chart.event.emit('expandData', type);
    ChartUtils.startAutoPosition() 
  }
  render() { 
    const { params:{ id }, nodesPartial } = this.props;
    let { match,  mathNodes, hiddenData } = this.state;
    mathNodes = ChartUtils.getMathNodeGroupedByNodeId(nodesPartial, id, true , hiddenData);
    match = ChartUtils.getMathNodeGroupedByNodeId(nodesPartial, id, false, hiddenData);   
    console.log(match, match);
    return (
      <> 
        <div className="ghButton notClose">       
         <Icon value={<MachSvg />} />
           Match 
          <Icon className="arrow" value="fa-angle-right" /> 
          <div className="contextmenu">
          <Button onClick={() => this.mathType()}>{`All [${match}]`}</Button> 
          <div className="border-bottom "></div>
            {_.map(mathNodes, (n, type) => ( 
                <Button onClick={() => this.mathType(type)} key={n}>
                  <span className='connections'>
                  <span className='node-item'>
                    <span className="indicator" style={{ backgroundColor: ChartUtils.getLinkColorByType(nodesPartial, type) }}/>  
                    {type} {`[${n.length}]`}  
                  </span>
                  </span>
               </Button> 
              ))} 
          </div>
      </div> 
      </>
    );
  }
}
const mapStateToProps = (state) => ({ 
  nodesPartial: state.graphs.singleGraph?.nodesPartial || [],
  linksPartial: state.graphs.singleGraph?.linksPartial || [],
});

const mapDispatchToProps = { 
  getSingleGraphRequest
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MatchNodeContextMenu);

export default Container;