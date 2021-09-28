import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import Tooltip from 'rc-tooltip';
import NodeIcon from '../NodeIcon';
import CustomFields from '../../helpers/CustomFields';
import Chart from '../../Chart';
import Checkbox from '../form/Checkbox';

class LabelCompareItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleChange = (ev) => {
    this.props.onChange(ev.target.checked);
  }

  render() {
    const { node, checked, nodes } = this.props;

    const customFields = CustomFields.getCustomField(node, nodes);

    const uniqueCheckboxId = Math.random().toString(36).substring(7);

    return (
      <>
        <div className="items">
          <div className="compareCheckBox">
            <Checkbox
              id={uniqueCheckboxId}
              onChange={this.handleChange}
              checked={checked}
            />
          </div>
          <div className="node-icon" title={node.type}>
            <NodeIcon node={node} />
          </div>
          <div>
            <div className="description">
              <span title={node.name} className="headerName">
                {node.name && node.name.length > 13
                  ? `${node.name.substr(0, 13)}... `
                  : node.name}
              </span>
              {node.createdAt ? (
                <span className="createdAt">{moment(node.createdAt * 1000).format('DD/MM/YYYY hh:mm A')}</span>
              ) : null}
            </div>
            <div className="tab">
              {_.map(customFields.filter((p) => p.name !== '_description'), (val, key) => (
                <Tooltip key={val.name} overlay={val.name} placement="top">
                  <span>
                    {val.name && val.name.length > 10
                      ? `${val.name.substr(0, 10)}... `
                      : val.name}
                  </span>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default LabelCompareItem;
