import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import Wrapper from '../../components/Wrapper';
import Header from '../../components/Header';
import { getUserSearch } from '../../store/selectors/account';
import Button from '../../components/form/Button';
import { getUsersByTextRequest } from '../../store/actions/account';

const Search = React.memo(() => {
  const dispatch = useDispatch();
  const useSearch = useSelector(getUserSearch);
  const { s: searchParam } = queryString.parse(window.location.search);

  useEffect(() => {
    dispatch(getUsersByTextRequest(searchParam));
  }, [dispatch, searchParam]);

  return (
    <Wrapper>
      <Header />
      <div className="searchData">
        <div className="searchData__links">
          <div className="searchData__link"><Link to={`search-graph?s=${searchParam}`}>Graphs</Link></div>
          <div className="searchData__link active">
            <Link to={`search-people?s=${searchParam}`} style={{ marginRight: '32px' }}>
              People
            </Link>
          </div>
        </div>
        {useSearch && useSearch.length ? (
          <div className="searchData__wrapper">
            <h3>{ `Found ${useSearch.length} ${useSearch.length > 1 ? 'People' : 'Person'}`}</h3>
            {useSearch.map((user) => (
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
          </div>
        ) : 'No Person Found'}
      </div>
    </Wrapper>
  );
});

export default Search;
