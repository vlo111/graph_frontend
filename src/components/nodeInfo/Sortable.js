import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import Utils from '../../helpers/Utils';

class Sortable extends Component {
  static propTypes = {
    keyExtractor: PropTypes.func,
    onChange: PropTypes.func.isRequired,
    renderItem: PropTypes.func.isRequired,
    items: PropTypes.array.isRequired,
  }

  static defaultProps = {
    keyExtractor: (val) => val.id,
  }

  sortableItem = SortableElement((props) => this.props.renderItem(props));

  sortableList = SortableContainer(({ items }) => {
    const SortableItem = this.sortableItem;
    return (
      <div className="sortable">
        {items.map((value, index) => (
          <SortableItem key={this.props.keyExtractor(value)} index={index} value={value} />
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
        axis="x"
        helperClass="sortableListItem"
        items={items}
        onSortEnd={this.handleSortEnd}
        {...props}
      />
    );
  }
}

export default Sortable;
