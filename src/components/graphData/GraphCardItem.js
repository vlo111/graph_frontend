import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import moment from 'moment';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip';
import { connect } from 'react-redux';
import GraphListFooter from './GraphListFooter';
import GraphDashboardSubMnus from './GraphListHeader';
import { ReactComponent as PlusSvg } from '../../assets/images/icons/plusGraph.svg';
import Utils from '../../helpers/Utils';

class GraphCardItem extends Component {
  static propTypes = {
    graphs: PropTypes.object.isRequired,
    headerTools: PropTypes.string.isRequired,
    currentUserId: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      graphs: [],
    };
  }

  startGraph = () => {
    window.location.href = '/graphs/create';
  }

  showCardOver = (id) => {
    document.getElementsByClassName(`graph-card_${id}`)[0].style.display = 'flex';
  }

  hideCardOver = (id) => {
    document.getElementsByClassName(`graph-card_${id}`)[0].style.display = 'none';
  }

  updateGraph = async (graph) => {
    let { graphs } = this.props;
    graphs = graphs.map((p) => {
      if (p.id === graph.id) {
        p.title = graph.title;
        p.description = graph.description;
        p.thumbnail = `${graph.thumbnail}?t=${moment(graph.updatedAt).unix()}`;
        p.publicState = graph.publicState;
      }
      return p;
    });

    this.setState([graphs]);
  }

  render() {
    const { headerTools, graphs, currentUserId } = this.props;
    if (!graphs?.length) return null;
    return (
      <>
        {(headerTools === 'home' && graphs.length)
          ? (
            <div className="startGraph" onClick={this.startGraph}>
              <PlusSvg />
              <h3>Create a Graph</h3>
            </div>
          ) : null}
        {graphs.map((graph) => (
          <article className="graphs" key={graph.id}>
            <div className="top">
              <div className="infoContent">
                <img
                  className="avatar"
                  src={graph.user.avatar}
                  alt={graph.user.name}
                />
                <div className="infoWrapper">
                  <Link to={`/profile/${graph.user.id}`}>
                    <span className="author">{`${graph.user.firstName} ${graph.user.lastName}`}</span>
                  </Link>
                  <div className="info">
                    <span>{moment(graph.updatedAt).format('YYYY.MM.DD HH:mm')}</span>
                    <span className="nodesCount">{` ${graph.nodesCount} nodes `}</span>
                  </div>
                </div>
              </div>
              <div className="sub-menus">
                <GraphDashboardSubMnus updateGraph={this.updateGraph} graph={graph} headerTools={headerTools} />
              </div>
            </div>
            <div>
              <Tooltip overlay={graph.title} placement="bottom">
                <h3>
                  {' '}
                  {Utils.substr(graph.title, 23)}
                </h3>
              </Tooltip>
              <div className="descriptionGraph">
                <Tooltip overlay={graph.description} placement="bottom">
                  <span>
                    {' '}
                    {Utils.substr(graph.description, 40)}
                  </span>
                </Tooltip>
              </div>
            </div>

            <div
              onMouseOver={() => this.showCardOver(graph.id)}
              onMouseOut={() => this.hideCardOver(graph.id)}
              className="graph-image"
            >
              {(graph.userId !== currentUserId && headerTools === 'public') ? (
                <div className={`buttonView graph-card_${graph.id}`}>
                  <Link className="btn-preview view" to={`/graphs/view/${graph.id}`} replace>Preview</Link>
                </div>
              )
                : (
                  <div className={`buttonView graph-card_${graph.id}`}>
                    {(graph?.share?.role !== 'view') && <Link className="btn-edit view" to={`/graphs/update/${graph.id}`} replace> Edit </Link>}
                    <Link className="btn-preview view" to={`/graphs/view/${graph.id}`} replace> Preview</Link>
                  </div>
                )}
              <img
                className="thumbnail"
                src={`${graph.thumbnail}?t=${moment(graph.updatedAt).unix()}`}
                alt={graph.title}
              />
            </div>
            <GraphListFooter graph={graph} />
            {((headerTools === 'home' || headerTools === 'template') && graph.publicState) && (
            <div className="public_icon">
              <i className="fa fa-globe" />
            </div>
            )}
          </article>
        ))}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUserId: state.account.myAccount.id,
});

const Container = connect(mapStateToProps)(GraphCardItem);

export default withRouter(Container);
