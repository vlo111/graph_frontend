import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { ReactComponent as ArrowLeftSvg } from '../../assets/images/icons/tab-arrow-left.svg';
import { ReactComponent as ArrowRightSvg } from '../../assets/images/icons/tab-arrow-right.svg';

const SwitchTab = ({
  mode, nodeCustomFields, setActiveTab, setMode, activeTab, moveAutoPlay, setOpenAddTab,
}) => {
  /* @todo get document elements size
   * 56 graph header height
   * 100 - add tab block
   * 20 - padding from button
   *  */

  const height = window.innerHeight - 56 - 100 - 20;

  const contentStyle = {
    height,
  };

  const [openTabNames, setOpenTabNames] = useState(false);

  useEffect(() => {
    moveAutoPlay();
  });

  return (
    <>
      {mode === 'tabs'
      && openTabNames && (
      <div className="tab_list">
        <div className="tab_list-header">
          <div className="tab_list-header-text">{`Tabs (${nodeCustomFields.length + 1})`}</div>
          <div className="tab_list-header-add" onClick={() => setOpenAddTab(true)}>+ add tab</div>
        </div>
        <div style={contentStyle} className="tab_list-content">
          {(activeTab === '_description')
            ? (
              <div
                className="tab_list-content-active tab_list-content-item"
                onClick={() => setActiveTab('_description')}
              >
                Description
              </div>
            ) : (
              <div
                className="tab_list-content-item"
                onClick={() => setActiveTab('_description')}
              >
                Description
              </div>
            )}
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
    </>
  );
};

SwitchTab.propTypes = {
  nodeCustomFields: PropTypes.object.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  setMode: PropTypes.func.isRequired,
  moveAutoPlay: PropTypes.func.isRequired,
  mode: PropTypes.object.isRequired,
  setOpenAddTab: PropTypes.func.isRequired,
  activeTab: PropTypes.object.isRequired,
};

export default withRouter(SwitchTab);
