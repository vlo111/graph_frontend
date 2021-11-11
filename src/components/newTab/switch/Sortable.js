import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import Utils from '../../../helpers/Utils';

class Sortable extends Component {
    static propTypes = {
      keyExtractor: PropTypes.func,
      onChange: PropTypes.func.isRequired,
      renderItem: PropTypes.func.isRequired,
      items: PropTypes.array.isRequired,
      activeTab: PropTypes.string.isRequired,
      setActiveTab: PropTypes.func.isRequired,
    }

    static defaultProps = {
      keyExtractor: (val) => val.id,
    }

    sortableItem = SortableElement((props) => this.props.renderItem(props));

    sortableList = SortableContainer(({ items }) => {
      const SortableItem = this.sortableItem;

      const { activeTab, setActiveTab } = this.props;

      /* @todo get document elements size
        * 56 graph header height
        * 100 - add tab block
        * 20 - padding from button
      */

      const height = window.innerHeight - 56 - 100 - 20;

      const contentStyle = {
        height,
      };

      return (
        <div style={contentStyle} className="tab_list-content SortableList">
          {(activeTab === '_description')
            ? (
              <div
                className="tab_list-content-active tab_list-content-item"
                onClick={() => setActiveTab('_description')}
              >
                Description
              </div>
            ) : (
              <div
                className="tab_list-content-item SortableItem"
                onClick={() => setActiveTab('_description')}
              >
                Description
              </div>
            )}
          {items.map((value, index) => (
            <SortableItem
              onClick={() => this.props.setActiveTab(value)}
              key={this.props.keyExtractor(value)}
              index={index}
              value={value}
            />
          ))}
        </div>
      );
    });

    handleSortEnd = ({ oldIndex, newIndex }) => {
      const { items } = this.props;
      this.props.onChange(Utils.arrayMove(items, oldIndex, newIndex));
    }

    render() {
      const SortableList = this.sortableList;
      const {
        items, onChange, keyExtractor, renderItem, ...props
      } = this.props;
      return (
        <SortableList
          axis="y"
          helperClass="sortableListItem"
          items={items}
          onSortEnd={this.handleSortEnd}
          {...props}
        />
      );
    }
}

export default Sortable;
