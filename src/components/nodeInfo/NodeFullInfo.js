import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Chart from '../../Chart';
import TextEllipsis from '../TextEllipsis';
import { toggleNodeFullInfo } from '../../store/actions/app';
import Outside from '../Outside';
import NodeTabs from './NodeTabs';
import { ReactComponent as CloseSvg } from "../../assets/images/icons/close.svg";
import Button from "../form/Button";

class NodeFullInfo extends Component {
  static propTypes = {
    infoNodeName: PropTypes.string.isRequired,
    toggleNodeFullInfo: PropTypes.func.isRequired,
  }

  closeNodeInfo = () => {
    this.props.toggleNodeFullInfo('');
  }

  render() {
    const { infoNodeName } = this.props;
    if (!infoNodeName) {
      return null;
    }
    const node = Chart.getNodes().find((n) => n.name === infoNodeName);
    if (!node) {
      return null;
    }
    return (
      <Outside onClick={this.closeNodeInfo}>
        <div id="nodeFullInfo">
          <Button className="closeInfo" color="transparent" icon={<CloseSvg width={15} />} onClick={this.closeNodeInfo} />
          <div className="mainContent">
            <h2 className="name">{node.name}</h2>
            <h3 className="type">{node.type}</h3>
            <TextEllipsis maxLength={140} className="description" more="EXPEND" less="SHOW LESS">
              {node.description}
            </TextEllipsis>
            <NodeTabs node={node} />
            <div className="collaborate">
              <h4 className="collaborateTitle">Collaborate (24)</h4>
            </div>
          </div>
        </div>
      </Outside>
    );
  }
}

const mapStateToProps = (state) => ({
  infoNodeName: state.app.infoNodeName,
});

const mapDispatchToProps = {
  toggleNodeFullInfo,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeFullInfo);

export default Container;
