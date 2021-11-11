import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import Chart from '../../Chart';
import { getCustomField, getSingleGraph } from '../../store/selectors/graphs';
import { getNodeCustomFieldsRequest } from '../../store/actions/graphs';
import SwitchTab from './switch/SwitchTab';
import AddTabModal from './modal/AddTabModal';
import Utils from '../../helpers/Utils';
import Api from '../../Api';
import { updateNodesCustomFieldsRequest } from '../../store/actions/nodes';
import '../../assets/styles/tabs.scss';
import TabHeader from './header/TabHeader';
import NodeInfoHeader from './header/NodeInfoHeader';

const getElement = (name) => document.querySelector(name);

const Tabs = ({ history, editable }) => {
  const { info: nodeId } = queryString.parse(window.location.search);

  const node = Chart.getNodes().find((n) => n.id === nodeId);

  if (!nodeId || !node) {
    return null;
  }

  const dispatch = useDispatch();

  const singleGraph = useSelector(getSingleGraph);

  const nodeCustomFields = useSelector(getCustomField);

  const [mode, setMode] = useState('general');

  const [activeTab, setActiveTab] = useState('_description');

  const [openAddTab, setOpenAddTab] = useState(null);

  useEffect(() => {
    dispatch(getNodeCustomFieldsRequest(graphId, nodeId));

    moveAutoPlay();

    if (activeTab !== '_description') updateTabWithFile();
  }, []);

  const { id: graphId } = singleGraph;

  const moveAutoPlay = () => {
    const left = document.querySelector('.tab_list') ? '660px' : '460px';

    // move autoplay right
    getElement('#autoPlay').style.right = left;
    getElement('.graphControlPanel').style.right = left;
  };

  const updateTabWithFile = () => {
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

  return (
    <>
      <div className="tab-wrapper">
        <NodeInfoHeader node={node} history={history} />
        <SwitchTab
          mode={mode}
          moveAutoPlay={moveAutoPlay}
          graphId={graphId}
          nodeId={nodeId}
          node={node}
          editable={editable}
          activeTab={activeTab}
          setActiveTab={(tabName) => setActiveTab(tabName)}
          nodeCustomFields={nodeCustomFields}
          setOpenAddTab={(tab) => setOpenAddTab(tab)}
        />
        <TabHeader
          mode={mode}
          setMode={setMode}
          node={node}
          singleGraph={singleGraph}
          activeTab={activeTab}
          editable={editable}
          nodeCustomFields={nodeCustomFields}
          setActiveTab={setActiveTab}
          setOpenAddTab={setOpenAddTab}
        />
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
    </>
  );
};

Tabs.propTypes = {
  history: PropTypes.object.isRequired,
  editable: PropTypes.bool.isRequired,
};

export default withRouter(Tabs);
