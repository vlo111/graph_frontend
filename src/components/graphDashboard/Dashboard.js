import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import Button from '../form/Button';
import AddQuery from '../GraphQuery/AddQuery';
import Queries from '../GraphQuery/Queries';
import { getSingleGraphRequest } from '../../store/actions/graphs';
import { ReactComponent as SaveSvg } from '../../assets/images/icons/save.svg';
import { ReactComponent as SettingSvg } from '../../assets/images/icons/setting.svg';
import { ReactComponent as RefreshSvg } from '../../assets/images/icons/close.svg';

const Dashboard = ({ graph }) => {
  const [showGraphQuery, setshowGraphQuery] = useState(false);
  const [showGraphQuerySetting, setShowGraphQuerySetting] = useState(false);
  const dispatch = useDispatch();

  const toggleGraphQuery = (togle) => {
    setshowGraphQuery(togle);
  };
  const toggleGraphQuerySetting = (togle) => {
    setShowGraphQuerySetting(togle);
  };
  const toggleGraphReset = () => {
    dispatch(getSingleGraphRequest(graph.id));
  };
  return (
    <div className="dashboards">
      <Button
        icon={<SaveSvg style={{ height: 30 }} />}
        onClick={() => toggleGraphQuery(true)}
        title="Save query"
        className="save_query"
      />
      <Button
        icon={<SettingSvg style={{ height: 30 }} />}
        onClick={() => toggleGraphQuerySetting(true)}
        title="Save query"
        className="setting_query"
      />
      <Button
        icon={<RefreshSvg style={{ height: 30 }} />}
        onClick={() => toggleGraphReset()}
        title="Reset"
        className="resetAll"
      />

      {showGraphQuery ? (

        <AddQuery
          closeModal={() => toggleGraphQuery(false)}
          graph={graph}
        />
      ) : null}

      {showGraphQuerySetting ? (

        <Queries
          closeModal={() => toggleGraphQuerySetting(false)}
          graphId={graph.id}
        />
      ) : null}
    </div>
  );
};
Dashboard.propTypes = {
  graph: PropTypes.object.isRequired,
};

export default Dashboard;
