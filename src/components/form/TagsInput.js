import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

class TagsInput extends Component {
  static propTypes = {
    suggestions: PropTypes.array.isRequired,
    value: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
  }

  handleDelete = () => {

  }

  handleAddition = () => {

  }

  handleDrag = () => {

  }

  render() {
    const { containerClassName, value } = this.props;
    return (
      <div className={classNames(containerClassName, 'ghFormField', 'ghTagsInput')}>
        {/*<ReactTags*/}
        {/*  tags={value}*/}
        {/*  handleDelete={this.handleDelete}*/}
        {/*  handleAddition={this.handleAddition}*/}
        {/*  handleDrag={this.handleDrag}*/}
        {/*/>*/}
      </div>
    );
  }
}

export default TagsInput;
