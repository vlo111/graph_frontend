import React, { Component } from 'react';
import Modal from 'react-modal';
import _ from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import memoizeOne from 'memoize-one';
import Input from '../form/Input';
import Editor from '../form/Editor';
import { addNodeCustomFieldKey, renameNodeCustomFieldKey, setNodeCustomField } from '../../store/actions/graphs';
import Button from '../form/Button';
import Validate from '../../helpers/Validate';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Chart from '../../Chart';

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
        originalName: fieldName,
        content: customField.values[node.id],
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
        documents: [],
      },
    };
  }

  handleChange = (path, value) => {
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
    const {
      node, customField, customFields, fieldName, currentUserId,
    } = this.props;
    const isUpdate = !!fieldName;
    const { tabData, errors } = this.state;


    tabData.documents = tabData.documents?.sort((x, y) => {
      const first = x.file.type.includes('image');
      const second = y.file.type.includes('image');
      return (first === second) ? 0 : first ? -1 : 1;
    });

    if (!isUpdate || (tabData.originalName !== tabData.name)) {
      [errors.name, tabData.name] = Validate.customFieldType(tabData.name, node.type, customFields);
    }
    [errors.content, tabData.content] = Validate.customFieldContent(tabData.content);
    //[errors.subtitle, tabData.subtitle] = Validate.customFieldSubtitle(tabData.subtitle);

    if (!Validate.hasError(errors)) {
      if (!isUpdate) {
        await this.props.addNodeCustomFieldKey(node.type, tabData.name, tabData.subtitle);
      }
      customField[tabData.name] = tabData.content;
      if (tabData.originalName !== tabData.name) {
        delete customField[tabData.originalName];
        await this.props.renameNodeCustomFieldKey(node.type, tabData.originalName, tabData.name);
      }
      this.props.setNodeCustomField(node.type, node.id, customField, tabData);
      Chart.setNodeData(node.id, {
        updatedAt: moment().unix(),
        updatedUser: currentUserId,
      });
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
          value={tabData.content}
          media={this.media}
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
  currentUserId: state.account.myAccount.id,
});

const mapDispatchToProps = {
  setNodeCustomField,
  addNodeCustomFieldKey,
  renameNodeCustomFieldKey,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(NodeTabsFormModal);
export default Container;
