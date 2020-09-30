import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Input from '../form/Input';
import Editor from '../form/Editor';
import { connect } from "react-redux";
import { addNodeCustomFieldKey, setNodeCustomField } from "../../store/actions/graphs";
import Button from "../form/Button";
import Validate from "../../helpers/Validate";
import { ReactComponent as CloseSvg } from "../../assets/images/icons/close.svg";
import memoizeOne from "memoize-one";

class NodeTabsFormModal extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    setNodeCustomField: PropTypes.func.isRequired,
    node: PropTypes.object.isRequired,
    customField: PropTypes.object.isRequired,
    addNodeCustomFieldKey: PropTypes.func.isRequired,
  }

  initValues = memoizeOne((customFields, node, fieldName) => {
    const customField = _.get(customFields, [node.type, fieldName]);
    if (customField) {
      const tabData = {
        name: fieldName,
        content: customField.values[node.name],
        subtitle: customField.subtitle,
      };
      this.setState({ tabData });
    }
  }, _.isEqual)

  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      tabData: {
        name: '',
        content: '',
        subtitle: '',
      },
    };
  }

  handleChange = (path, value) => {
    const { tabData, errors } = this.state;
    _.set(tabData, path, value);
    _.remove(errors, path);
    this.setState({ tabData, errors });
  }

  save = async () => {
    const { node, customField, customFields, fieldName } = this.props;
    const isUpdate = !!fieldName;
    const { tabData, errors } = this.state;
    const { name, subtitle, content } = tabData;

    if (!isUpdate) {
      [errors.name, tabData.name] = Validate.customFieldType(tabData.name, node.type, customFields);
    }
    [errors.content, tabData.content] = Validate.customFieldContent(tabData.content);
    [errors.subtitle, tabData.subtitle] = Validate.customFieldSubtitle(tabData.subtitle);

    if (!Validate.hasError(errors)) {
      if (!isUpdate) {
        await this.props.addNodeCustomFieldKey(node.type, name, subtitle);
      }
      customField[name] = content;
      this.props.setNodeCustomField(node.type, node.name, customField);
      this.props.onClose();
    }
    this.setState({ errors, tabData });
  }

  render() {
    const { tabData, errors } = this.state;
    const { node, customFields, fieldName } = this.props;
    this.initValues(customFields, node, fieldName);
    const isUpdate = !!fieldName;
    return (
      <Modal
        isOpen
        className="ghModal nodeTabsFormModal"
        overlayClassName="ghModalOverlay nodeTabsFormModalOverlay"
        onRequestClose={this.props.onClose}
      >
        <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.props.onClose} />
        <h3>{isUpdate ? 'Update Tab' : 'Add New Tab'}</h3>
        <div className="row">
          <Input
            value={tabData.name}
            error={errors.name}
            label="Name"
            disabled={!!fieldName}
            onChangeText={(v) => this.handleChange('name', v)}
          />
          <Input
            value={tabData.subtitle}
            error={errors.subtitle}
            label="Subtitle"
            onChangeText={(v) => this.handleChange('subtitle', v)}
          />
        </div>

        <Editor
          value={tabData.content}
          error={errors.content}
          label="ContentTabs"
          onChange={(v) => this.handleChange('content', v)}
        />
        <div className="buttonsWrapper">
          <Button color="transparent" className="cancel" onClick={this.props.onClose}>Cancel</Button>
          <Button color="accent" onClick={this.save}>
            {isUpdate ? 'Save' : 'Add'}
          </Button>
        </div>
      </Modal>
    );
  }
}


const mapStateToProps = (state) => ({
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {
  setNodeCustomField,
  addNodeCustomFieldKey,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeTabsFormModal);
export default Container;
