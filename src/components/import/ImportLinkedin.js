import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import File from '../form/File';
import Button from '../form/Button';
import { convertNodeRequest } from '../../store/actions/graphs';
import { setActiveButton, toggleNodeModal } from '../../store/actions/app';
import ChartUtils from "../../helpers/ChartUtils";
import ReactDOMServer from "react-dom/server";
import ImportLinkedinCustomField from "./ImportLinkedinCustomField";

class DataImportModal extends Component {
  static propTypes = {
    setActiveButton: PropTypes.func.isRequired,
    convertNodeRequest: PropTypes.func.isRequired,
    toggleNodeModal: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      requestData: {},
    };
  }

  handleChange = async (path, file) => {
    const { requestData } = this.state;
    _.set(requestData, path, file);
    this.setState({ requestData });
  }

  convert = async () => {
    const { requestData } = this.state;
    this.setState({ loading: true });
    const { payload: { data } } = await this.props.convertNodeRequest('linkedin-pdf', requestData);
    if (data?.status === 'ok') {
      this.props.setActiveButton('create');
    } else {
      this.toast = toast.error(data?.message || 'something went wrong');
    }
    const { node = {} } = data;
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    const { x: fx, y: fy } = ChartUtils.calcScaledPosition(x, y);
    const customField = {};

    const work = ReactDOMServer.renderToString(<ImportLinkedinCustomField type="work" data={node} />);
    if (work) {
      customField.Work = work;
    }

    const skills = ReactDOMServer.renderToString(<ImportLinkedinCustomField type="skills" data={node} />);
    if (skills) {
      customField.Skills = skills;
    }

    const education = ReactDOMServer.renderToString(<ImportLinkedinCustomField type="education" data={node} />);
    if (education) {
      customField.Education = education;
    }
    this.props.toggleNodeModal({
      fx,
      fy,
      name: node.name,
      type: node.type,
      description: node.summary,
      customField,
    });
    this.setState({ loading: false });
  }

  render() {
    const { loading } = this.state;

    return (
      <>
        <File
          onChangeFile={(file) => this.handleChange('file', file)}
          accept=".pdf"
          label="Select PDF File"
        />
        <Button onClick={this.convert} loading={loading}>Import</Button>
      </>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = {
  convertNodeRequest,
  setActiveButton,
  toggleNodeModal,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DataImportModal);

export default Container;
