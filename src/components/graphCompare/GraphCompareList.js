import React, { Component } from 'react';
import _ from 'lodash';
import LabelCompareItem from '../labelCopy/LabelCompareItem';
import Checkbox from '../form/Checkbox';

class GraphCompareList extends Component {
    static defaultProps = {
      width: Math.min(window.innerWidth - 220, 1024),
    }

    constructor(props) {
      super(props);
      this.state = {
        selectAllLeft: true,
        selectAllRight: true,
      };
    }

    componentDidMount() {
      const { selected, singleGraph1, singleGraph2 } = this.props;

      if (selected) {
        const totalSelected1 = singleGraph1?.nodes?.length
          === singleGraph1?.nodes?.filter((p) => selected.filter((s) => s.name === p.name).length).length;
        const totalSelected2 = singleGraph2?.nodes?.length
          === singleGraph2?.nodes?.filter((p) => selected.filter((s) => s.name === p.name).length).length;

        this.setState({
          selectAllLeft: totalSelected1,
          selectAllRight: totalSelected2,
        });
      }
    }

    toggleAllLeft = () => {
      const { selectAllLeft } = this.state;

      this.setState({
        selectAllLeft: !selectAllLeft,
      });

      const { singleGraph1 } = this.props;

      (singleGraph1?.nodes || []).forEach((n) => {
        this.props.onChange(n, !selectAllLeft, 1);
      });
    }

    toggleAllRight = () => {
      const { selectAllRight } = this.state;

      const { singleGraph1, singleGraph2 } = this.props;

      const isSimilar = singleGraph1 && singleGraph2;

      this.setState({
        selectAllRight: !selectAllRight,
      });

      if (isSimilar) {
        (singleGraph2?.nodes || []).forEach((n) => {
          if (singleGraph1.nodes.filter((p) => p.name === n.name).length) {
            this.props.onChange(n, !selectAllRight, 2);
          }
        });
      } else {
        (singleGraph2?.nodes || []).forEach((n) => {
          this.props.onChange(n, !selectAllRight, 2);
        });
      }
    }

    render() {
      const {
        singleGraph1, singleGraph2, title, selected, count,
      } = this.props;

      const { selectAllLeft, selectAllRight } = this.state;

      if (_.isEmpty(singleGraph1?.nodes) && _.isEmpty(singleGraph2?.nodes)) {
        return null;
      }

      const isSimilar = singleGraph1 && singleGraph2;

      const selectAllSimilar = (
        <tr>
          {singleGraph1 && (
          <td>
            <Checkbox
              checked={selectAllLeft}
              onChange={this.toggleAllLeft}
              label="Check All"
              id={singleGraph2 ? 'allLeftNodes' : 'similar_allLeftNodes'}
            />
          </td>
          )}
          {singleGraph2 && (
          <td>
            <Checkbox
              checked={selectAllRight}
              onChange={this.toggleAllRight}
              label="Check All"
              id={singleGraph1 ? 'allRightNodes' : 'similar_allRightNodes'}
            />
          </td>
          ) }
        </tr>
      );

      const singleGraph1List = singleGraph1?.nodes?.map((node, index) => {
        const node2 = singleGraph2?.nodes?.find((n) => n.name === node.name);
        return (
          <>
            <tr>
              <td>
                <LabelCompareItem
                  node={node}
                  checked={selected.some((d) => d.id === node.id)}
                  onChange={(checked) => this.props.onChange(node, checked, 1)}
                />
              </td>
              {node2 && (
              <td>
                <LabelCompareItem
                  node={node2}
                  checked={selected.some((d) => d.id === node2.id)}
                  onChange={(checked) => this.props.onChange(node, checked, 2)}
                />
              </td>
              )}
            </tr>
          </>
        );
      });

      const singleGraph2List = singleGraph2?.nodes?.map((node, index) => (
        <>
          <tr>
            <td>
              <LabelCompareItem
                node={node}
                checked={selected.some((d) => d.id === node.id)}
                onChange={(checked) => this.props.onChange(node, checked, 2)}
              />
            </td>
          </tr>
        </>
      ));

      return (
        <div className="compareList">

          <details className="listExpand">
            <summary
              onClick={() => {
                Array.from(document.getElementsByClassName('listExpand')).forEach((el) => {
                  el.removeAttribute('open');
                });
              }}
              className="title"
            >
              {title}
            </summary>
            <div className="right-block">
              <table>
                <thead>
                  <tr>
                    <th>
                      {isSimilar && (
                      <span className="caption-left">
                        {singleGraph1?.title}
                      </span>
                      )}
                      <span className="similar-nodes">
                        {title}
                        {` (${count})`}
                      </span>
                    </th>
                    {isSimilar && (
                    <th>
                      <span className="caption-right">
                        {singleGraph2?.title}
                      </span>
                    </th>
                    )}
                  </tr>
                </thead>
                <tbody className={`${!isSimilar ? 'tableContent' : ''}`}>
                  {selectAllSimilar}
                  {singleGraph1List}
                  {singleGraph2List}
                </tbody>
              </table>

            </div>
          </details>
        </div>
      );
    }
}

export default GraphCompareList;
