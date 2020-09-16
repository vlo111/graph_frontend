import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Input from '../form/Input';
import Editor from '../form/Editor';
import { connect } from "react-redux";
import { addNodeCustomFieldKey, setNodeCustomField } from "../../store/actions/graphs";
import Button from "../form/Button";

class NodeTabsFormModal extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    setNodeCustomField: PropTypes.func.isRequired,
    node: PropTypes.object.isRequired,
    customField: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      tabData: {
        name: '',
        content: '',
        subtitle: '',
      },
    };
  }

  handleChange = (path, value) => {
    const { tabData } = this.state;
    _.set(tabData, path, value);
    this.setState({ tabData });
  }

  save = () => {
    const { node, customField } = this.props;
    const { tabData } = this.state;
    const { name, subtitle, content } = tabData;
    if (name.trim() && content.trim()) {
      this.props.addNodeCustomFieldKey(node.type, name, subtitle);
      customField[name] = content;
      this.props.setNodeCustomField(node.type, node.name, customField);
      this.props.onClose();
    }
  }

  render() {
    const { tabData } = this.state;
    return (
      <Modal
        isOpen
        className="ghModal ghTableModal"
        overlayClassName="ghModalOverlay nodeTabsFormModal"
        onRequestClose={this.props.onClose}
      >
        <Input
          value={tabData.name}
          label="Name"
          onChangeText={(v) => this.handleChange('name', v)}
        />
        <Input
          value={tabData.subtitle}
          label="Subtitle"
          onChangeText={(v) => this.handleChange('subtitle', v)}
        />
        <Editor
          value={tabData.text}
          buttons={['bold', 'italic']}
          onChange={(v) => this.handleChange('content', v)}
        />
        <Button onClick={this.save}>Save</Button>
      </Modal>
    );
  }
}


const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  setNodeCustomField,
  addNodeCustomFieldKey,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeTabsFormModal);
export default Container;
