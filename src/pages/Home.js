import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactPaginate from 'react-paginate';
import queryString from 'query-string';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { getGraphsListRequest } from '../store/actions/graphs';
import Wrapper from '../components/Wrapper';
import Button from '../components/form/Button';
import Utils from '../helpers/Utils';

class Home extends Component {
  static propTypes = {
    getGraphsListRequest: PropTypes.func.isRequired,
    graphsList: PropTypes.array.isRequired,
    graphsListInfo: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  }

  getGraphsList = memoizeOne((page) => {
    this.props.getGraphsListRequest(page);
  })

  componentDidMount() {
  }

  handlePageChange = (page) => {
    const queryObj = queryString.parse(window.location.search);
    queryObj.page = page.selected + 1;
    const query = queryString.stringify(queryObj);
    this.props.history.push(`?${query}`);
  }

  render() {
    const { graphsList, graphsListInfo: { totalPages } } = this.props;
    const { page = 1 } = queryString.parse(window.location.search);
    this.getGraphsList(page);
    return (
      <Wrapper className="homePage">
        <Link to="/graphs/create" style={{ marginTop: 65 }}>
          <Button icon="fa-pencil" className=" edit">New Graph</Button>
        </Link>
        <div className="graphsList">
          {graphsList.map((graph) => (
            <article key={graph.id} className="graphsItem">
              <div className="top">
                <img
                  className="avatar"
                  src={graph.user.avatar}
                  alt={graph.user.name}
                />
                <div className="infoWrapper">
                  <a href="/">
                    <span className="author">{`${graph.user.firstName} ${graph.user.lastName}`}</span>
                  </a>
                  <div className="info">
                    <span>{moment(graph.updatedAt).calendar()}</span>
                    <span>{`${graph.nodes.length} nodes`}</span>
                  </div>
                </div>
              </div>
              <Link to={`/graphs/preview/${graph.id}`}>
                <img
                  className="thumbnail"
                  src={Utils.fileSrc(`/public/uploads/thumbnails/${graph.id}.png`)}
                  alt={graph.title}
                />
              </Link>
              <Link to={`/graphs/preview/${graph.id}`}>
                <h3 className="title">{graph.title}</h3>
              </Link>
              <Link to={`/graphs/preview/${graph.id}`}>
                <p className="description">{graph.description}</p>
              </Link>
            </article>
          ))}
        </div>
        <ReactPaginate
          containerClassName="pagination"
          forcePage={page - 1}
          pageCount={totalPages}
          previousLabel={<i className="fa fa-angle-left" />}
          nextLabel={<i className="fa fa-angle-right" />}
          onPageChange={this.handlePageChange}
        />
      </Wrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  graphsList: state.graphs.graphsList,
  graphsListInfo: state.graphs.graphsListInfo,
});

const mapDespatchToProps = {
  getGraphsListRequest,
};

const Container = connect(
  mapStateToProps,
  mapDespatchToProps,
)(Home);

export default Container;
