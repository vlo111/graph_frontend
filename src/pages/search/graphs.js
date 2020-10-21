import React, { useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Wrapper from '../../components/Wrapper';
import Header from '../../components/Header';
import { getGraphsListRequest } from '../../store/actions/graphs';
import { getList, getListInfo } from '../../store/selectors/graphs';

const Graphs = React.memo(() => {
  const dispatch = useDispatch();
  const graphsList = useSelector(getList);
  const { totalPages } = useSelector(getListInfo);
  const { page = 1, s: searchParam } = queryString.parse(window.location.search);

  useEffect(() => {
    dispatch(getGraphsListRequest(page, { s: searchParam }));
  }, [dispatch, page, searchParam]);

  return (
    <Wrapper>
      <Header />
      <div className="searchData">
        <div className="searchData__links">
          <div className="searchData__link active"><Link to={`search-graph?s=${searchParam}`}>Graphs</Link></div>
          <div className="searchData__link"><Link to={`search-people?s=${searchParam}`} style={{ marginRight: '32px' }}>People</Link></div>
        </div>
        {graphsList && graphsList.length ? (
          <div className="searchData__wrapper">
            <h3>{ `${graphsList.length} Graph${graphsList.length > 1 ? 's' : ''} found`}</h3>
            {graphsList.map((graph) => (
              <article key={graph.id} className="searchData__graph">
                <div className="searchData__graphInfo">
                  <img
                    className="avatar"
                    src={graph.user.avatar}
                    alt={graph.user.name}
                  />
                  <div className="searchData__graphInfo-details">
                    <Link to={`/graphs/preview/${graph.id}`}>
                      {graph.title}
                      {searchParam && graph.status !== 'active' ? (
                        <span>{` (${graph.status})`}</span>
                      ) : null}
                    </Link>
                    <span className="description">
                      {graph.description.length > 300 ? `${graph.description.substr(0, 300)}... ` : graph.description}
                    </span>
                  </div>
                  <div>
                    <span className="author">{`${graph.user.firstName} ${graph.user.lastName}`}</span>
                    <div className="info">
                      <span>{moment(graph.updatedAt).calendar()}</span>
                      <span>{`${graph.nodesCount} nodes`}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : 'No Graph found'}
      </div>
    </Wrapper>
  );
});

export default Graphs;
