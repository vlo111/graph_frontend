import React from 'react';
import PropTypes from 'prop-types';
import General from '../content/General';
import Tab from '../content/Tab';
import Comment from '../content/Comment';

const getElement = (name) => document.querySelector(name);

const TabHeader = ({
  mode, setMode, editable, node, nodeCustomFields,
  activeTab, singleGraph, setActiveTab, setOpenAddTab,
}) => {
  const { id: graphId } = singleGraph;

  const tabWrapperElem = getElement('.tab-wrapper');

  const tabNamesElem = getElement('.tab_list');

  if (tabWrapperElem) {
    setTimeout(() => {
      if (tabWrapperElem.style.transform === 'scaleX(0)') {
        tabWrapperElem.style.transform = 'scaleX(1)';
      } else {
        tabWrapperElem.style.transform = 'scaleX(0)';
      }
    }, 50);
  }

  if (tabNamesElem) {
    setTimeout(() => {
      if (tabNamesElem.style.transform === 'scaleX(0)') {
        tabNamesElem.style.transform = 'scaleX(1)';
      } else {
        tabNamesElem.style.transform = 'scaleX(0)';
      }
    }, 50);
  }

  return (
    <div className="tab">
      <div className="tab-header">
        <button
          type="submit"
          className={mode === 'general' ? 'tab-header-active' : 'tab-header-in-active'}
          onClick={() => {
            if (mode === 'tabs') {
              tabNamesElem.style.transform = 'scaleX(0)';
              getElement('#autoPlay').style.right = '460px';
              getElement('.graphControlPanel').style.right = '460px';

              setTimeout(() => {
                setMode('general');
              }, 400);
            } else {
              setMode('general');
            }
          }}
        >
          General
        </button>
        <button
          type="submit"
          className={mode === 'tabs' ? 'tab-header-active' : 'tab-header-in-active'}
          onClick={() => {
            setMode('tabs');
          }}
        >
          Tabs
        </button>
        <button
          type="submit"
          className={mode === 'comments' ? 'tab-header-active' : 'tab-header-in-active'}
          onClick={() => {
            if (mode === 'tabs') {
              tabNamesElem.style.transform = 'scaleX(0)';
              getElement('#autoPlay').style.right = '460px';
              getElement('.graphControlPanel').style.right = '460px';

              setTimeout(() => {
                setMode('comments');
              }, 400);
            } else {
              setMode('comments');
            }
          }}
        >
          Comments
        </button>
      </div>
      <div className="tab-container">
        {mode === 'general'
          && (
          <General
            editable={editable}
            node={node}
          />
          )}
        {mode === 'tabs'
          && (
          <Tab
            node={node}
            graphId={graphId}
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
  );
};

TabHeader.propTypes = {
  nodeCustomFields: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  editable: PropTypes.bool.isRequired,
  setOpenAddTab: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  activeTab: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
  singleGraph: PropTypes.object.isRequired,
};

export default TabHeader;
