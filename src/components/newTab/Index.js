import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import Outside from '../Outside';
import General from './content/General';
import Chart from '../../Chart';
import Tab from './content/Tab';
import { getCustomField, getSingleGraph } from '../../store/selectors/graphs';
import { ReactComponent as ArrowLeftSvg } from '../../assets/images/icons/tab-arrow-left.svg';
import { ReactComponent as ArrowRightSvg } from '../../assets/images/icons/tab-arrow-right.svg';
import AddTabModal from './modal/AddTabModal';
import { getNodeCustomFieldsRequest } from '../../store/actions/graphs';
import { updateNodesCustomFieldsRequest } from '../../store/actions/nodes';
import Utils from '../../helpers/Utils';
import Api from '../../Api';

const Tabs = ({ history, editable }) => {
  const { info: nodeId } = queryString.parse(window.location.search);

  if (!nodeId) {
    return null;
  }

  const node = Chart.getNodes().find((n) => n.id === nodeId);

  if (!node) return null;

  const {
    id, nodesPartial, linksPartial, labels, title,
  } = useSelector(getSingleGraph);

  const nodeCustomFields = useSelector(getCustomField);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getNodeCustomFieldsRequest(id, nodeId));
  }, []);

  const updateTabWithFile = () => {
    const graphId = id;

    for (let i = 0; i < nodeCustomFields.length; i++) {
      const tab = nodeCustomFields[i];

      if (tab.value?.includes('blob')) {
        const { documentElement } = Utils.tabHtmlFile(tab.value);

        for (let j = 0; j < documentElement.length; j++) {
          const media = documentElement[j];

          const documentPath = media.querySelector('img')?.src ?? media.querySelector('a')?.href;

          if (documentPath) {
            const path = Api.documentPath(graphId, media.querySelector('#docId').innerText).catch((d) => d);

            nodeCustomFields[i].value = nodeCustomFields[i].value.replace(documentPath, path.data?.path);
          }
        }
      }
    }

    dispatch(updateNodesCustomFieldsRequest(graphId, [{
      id: nodeId,
      customFields: nodeCustomFields,
    }]));
  };

  useEffect(() => {
    updateTabWithFile();
  }, []);

  const queryObj = queryString.parse(window.location.search);

  const closeNodeInfo = () => {
    delete queryObj.info;
    const query = queryString.stringify(queryObj);
    history.replace(`?${query}`);

    const left = '15px';

    // autoplay right

    document.getElementById('autoPlay').style.right = left;
    document.querySelector('.graphControlPanel').style.right = left;
  };

  const [mode, setMode] = useState('tabs');

  const [openAddTab, setOpenAddTab] = useState(false);

  const [openTabNames, setOpenTabNames] = useState(false);

  const [activeTab, setActiveTab] = useState('_description');

  /* @todo get document elements size
  * 56 graph header height
  * 100 - add tab block
  * 20 - padding from buttom
  *  */

  const height = window.innerHeight - 56 - 100 - 20;

  const contentStyle = {
    height,
  };


  useEffect(() => {
    const left = openTabNames ? '660px' : '460px';

    // autoplay right

    document.getElementById('autoPlay').style.right = left;
    document.querySelector('.graphControlPanel').style.right = left;
  });

  return (
    <Outside onClick={closeNodeInfo} exclude=".ghModalOverlay,.contextmenuOverlay, .jodit">
      <div className="tab">
        <div className="tab-header">
          <button
            type="submit"
            className={mode === 'general' ? 'tab-header-active' : 'tab-header-in-active'}
            onClick={() => setMode('general')}
          >
            General
          </button>
          <button
            type="submit"
            className={mode === 'tabs' ? 'tab-header-active' : 'tab-header-in-active'}
            onClick={() => setMode('tabs')}
          >
            Tabs
          </button>
          <button
            type="submit"
            className={mode === 'comments' ? 'tab-header-active' : 'tab-header-in-active'}
            onClick={() => setMode('comments')}
          >
            Comments
          </button>
        </div>
        <div className="tab-container">
          {mode === 'general'
          && (
          <General
            queryObj={queryObj}
            editable={editable}
            node={node}
          />
          )}
          {mode === 'tabs'
            && (
            <Tab node={node} customFields={nodeCustomFields} name={activeTab} />
            )}
        </div>
      </div>
      <>
        {mode === 'tabs'
      && openTabNames && (
      <div className="tab_list">
        <div className="tab_list-header">
          <div className="tab_list-header-text">{`Tabs (${nodeCustomFields.length})`}</div>
          <div className="tab_list-header-add" onClick={() => setOpenAddTab(true)}>+ add tab</div>
        </div>
        <div style={contentStyle} className="tab_list-content">
          {nodeCustomFields.map((tab) => (
            <div
              className={`${activeTab === tab.name ? 'tab_list-content-active' : ''} tab_list-content-item`}
              onClick={() => setActiveTab(tab.name)}
              title={(tab.name !== '_description' && tab.name.length > 16) ? tab.name : null}
            >
              {tab.name === '_description' ? 'Description' : (tab.name.length > 16 ? `${tab.name.substring(0, 16)}...` : tab.name)}
            </div>
          ))}
        </div>
      </div>
        )}
        <div
          style={{ right: `${(mode === 'tabs') && openTabNames ? 650 : 450}px` }}
          className="switch_tab"
          onClick={() => {
            setOpenTabNames(!openTabNames);
            setMode('tabs');
          }}
        >
          {mode !== 'tabs' ? <ArrowLeftSvg /> : (!openTabNames ? <ArrowLeftSvg /> : <ArrowRightSvg />)}
        </div>
        {openAddTab && (
        <AddTabModal
          node={node}
          fieldName={!openAddTab}
          customFields={nodeCustomFields}
          onClose={() => {
            updateTabWithFile();
            setOpenAddTab(false);
          }}
          setActiveTab={(tabName) => setActiveTab(tabName)}
        />
        )}
      </>
    </Outside>
  );
};

Tabs.propTypes = {
  history: PropTypes.object.isRequired,
  editable: PropTypes.bool,
};

export default withRouter(Tabs);
