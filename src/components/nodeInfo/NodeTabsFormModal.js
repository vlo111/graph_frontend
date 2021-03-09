import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import Input from '../form/Input';
import Editor from '../form/Editor';
import Button from '../form/Button';
import Validate from '../../helpers/Validate';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Chart from '../../Chart';

class NodeTabsFormModal extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    node: PropTypes.object.isRequired,
  }

  initValues = memoizeOne((node, fieldName) => {
    const customField = node.customFields.find((f) => f.name === fieldName);
    if (customField) {
      const tabData = {
        name: fieldName,
        originalName: fieldName,
        value: customField.value,
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
        value: '',
        subtitle: '',
        documents: [],
      },
    };
  }

  handleChange = (path, value) => {
    value = value.replace(/href/g, 'target="_blank" href');
    const { tabData, errors } = this.state;
    _.set(tabData, path, value);
    _.remove(errors, path);
    this.setState({ tabData, errors });
  }

  media = (data) => {
    const { tabData } = this.state;
    data.nodeId = this.props.node.id;
    data.nodeType = this.props.node.type;
    data.file = {
      data: data.file[0].preview,
      type: data.file[0].type,
      name: !data.file[0].type.includes('image') ? data.file[0].name : '',
    };

    _.set(tabData, 'documents', tabData.documents ? [...tabData.documents, data] : [data]);
    this.setState({ tabData });
  }

  save = async () => {
    const { node, fieldName } = this.props;
    const isUpdate = !!fieldName;
    const { tabData, errors } = this.state;

    if (!isUpdate || (tabData.originalName !== tabData.name)) {
      [errors.name, tabData.name] = Validate.customFieldType(tabData.name, node);
    }
    // return;
    [errors.value, tabData.value] = Validate.customFieldContent(tabData.value);
    [errors.subtitle, tabData.subtitle] = Validate.customFieldSubtitle(tabData.subtitle);

    if (!Validate.hasError(errors)) {
      const { customFields } = node;
      const data = {
        name: tabData.name,
        value: tabData.value,
        subtitle: tabData.subtitle,
      };
      if (!isUpdate) {
        customFields.push(data);
      } else {
        const i = customFields.findIndex((f) => f.name === tabData.originalName);
        if (i > -1) {
          customFields[i] = data;
        }
      }
      Chart.setNodeData(node.id, { customFields });
      this.props.onClose(data);
    }
    this.setState({ errors, tabData });
  }

  render() {
    const { tabData, errors } = this.state;
    const { node, fieldName } = this.props;
    this.initValues(node, fieldName);
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
            onChangeText={(v) => this.handleChange('name', v)}
          />
          {/* <Input
            value={tabData.subtitle}
            error={errors.subtitle}
            label="Subtitle"
            onChangeText={(v) => this.handleChange('subtitle', v)}
          /> */}
        </div>

        <Editor
          value={tabData.value}
          media={this.media}
          error={errors.value}
          label="ContentTabs"
          onChange={(v) => this.handleChange('value', v)}
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
  currentUserId: state.account.myAccount.id,
});

const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeTabsFormModal);
export default Container;
