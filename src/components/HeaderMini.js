import React, { Component } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import _ from 'lodash';
import { connect } from 'react-redux'; 
import SearchInput from './search/SearchInput';
import AccountDropDown from './account/AccountDropDown'; 
import Utils from '../helpers/Utils';
import Chart from '../Chart';
import { setLoading } from '../store/actions/app';
import ExportNodeTabs from './ExportNode/ExportNodeTabs'; 

class HeaderMini extends Component {
  async componentWillMount() {
    let {
      HeaderImg, NodeName,
    } = this.props;

    const node = Chart.getNodes().find((n) => n.name === NodeName);
    if (!node) {
      return null;
    }

    const nodeData = [];

    const nodeLinks = Chart.getNodeLinks(node.name, 'all');
    const nodes = Chart.getNodes();
    const connectedNodes = nodeLinks.map(async (l) => {
      let connected;
      if (l.source === node.name) {
        connected = nodes.find((d) => d.name === l.target);
      } else {
        connected = nodes.find((d) => d.name === l.source);
      }
      connected.icon = await Utils.blobToBase64(connected.icon);

      nodeData.push({ name: connected.name, icon: connected.icon });

      this.setState({ nodeData });

      return {
        linkType: l.type,
        connected,
      };
    });

    const connectedNodesGroup = Object.values(_.groupBy(connectedNodes, 'linkType'));
    const obj = _.orderBy(connectedNodesGroup, (d) => d.length, 'desc');

    this.setState({ nodeData: obj });

    if (HeaderImg && !HeaderImg.startsWith('https://maps.googleapis.com')) {
      HeaderImg = await Utils.blobToBase64(HeaderImg);
    }
    this.setState({ image: HeaderImg });
  }

  render() {
    const { match: { params: { graphId = '', token = '' } } } = this.props;
    const isInEmbed = Utils.isInEmbed();
    return (
      <header id="headerMini">
        <SearchInput />
        <ul className="links">
          <li>
            <Link to={isInEmbed ? `/graphs/embed/filter/${graphId}/${token}` : `/graphs/filter/${graphId}`}>
              Filter
            </Link>
                      </li>
          <li>
            <ExportNodeTabs
              NodeName={this.props.NodeName}
              NodeType={this.props.NodeType}
              Tabs={this.props.Tabs}
              NodeData={this.state.nodeData}
              Image={this.state.image}
            />
          </li>
        </ul>
        {
          !isInEmbed ? (
            <AccountDropDown mini />
          ) : null
        }
      </header>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  setLoading,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(HeaderMini);

export default withRouter(Container);
