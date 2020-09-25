import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { Link } from 'react-router-dom';
import Wrapper from '../components/Wrapper';
import Utils from '../helpers/Utils';
import Header from '../components/Header';
import { userGraphs } from '../store/selectors/shareGraphs';
import { userGraphRequest } from '../store/actions/shareGraphs';

const Shared = React.memo(() => {
  const userGraphsData = useSelector(userGraphs);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(userGraphRequest());
  }, [dispatch]);

  return (
    <Wrapper className="homePage">
      <Header />
      <div className="graphsList">
        {userGraphsData && userGraphsData.map(({ graph, user }) => (
          <article key={graph.id} className="graphsItem">
            <div className="top">
              <img
                className="avatar"
                src={user.avatar}
                alt={user.name}
              />
              <div className="infoWrapper">
                <a href="/">
                  <span className="author">{`${user.firstName} ${user.lastName}`}</span>
                </a>
                <div className="info">
                  <span>{moment(graph.updatedAt).calendar()}</span>
                  <span>{`${graph.nodesCount} nodes`}</span>
                </div>
              </div>
            </div>
            <Link to={`/graphs/preview/${graph.id}`}>
              <img
                className="thumbnail"
                src={graph.thumbnail || Utils.fileSrc(`/public/uploads/thumbnails/${graph.id}.png`)}
                alt={graph.title}
              />
            </Link>
            <Link to={`/graphs/preview/${graph.id}`}>
              <h3 className="title">{graph.title}</h3>
            </Link>
            <Link to={`/graphs/preview/${graph.id}`}>
              <p className="description">
                {graph.description.length > 600 ? `${graph.description.substr(0, 600)}... ` : graph.description}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </Wrapper>
  );
});

export default Shared;
