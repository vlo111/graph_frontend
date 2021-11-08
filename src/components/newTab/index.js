import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import Outside from '../Outside';
import General from './content/General';
import Chart from '../../Chart';
import Tab from './content/Tab';
import { getCustomField, getSingleGraph } from '../../store/selectors/graphs';
import { getNodeCustomFieldsRequest } from '../../store/actions/graphs';
import SwitchTab from './SwitchTab';
import AddTabModal from './modal/AddTabModal';
import Utils from '../../helpers/Utils';
import Api from '../../Api';
import { updateNodesCustomFieldsRequest } from '../../store/actions/nodes';
import Comment from './content/Comment';

const Tabs = ({ history, editable }) => {
  const { info: nodeId } = queryString.parse(window.location.search);

  if (!nodeId) {
    return null;
  }

  const node = Chart.getNodes().find((n) => n.id === nodeId);

  if (!node) return null;

  const singleGraph = useSelector(getSingleGraph);

  const { id } = singleGraph;

  const nodeCustomFields = useSelector(getCustomField);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getNodeCustomFieldsRequest(id, nodeId));
  }, []);

  const queryObj = queryString.parse(window.location.search);

  const closeNodeInfo = () => {
    delete queryObj.info;
    const query = queryString.stringify(queryObj);
    history.replace(`?${query}`);

    // move autoplay right
    const right = '15px';

    document.getElementById('autoPlay').style.right = right;
    document.querySelector('.graphControlPanel').style.right = right;
  };

  const moveAutoPlay = () => {
    const left = document.querySelector('.tab_list') ? '660px' : '460px';

    // move autoplay right
    document.getElementById('autoPlay').style.right = left;
    document.querySelector('.graphControlPanel').style.right = left;
  };

  useEffect(() => {
    moveAutoPlay();
  });

  const [mode, setMode] = useState('tabs');

  const [activeTab, setActiveTab] = useState('_description');

  const [openAddTab, setOpenAddTab] = useState(null);

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
    if (activeTab !== '_description') updateTabWithFile();
  }, []);

  return (
    <Outside onClick={closeNodeInfo} exclude=".ghModalOverlay,.contextmenuOverlay,.jodit,.undoWrapper,#graphs-data-info,.graphControlPanel">
      <SwitchTab
        mode={mode}
        moveAutoPlay={moveAutoPlay}
        id={id}
        nodeId={nodeId}
        setMode={(name) => setMode(name)}
        node={node}
        activeTab={activeTab}
        setActiveTab={(tabName) => setActiveTab(tabName)}
        nodeCustomFields={nodeCustomFields}
        setOpenAddTab={(tab) => setOpenAddTab(tab)}
      />
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
          <Tab
            node={node}
            graphId={id}
            customFields={nodeCustomFields}
            name={activeTab}
            setOpenAddTab={(tab) => setOpenAddTab(tab)}
            setActiveTab={(tabName) => setActiveTab(tabName)}
          />
          )}
          {mode === 'comments'
          && (
          <Comment graph={singleGraph} node={node} />
          )}
        </div>
      </div>
      {!_.isNull(openAddTab) && (
      <AddTabModal
        node={node}
        fieldName={openAddTab}
        customFields={nodeCustomFields}
        onClose={() => {
          updateTabWithFile();
          setOpenAddTab(null);
        }}
        setActiveTab={(tabName) => setActiveTab(tabName)}
      />
      )}
    </Outside>
  );
};

Tabs.propTypes = {
  history: PropTypes.object.isRequired,
  editable: PropTypes.bool,
};

export default withRouter(Tabs);
