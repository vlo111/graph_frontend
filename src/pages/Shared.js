import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { Link, withRouter } from 'react-router-dom';
import _ from 'lodash';
import Utils from '../helpers/Utils';
import { userGraphs } from '../store/selectors/shareGraphs';
import { userGraphRequest } from '../store/actions/shareGraphs';
import GraphListFooter from "../components/GraphListFooter";
import NoGraph from "../components/NoGraph";

const Shared = React.memo(() => {
  const userGraphsData = useSelector(userGraphs);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(userGraphRequest());
  }, [dispatch]);

  return (
    <>
      <div className={`graphsList ${!userGraphsData.length ? 'empty' : ''}`}>
      {_.isEmpty(userGraphsData) ? (
            <NoGraph />
          ) : null}
        {userGraphsData.map(({ graph }) => (
          <article key={graph.id} className="graphsItem">
            <div className="top">
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
                  <span>{moment(graph.updatedAt).calendar()}</span>
                  <span>{`${graph.nodes.length} nodes`}</span>
                </div>
              </div>
            </div>
            <Link to={`/graphs/preview/${graph.id}`}>
              <h3 className="title">{graph.title}</h3>
            </Link>
            <Link to={`/graphs/preview/${graph.id}`}>
              <p className="description">
                {graph.description.length > 600 ? `${graph.description.substr(0, 600)}... ` : graph.description}
              </p>
            </Link>
            <Link to={`/graphs/preview/${graph.id}`}>
              <img
                className="thumbnail"
                src={graph.thumbnail || Utils.fileSrc(`/public/uploads/thumbnails/${graph.id}.png`)}
                alt={graph.title}
              />
            </Link>
            <GraphListFooter graph={graph} />
          </article>
        ))}
      </div>
    </>
  );
});

export default withRouter(Shared);
