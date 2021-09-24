import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import InputRange from 'react-input-range';
import { setFilter } from '../../store/actions/app';
import Button from '../form/Button';
import Checkbox from '../form/Checkbox';

class KeywordsFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    nodes: PropTypes.array.isRequired,
  }

  getKeywords = memoizeOne((keywords) => {
    if (keywords.length) {
      this.props.setFilter('nodeKeywords', keywords.map((d) => d.keyword), true);
    }
  }, _.isEqual);

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  handleChange = (value) => {
    const { filters } = this.props;
    const i = filters.nodeKeywords.indexOf(value);
    if (i > -1) {
      filters.nodeKeywords.splice(i, 1);
    } else {
      filters.nodeKeywords.push(value);
    }

    this.props.setFilter('nodeKeywords', filters.nodeKeywords);
  }

  toggleMore = () => {
    const { showMore } = this.state;
    this.setState({ showMore: !showMore });
  }

  toggleAll = (fullData, allChecked) => {
    if (allChecked) {
      this.props.setFilter('nodeKeywords', []);
    } else {
      this.props.setFilter('nodeKeywords', fullData.map((d) => d.keyword));
    }
  }

  render() {
    const { showMore } = this.state;
    const { filters, graphFilterInfo: { keywords = [] } } = this.props;
    this.getKeywords(keywords);
    const types = showMore ? keywords : _.chunk(keywords, 5)[0] || [];
    if (keywords.length < 2) {
      return null;
    }
    const allChecked = keywords.length === filters.nodeKeywords.length;
    return (
      <div className="tagsFilter graphFilter">
<<<<<<< HEAD
        <details open>
          <summary>
            Node Keywords
          </summary>
          <ul className="list">
            <li className="item">
              <div className="filterCheckBox">
                <Checkbox
                  id="allKeyword"
                  label="All"
                  checked={allChecked}
                  onChange={() => this.toggleAll(keywords, allChecked)}
                />
              </div>
              <span className="badge">
                {_.sumBy(keywords, 'length')}
              </span>
            </li>
            {types.map((item) => (
              <li key={item.keyword} className="item">
                <div className="filterCheckBox">
                  <Checkbox
                    id={item.keyword}
                    label={item.keyword}
                    checked={filters.nodeKeywords.includes(item.keyword)}
                    onChange={() => this.handleChange(item.keyword)}
                  />
                </div>
                <span className="badge">
                  {item.length}
                </span>
              </li>
            ))}
            {keywords.length > types.length || showMore ? (
              <li className="item">
                <button className="more" onClick={this.toggleMore}>
                  {showMore ? 'Less' : 'More'}
                </button>
              </li>
            ) : null}

          </ul>
        </details>
=======
        <h4 className="title">Node Keywords</h4>
        <ul className="list">
          <li className="item">
          <div className="filterCheckBox">
            <Checkbox
              label={allChecked ? 'Uncheck All' : 'Check All'}
              checked={allChecked}
              onChange={() => this.toggleAll(typesFull, allChecked)}
              className="graphsCheckbox"
            >           
            </Checkbox>
            </div>
            <span className="badge">
                {_.sumBy(typesFull, 'length')}
              </span>
          </li>
          {types.map((item) => (
            <li key={item.keyword} className="item">
               <div className="filterCheckBox"> 
              <Checkbox
                label={item.keyword}
                checked={filters.nodeKeywords.includes(item.keyword)}
                onChange={() => this.handleChange(item.keyword)}
                className="graphsCheckbox"
              >               
              </Checkbox>
              </div>
              <span className="badge">
                  {item.length}
                </span>
            </li>
          ))}
        </ul>
        {typesFull.length > types.length || showMore ? (
          <Button onClick={this.toggleMore}>
            {showMore ? '- Less' : '+ More'}
          </Button>
        ) : null}
>>>>>>> origin/master
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  filters: state.app.filters,
  graphFilterInfo: state.graphs.graphFilterInfo,
});

const mapDispatchToProps = {
  setFilter,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(KeywordsFilter);

export default Container;
