import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { setActiveButton } from '../store/actions/app';
import Input from './form/Input';
import NodeIcon from './NodeIcon';
import ChartUtils from '../helpers/ChartUtils';
import Utils from '../helpers/Utils';
import AnalysisUtils from '../helpers/AnalysisUtils';

class FindPath extends Component {
    static propTypes = {
      setActiveButton: PropTypes.func.isRequired,
      singleGraph: PropTypes.object.isRequired,
    }

    constructor(props) {
      super(props);
      this.state = {
        nodes: [],
        inComponent: [],
      };
    }

    closeModal = () => {
      this.props.setActiveButton('create');
    }

    handleChange = (search = '') => {
      if (!search.trim().toLowerCase()) {
        this.setState({ nodes: [], search });
        return;
      }

      // node in component
      let { inComponent } = this.state;

      const { start, singleGraph } = this.props;

      const foundNodes = ChartUtils.nodeSearch(search).filter((p) => p.id !== start);

      const { nodes, links } = singleGraph;

      if (nodes.length && links.length) {
        const { components } = AnalysisUtils.getComponent(nodes, links);

        foundNodes.forEach((node) => {
          const end = node.id;

          const currentComponent = components
            .filter((component) => component.filter((n) => n.id === start || n.id === end)
              .length > 1)[0];

          if (!currentComponent) {
            inComponent.push(end);
          } else inComponent = inComponent.filter((item) => item !== end);
        });

        this.setState({
          nodes: foundNodes,
          inComponent,
          search,
        });
      }
    }

    formatHtml = (text) => {
      const { search } = this.state;
      return text.replace(new RegExp(Utils.escRegExp(search), 'ig'), '<b>$&</b>');
    }

    showPath = (node) => {
      const { inComponent } = this.state;

      if (!inComponent.includes(node.id)) {
        const { start, singleGraph } = this.props;

        const end = node.id;

        this.props.history.replace(`/graphs/view/${singleGraph.id}?nodeStart=${start}nodeEnd=${end}`);
      }
    }

    render() {
      const { nodes, search, inComponent } = this.state;

      return (
        <Modal
          isOpen
          className="ghModal ghModalSearch findPath"
          overlayClassName="ghModalOverlay"
          onRequestClose={this.closeModal}
        >
          <Input
            label="Search"
            autoComplete="off"
            value={search}
            containerClassName="graphSearch"
            onChangeText={this.handleChange}
            autoFocus
          />
          <ul className="list">
            {nodes.map((d) => (
              <li className="item" key={d.index}>
                <div
                  tabIndex="0"
                  role="button"
                  className={`ghButton ${inComponent.includes(d.id) && 'content'}`}
                  onClick={() => this.showPath(d)}
                >
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
                    { inComponent.includes(d.id)
                    && (
                    <span className="error">
                      <span className="name">
                        <b>This node is not included in the component</b>
                      </span>
                    </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Modal>
      );
    }
}

const mapStateToProps = (state) => ({
  singleGraph: state.graphs.singleGraph,
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {
  setActiveButton,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FindPath);

export default Container;
