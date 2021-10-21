import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../form/Button';
import AddQuery from '../GraphQuery/AddQuery';
import Queries from '../GraphQuery/Queries';

import { ReactComponent as SaveSvg } from '../../assets/images/icons/save.svg';
import { ReactComponent as SettingSvg } from '../../assets/images/icons/setting.svg';

const Dashboard = ({ graph }) => {
  const [showGraphQuery, setshowGraphQuery] = useState(false);
  const [showGraphQuerySetting, setShowGraphQuerySetting] = useState(false);

  const toggleGraphQuery = (togle) => {
    setshowGraphQuery(togle);
  };
  const toggleGraphQuerySetting = (togle) => {
    setShowGraphQuerySetting(togle);
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
