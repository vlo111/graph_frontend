import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ExportNode from './ExportNode';
import Button from '../form/Button';
import { setLoading } from '../../store/actions/app';
import Api from '../../Api';
import { ReactComponent as ExportSvg } from '../../assets/images/icons/export.svg';

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
      node, tabs, image, nodeData
    } = this.props;

    const html = this.decode(renderToString(<ExportNode
      node={node}
      tabs={tabs}
      image={image}
      nodeData={nodeData}
    />));

    await Api.download('node-info-pdf', { html, image });

    this.props.setLoading(false);
  }

  render() {
    return (
      <Button onClick={this.export}
       to="/#"
       icon={<ExportSvg />}
       >
         Export
       </Button>
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
