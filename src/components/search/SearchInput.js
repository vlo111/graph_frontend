import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import _ from 'lodash';
import stripHtml from 'string-strip-html';
import { setActiveButton } from '../../store/actions/app';
import Input from '../form/Input';
import Chart from '../../Chart';
import NodeIcon from '../NodeIcon';
import ChartUtils from '../../helpers/ChartUtils';
import Utils from '../../helpers/Utils';

class SearchModal extends Component {
  static propTypes = {
  }

  constructor(props) {
    super(props);
    this.state = {
      nodes: [],
    };
  }

  handleChange = (search = '') => {
    if (!search.trim().toLowerCase()) {
      this.setState({ nodes: [], search });
      return;
    }
    const nodes = ChartUtils.nodeSearch(search);
    this.setState({ nodes, search });
  }

  formatHtml = (text) => {
    const { search } = this.state;
    return text.replace(new RegExp(Utils.escRegExp(search), 'ig'), '<b>$&</b>');
  }

  findNode = (node) => {
    this.findNodeInDom(node);
  }

  render() {
    const { nodes, search } = this.state;
    return (
      <div className="searchInputWrapper">
        <Input
          placeholder="Search ..."
          autoComplete="off"
          value={search}
          icon="fa-search"
          containerClassName="graphSearch"
          onChangeText={this.handleChange}
        />
        <ul className="list">
          {nodes.map((d) => (
            <li className="item" key={d.index}>
              <div tabIndex="0" role="button" className="ghButton" onClick={() => this.findNode(d)}>
                <div className="left">
                  <NodeIcon node={d} />
                </div>
                <div className="right">
                  <span className="row">
                    <span
                      className="name"
                      dangerouslySetInnerHTML={{ __html: this.formatHtml(d.name) }}
                    />
                    <span
                      className="type"
                      dangerouslySetInnerHTML={{ __html: this.formatHtml(d.type) }}
                    />
                  </span>
                  {!d.name.toLowerCase().includes(search) && !d.type.toLowerCase().includes(search) ? (
                    <span
                      className="keywords"
                      dangerouslySetInnerHTML={{ __html: d.keywords.map((k) => this.formatHtml(k)).join(', ') }}
                    />
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchModal);

export default Container;
