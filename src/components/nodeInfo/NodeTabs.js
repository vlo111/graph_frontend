import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import Tooltip from 'rc-tooltip';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import Button from '../form/Button';
import NodeTabsContent from './NodeTabsContent';
import CustomFields from '../../helpers/CustomFields';
import Editor from '../form/Editor';
import Input from '../form/Input';
import NodeTabsFormModal from './NodeTabsFormModal';
import ContextMenu from '../ContextMenu';

class NodeTabs extends Component {
  static propTypes = {
    node: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      activeTab: '',
      formModalOpen: null,
    };
  }

  setFirstTab = memoizeOne((customField) => {
    this.setState({ activeTab: Object.keys(customField)[0] });
  }, _.isEqual);

  componentDidMount() {
    ContextMenu.event.on('node.full_info', this.openFormModal);
  }

  componentWillUnmount() {
    ContextMenu.event.removeListener('node.full_info', this.openFormModal);
  }

  setActiveTab = (activeTab) => {
    this.setState({ activeTab });
  }

  openFormModal = (key) => {
    this.setState({ formModalOpen: key });
  }

  closeFormModal = () => {
    this.setState({ formModalOpen: null });
  }

  render() {
    const { activeTab, formModalOpen } = this.state;
    const { node, customFields } = this.props;
    const customField = CustomFields.get(customFields, node.type, node.name);
    const content = customField[activeTab];
    return (
      <div className="nodeTabs">
        <div className="tabs">
          {_.map(customField, (val, key) => (
            <Button
              className={activeTab === key ? 'active' : undefined}
              key={key}
              onClick={() => this.setActiveTab(key)}
            >
              <p>{key}</p>
              <sub>{_.get(customFields, [node.type, key, 'subtitle'], '')}</sub>
            </Button>
          ))}
          <Tooltip overlay="Add New Tab" placement="top">
            <Button icon="fa-plus" onClick={() => this.openFormModal('')} />
          </Tooltip>
        </div>
        {!_.isNull(formModalOpen) ? (
          <NodeTabsFormModal node={node} customField={customField} onClose={this.closeFormModal} />
        ) : null}
        <NodeTabsContent name={activeTab} content={content} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeTabs);

export default Container;
