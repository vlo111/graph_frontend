<<<<<<< HEAD
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import _ from 'lodash';
import { setFilter } from '../../store/actions/app';
import ChartUtils from '../../helpers/ChartUtils';
import Button from '../form/Button';
import Checkbox from "../form/Checkbox";
=======
import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import memoizeOne from "memoize-one";
import _ from "lodash";
import { setFilter } from "../../store/actions/app";
import Checkbox from "../form/Checkbox";
import ChartUtils from "../../helpers/ChartUtils";
import Button from "../form/Button";
>>>>>>> origin/master

class LinkTypesFilter extends Component {
  static propTypes = {
    filters: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    links: PropTypes.array.isRequired,
  };

<<<<<<< HEAD
  checkAllLinks = memoizeOne((types) => {
    if (types.length) {
      this.props.setFilter('linkTypes', types.map((d) => d.type), true);
    }
    return types;
  }, _.isEqual);
=======
  getLinkTypes = memoizeOne(
    (links) => {
      const types = _.chain(links)
        .groupBy("type")
        .map((d, key) => ({
          length: d.length,
          type: key,
        }))
        .orderBy("length", "desc")
        .value();
      if (types.length) {
        this.props.setFilter(
          "linkTypes",
          types.map((d) => d.type),
          true
        );
      }
      return types;
    },
    (a, b) =>
      _.isEqual(
        a[0].map((d) => d.type),
        b[0].map((d) => d.type)
      )
  );
>>>>>>> origin/master

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  handleChange = (value) => {
    const { filters } = this.props;
    const i = filters.linkTypes.indexOf(value);
    if (i > -1) {
      filters.linkTypes.splice(i, 1);
    } else {
      filters.linkTypes.push(value);
    }
<<<<<<< HEAD
    this.props.setFilter('linkTypes', filters.linkTypes);
=======
    this.props.setFilter("linkTypes", filters.linkTypes);
>>>>>>> origin/master
  };

  toggleMore = () => {
    const { showMore } = this.state;
    this.setState({ showMore: !showMore });
  };

  toggleAll = (fullData, allChecked) => {
    if (allChecked) {
      this.props.setFilter("linkTypes", []);
    } else {
      this.props.setFilter(
<<<<<<< HEAD
        'linkTypes',
        fullData.map((d) => d.type),
=======
        "linkTypes",
        fullData.map((d) => d.type)
>>>>>>> origin/master
      );
    }
  };

  render() {
    const { showMore } = this.state;
<<<<<<< HEAD
    const { filters, graphFilterInfo: { linkTypes = [] } } = this.props;
    this.checkAllLinks(linkTypes);
    const types = showMore ? linkTypes : _.chunk(linkTypes, 5)[0] || [];

    const allChecked = linkTypes.length === filters.linkTypes.length;
    return (
      <div className="linkTypesFilter graphFilter">
        <details open>
          <summary>
            Link Types
          </summary>
          <ul className="list">
            <li className="item">
              <div className="filterCheckBox">
                <Checkbox
                  id="allLinks"
                  label="All"
                  checked={allChecked}
                  onChange={() => this.toggleAll(linkTypes, allChecked)}
                />
              </div>
              <span className="badge">{_.sumBy(linkTypes, 'length')}</span>
=======
    const { links, filters } = this.props;
    const typesFull = this.getLinkTypes(links);
    const types = showMore ? typesFull : _.chunk(typesFull, 5)[0] || [];
    if (typesFull.length < 2) {
      return null;
    }
    const allChecked = typesFull.length === filters.linkTypes.length; 
    return (
      <div className="linkTypesFilter graphFilter">
        <h4 className="title">Link Types</h4>
        <ul className="list">
          <li className="item">
            <div className="filterCheckBox">
              <Checkbox
                label={allChecked ? "Uncheck All" : "Check All"}
                checked={allChecked}
                onChange={() => this.toggleAll(typesFull, allChecked)}
                className="graphsCheckbox"
              > 
               
              </Checkbox>
            </div>
            <span className="badge">{_.sumBy(typesFull, "length")}</span>
          </li>
          {types.map((item) => (
            <li
              key={item.type}
              className="item"
              style={{ color: ChartUtils.linkColor(item) }}
            >
              <div className="filterCheckBox">
                <Checkbox
                  label={item.type}
                  checked={filters.linkTypes.includes(item.type)}
                  onChange={() => this.handleChange(item.type)}
                  className="graphsCheckbox"
                >
                 
                </Checkbox>
              </div>
              <span className="badge">{item.length}</span>
>>>>>>> origin/master
            </li>
            {types.map((item) => (
              <li
                key={item.type}
                className="item"
                style={{ color: ChartUtils.linkColor(item) }}
              >
                <div className="filterCheckBox">
                  <Checkbox
                    id={item.type}
                    label={item.type}
                    checked={filters.linkTypes.includes(item.type)}
                    onChange={() => this.handleChange(item.type)}
                  />
                </div>
                <span className="badge">{item.length}</span>
              </li>
            ))}
          </ul>
        </details>
        {linkTypes.length > types.length || showMore ? (
          <Button onClick={this.toggleMore}>
            {showMore ? "- Less" : "+ More"}
          </Button>
        ) : null}
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

const Container = connect(mapStateToProps, mapDispatchToProps)(LinkTypesFilter);

export default Container;
