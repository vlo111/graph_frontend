import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Wrapper from '../../components/Wrapper';
import Header from '../../components/Header';
import { getGraphsListRequest } from '../../store/actions/graphs';
import { getList, getListInfo } from '../../store/selectors/graphs';
import { getUserSearch } from '../../store/selectors/account';
import Button from '../../components/form/Button';
import { getUsersByTextRequest } from '../../store/actions/account';

const Search = React.memo(() => {
  const dispatch = useDispatch();
  const graphsList = useSelector(getList);
  const useSearch = useSelector(getUserSearch);
  const { totalPages } = useSelector(getListInfo);
  const { page = 1, s: searchParam } = queryString.parse(window.location.search);

  useEffect(() => {
    dispatch(getGraphsListRequest(page, { s: searchParam }));
  }, [dispatch, page, searchParam]);

  useEffect(() => {
    dispatch(getUsersByTextRequest(searchParam));
  }, [dispatch, searchParam]);

  return (
    <Wrapper>
      <Header />
      <div className="searchData">
        <div className="searchData__links">
          <div className="searchData__link"><Link to={`search-graph?s=${searchParam}`}>Graphs</Link></div>
          <div className="searchData__link"><Link to={`search-people?s=${searchParam}`} style={{ marginRight: '32px' }}>People</Link></div>
        </div>
        {graphsList && graphsList.length ? (
          <div className="searchData__wrapper">
            <h3>{ `Graph${graphsList.length > 1 ? 's' : ''}`}</h3>
            {graphsList.slice(0, 5).map((graph) => (
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
                <div>
                  <Button>connect</Button>
                </div>
              </article>
            ))}
            {
            graphsList.length > 5
            && <div className="viewAll"><Link to={`search-graph?s=${searchParam}`}>View all</Link></div>
          }
          </div>
        ) : null}
        {useSearch && useSearch.length ? (
          <div className="searchData__wrapper">
            <h3>{ `${useSearch.length > 1 ? 'People' : 'Person'}`}</h3>
            {useSearch.slice(0, 5).map((user) => (
              <article key={user.id} className="searchData__graph">
                <div className="searchData__graphInfo">
                  <img
                    className="avatar"
                    src={user.avatar}
                    alt={user.firstName}
                  />
                  <div className="searchData__graphInfo-details">
                    <Link to={`/user/preview/${user.id}`}>
                      {`${user.firstName} ${user.lastName}`}
                    </Link>
                    <span className="description">
                      {user.email}
                    </span>
                  </div>
                </div>
                <div>
                  <Button>connect</Button>
                </div>
              </article>
            ))}
            {
            useSearch.length > 5
            && <div className="viewAll"><Link to={`search-people?s=${searchParam}`}>View all</Link></div>
          }
          </div>
        ) : null}
      </div>
    </Wrapper>
  );
});

export default Search;
