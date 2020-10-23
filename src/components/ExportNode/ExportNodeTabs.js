import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { connect } from 'react-redux';
import PropTypes from 'prop-types'; 
import ExportNode from './ExportNode';
import { setLoading } from '../../store/actions/app';
import Api from '../../Api'; 

class ExportNodeTabs extends Component {
    static propTypes = {
      setLoading: PropTypes.func.isRequired,
    }

    decode = (str) => str.replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '\\"')
      .replace(/&amp;/g, '&')

    export = async () => { 
      this.props.setLoading(true);

      const {
        NodeName, NodeType, Tabs, Image,
      } = this.props;

      const html = this.decode(renderToString(<ExportNode
        NodeName={NodeName}
        NodeType={NodeType}
        Tabs={Tabs}
        ConnectionNodes={this.props.NodeData}
      />));

      await Api.download('nodePdf', { html, Image });

      this.props.setLoading(false);
    }

    render() {
      return (
        <a onClick={this.export} to="/#">Export</a>
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
)(ExportNodeTabs);

export default withRouter(Container);
