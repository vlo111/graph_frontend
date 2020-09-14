import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Input from '../form/Input';
import { addNodeCustomFieldKey } from '../../store/actions/graphs';
import CustomFields from "../../helpers/CustomFields";

class AddNodeCustomFields extends Component {
  static propTypes = {
    data: PropTypes.object,
    node: PropTypes.object.isRequired,
    customFields: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  static defaultProps = {
    data: {},
  }

  handleChange = (path, value) => {
    const { data } = this.props;
    _.set(data, path, value);
    this.props.onChange(data);
  }

  render() {
    const { data, node, customFields } = this.props;
    const customFieldKey = _.uniq([...CustomFields.getKeys(customFields, node.type), ...Object.keys(data)]);
    return (
      <div>
        {customFieldKey.map((key) => (
          <div key={key}>
            <Input
              label={key}
              value={data[key] || ''}
              limit={250}
              autoFocus
              onChangeText={(v) => this.handleChange(key, v)}
            />
          </div>
        ))}
        <button type="button" onClick={() => this.props.addNodeCustomFieldKey(node.type, 'Test')}>Add test Key</button>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  customFields: state.graphs.singleGraph.customFields || {},
});
const mapDispatchToProps = {
  addNodeCustomFieldKey,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddNodeCustomFields);

export default Container;
