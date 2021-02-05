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
    const { node, customFields, checked } = this.props;

    const customField = CustomFields.get(customFields, node.type, node.id);

    const uniqueCheckboxId = Math.random().toString(36).substring(7);

    return (
      <>
        <div className="compareCheckBox">
          <input
            onChange={this.handleChange}
            checked={checked}
            className="graphsCheckbox"
            type="checkbox"
            name="layout"
            id={uniqueCheckboxId}
          />
          <label className="pull-left" htmlFor={uniqueCheckboxId} />
        </div>

        <NodeIcon node={node} />
        <div className="row">
          <div className="description">
            <span className="headerName">{node.name}</span>
            {node.createdAt ? (
              <span className="createdAt">{moment(node.createdAt * 1000).format('DD/MM/YYYY hh:mm A')}</span>
            ) : null}
            {/* {(node.attachedFiles && node.attachedFiles.length) ? ( */}
            {/*  <span className="createdAt"> */}
            {/*    { node.attachedFiles } */}
            {/*    {' '} */}
            {/*    attached files */}
            {/*  </span> */}
            {/* ) */}
            {/*  : <span className="createdAt"> 0 </span>} */}
          </div>
          <div className="tabs">
            {_.map(customField, (val, key) => (
              <Tooltip key={key} overlay={key} placement="top">
                <span>
                  {key && key.length > 10
                    ? `${key.substr(0, 10)}... `
                    : key}
                </span>
              </Tooltip>
            ))}
          </div>
        </div>
      </>
    );
  }
}

export default LabelCompareItem;
