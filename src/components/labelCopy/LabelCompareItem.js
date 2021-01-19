import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import Tooltip from 'rc-tooltip';
import stripHtml from 'string-strip-html';
import NodeIcon from '../NodeIcon';
import CustomFields from '../../helpers/CustomFields';

class LabelCompareItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = (ev) => {
    this.props.onChange(ev.target.checked);
  }

  render() {
    const { node, customFields, containerClassName, checked } = this.props;
    const customField = CustomFields.get(customFields, node.type, node.id);
    return (
      <>
        <input type="checkbox" checked={checked} onChange={this.handleChange} />
        <NodeIcon node={node} />
        <span className="type">{node.type}</span>
        <span className="createdAt">{moment(node.createdAt * 1000).format('DD/MM/YYYY hh:mm A')}</span>
        <div>
          {_.map(customField, (val, key) => {
            if (!val) {
              return null;
            }
            const { result: text } = stripHtml(val || '');
            return (
              <Tooltip key={key} overlay={text} placement="top">
                <span>{key}</span>
              </Tooltip>
            );
          })}
        </div>
      </>
    );
  }
}

export default LabelCompareItem;
