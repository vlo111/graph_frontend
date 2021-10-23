import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useDispatch} from 'react-redux';
import Button from '../form/Button';
import AddQuery from '../GraphQuery/AddQuery';
import Queries from '../GraphQuery/Queries';
import {getSingleGraphRequest} from '../../store/actions/graphs';
import {ReactComponent as SaveSvg} from '../../assets/images/icons/save.svg';
import {ReactComponent as SettingSvg} from '../../assets/images/icons/setting.svg';
import Icon from "../form/Icon";

const Dashboard = ({graph}) => {
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
                icon={<SaveSvg style={{height: 30}}/>}
                onClick={() => toggleGraphQuery(true)}
                title="Save query"
                className="save_query"
            />
            <button
                onClick={() => toggleGraphQuerySetting(!showGraphQuerySetting)}
                title="Save query"
                className={`${showGraphQuerySetting ? 'setting_queryBtn__active' : ''} setting_queryBtn btn-classic`}
            ><Icon value={<SettingSvg style={{marginTop: '-2.5px'}}/>}/></button>
            <button
                onClick={() => toggleGraphReset()}
                title="Reset"
                className="resetAll"> Reset
            </button>

            {showGraphQuery ? (

                <AddQuery
                    closeModal={() => toggleGraphQuery(false)}
                    graph={graph}
                />
            ) : null}{showGraphQuerySetting ? (
            <Queries
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
