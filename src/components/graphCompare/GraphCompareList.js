import React, { Component } from 'react';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { List } from 'react-virtualized';
import LabelCompareItem from '../labelCopy/LabelCompareItem';
import Icon from '../form/Icon';

class GraphCompareList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: !props.dropdown,
    };
  }

  getSelectedTotal = memoizeOne((selected, singleGraph1, singleGraph2) => {
    const totalSelected = _.intersectionBy(selected, [...singleGraph1?.nodes || [], ...singleGraph2?.nodes || []], 'id').length;
    return totalSelected;
  })

  getTotal = memoizeOne((singleGraph1, singleGraph2) => {
    const total = (singleGraph1?.nodes?.length || 0) + (singleGraph2?.nodes?.length || 0);
    return total;
  })

  toggleDropdown = () => {
    const { show } = this.state;
    this.setState({ show: !show });
  }

  toggleAll = (checked) => {
    const { singleGraph1, singleGraph2, selected } = this.props;
    (singleGraph1?.nodes || []).forEach((n) => {
      this.props.onChange(n, checked, 1);
    });
    (singleGraph2?.nodes || []).forEach((n) => {
      this.props.onChange(n, checked, 2);
    });
  }

  render() {
    const { show } = this.state;
    const {
      singleGraph1, singleGraph2, dropdown, title, selected, scrollContainer,
    } = this.props;
    if (_.isEmpty(singleGraph1?.nodes) && _.isEmpty(singleGraph2?.nodes)) {
      return null;
    }
    const total = this.getTotal(singleGraph1, singleGraph2);
    const totalSelected = this.getSelectedTotal(selected, singleGraph1, singleGraph2);
    return (
      <div className="compareList">
        <div className="title">
          {title}
          <input
            type="checkbox"
            checked={totalSelected === total}
            onChange={() => this.toggleAll(totalSelected !== total)}
          />
          {dropdown ? (
            <Icon onClick={this.toggleDropdown} value={show ? 'fa-chevron-up' : 'fa-chevron-down'} />) : null}
        </div>
        {show ? (
          <>
            {singleGraph1?.nodes?.length ? (
              <List
                width={Math.min(window.innerWidth - 220, 1024)}
                height={singleGraph1?.nodes?.length < 2 ? 200 :window.innerHeight - 450}
                rowCount={singleGraph1?.nodes?.length || 0}
                rowHeight={200}
                rowRenderer={({ key, style, index }) => {
                  const node = singleGraph1?.nodes[index];
                  const node2 = singleGraph2?.nodes?.find((n) => n.name === node.name);
                  return (
                    <div key={key} style={style}>
                      <div className="item">
                        <div className="top">
                          <span className="name">{node.name}</span>
                        </div>
                        <div className="bottom">
                          <div className="node node_left">
                            <LabelCompareItem
                              node={node}
                              checked={selected.some((d) => d.id === node.id)}
                              onChange={(checked) => this.props.onChange(node, checked, 1)}
                            />
                          </div>
                          <div className="node node_right">
                            {node2 ? (
                              <LabelCompareItem
                                node={node2}
                                checked={selected.some((d) => d.id === node2.id)}
                                onChange={(checked) => this.props.onChange(node2, checked, 2)}
                              />
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            ) : null}

            {!singleGraph1 ? (
              <List
                width={Math.min(window.innerWidth - 220, 1024)}
                height={singleGraph2?.nodes?.length < 2 ? 200 :window.innerHeight - 450}
                rowCount={singleGraph2?.nodes?.length || 0}
                rowHeight={200}
                rowRenderer={({ key, style, index }) => {
                  const node2 = singleGraph2?.nodes[index];
                  return (
                    <div key={key} style={style}>
                      <div className="item">
                        <div className="top">
                          <span className="name">{node2.name}</span>
                        </div>
                        <div className="bottom">
                          <div className="node node_left" />
                          <div className="node node_right">
                            <LabelCompareItem
                              node={node2}
                              checked={selected.some((d) => d.id === node2.id)}
                              customFields={singleGraph2.customFields}
                              onChange={(checked) => this.props.onChange(node2, checked, 2)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            ) : null}
          </>
        ) : null}

      </div>
    );
  }
}

export default GraphCompareList;
