import React, { useEffect, Suspense } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { shareGraphs } from '../../../store/selectors/shareGraphs';
import { searchGraphsListRequest } from '../../../store/actions/shareGraphs';

const SharedGraphs = React.memo(({ setLimit }) => {
  const dispatch = useDispatch();
  const shZGraphsList = useSelector(shareGraphs);
  const { page = 1, s: searchParam } = queryString.parse(window.location.search);

  useEffect(() => {
    dispatch(searchGraphsListRequest(page, { s: searchParam }));
  }, [dispatch, page, searchParam]);

  return (
    <Suspense fallback={<div>Loading shared graphs...</div>}>
      {shZGraphsList && shZGraphsList.length ? (
        <div className="searchData__wrapper">
          <h3>{ `Graph${shZGraphsList.length > 1 ? 's' : ''} shared with you`}</h3>
          {shZGraphsList.slice(0, 5).map((shGraph) => (
            <article key={shGraph.graph.id} className="searchData__graph">
              <div className="searchData__graphInfo">
                <img
                  className="avatar"
                  src={shGraph.graph.user.avatar}
                  alt={shGraph.graph.user.name}
                />
                <div className="searchData__graphInfo-details">
                  <Link to={`/graphs/preview/${shGraph.graph.id}`}>
                    {shGraph.graph.title}
                    {searchParam && shGraph.graph.status !== 'active'
                      ? (
                        <span>{` (${shGraph.graph.status})`}</span>
                      ) : null}
                  </Link>
                  <span className="description">
                    {shGraph.graph.description.length > 300
                      ? `${shGraph.graph.description.substr(0, 300)}... `
                      : shGraph.graph.description}
                  </span>
                </div>
                <div>
                  <span className="author">{`${shGraph.graph.user.firstName} ${shGraph.graph.user.lastName}`}</span>
                  <div className="info">
                    <span>{moment(shGraph.graph.updatedAt).calendar()}</span>
                    <span>{`${shGraph.graph.nodesCount} nodes`}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {
            setLimit && shZGraphsList.length > 5
            && <div className="viewAll"><Link to={`search-graph?s=${searchParam}`}>View all</Link></div>
          }
        </div>
      ) : ((!setLimit && <h3>No Shared Graphs Found</h3>) || null)}
    </Suspense>
  );
});

SharedGraphs.propTypes = {
  setLimit: PropTypes.bool.isRequired,
};

SharedGraphs.defaultProp = {
  setLimit: false,
};

export default SharedGraphs;
