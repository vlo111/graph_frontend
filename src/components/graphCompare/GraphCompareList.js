import React, { Component } from 'react';
import _ from 'lodash';
import LazyLoad from 'react-lazyload';
import LabelCompareItem from '../labelCopy/LabelCompareItem';
import Icon from "../form/Icon";

class GraphCompareList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: !props.dropdown
    }
  }


  toggleDropdown = () => {
    const { show } = this.state;
    this.setState({ show: !show })
  }

  render() {
    const { show } = this.state;
    const { singleGraph1, singleGraph2, dropdown, title } = this.props;
    if (_.isEmpty(singleGraph1) && _.isEmpty(singleGraph2)) {
      return null;
    }
    return (
      <div className="compareList">
        <div className="title">
          {title}
          {dropdown ? (<Icon onClick={this.toggleDropdown} value={show ? 'fa-chevron-up' : 'fa-chevron-down'} />) : null}
        </div>
        {show ? (
          <>
            {singleGraph1?.nodes?.map((node) => {
              const node2 = singleGraph2?.nodes?.find((n) => n.name === node.name);
              return (
                <LazyLoad height={158} unmountIfInvisible>
                  <div className="item">
                    <div className="top">
                      <span className="name">{node.name}</span>
                    </div>
                    <div className="bottom">
                      <div className="node node_left">
                        <LabelCompareItem
                          node={node}
                          customFields={singleGraph1.customFields}
                        />
                      </div>
                      <div className="node node_right">
                        {node2 ? (
                          <LabelCompareItem
                            node={node2}
                            customFields={singleGraph2.customFields}
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </LazyLoad>
              );
            })}
            {!singleGraph1 ? singleGraph2?.nodes?.map((node2) => (
              <LazyLoad height={158} unmountIfInvisible>
                <div className="item">
                  <div className="top">
                    <span className="name">{node2.name}</span>
                  </div>
                  <div className="bottom">
                    <div className="node node_left" />
                    <div className="node node_right">
                      <LabelCompareItem
                        node={node2}
                        customFields={node2.customFields}
                      />
                    </div>
                  </div>
                </div>
              </LazyLoad>
            )) : null}
          </>
        ) : null}
      </div>
    );
  }
}

export default GraphCompareList;
