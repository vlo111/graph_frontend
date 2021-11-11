import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import General from '../content/General';
import Tab from '../content/Tab';
import Comment from '../content/Comment';

const getElement = (name) => document.querySelector(name);

const TabHeader = ({ mode, setMode }) => {
  const usePrevious = (value) => {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  };

  const prevMode = usePrevious(mode);

  const tabWrapperElem = getElement('.tab-wrapper');

  if (tabWrapperElem) {
    setTimeout(() => {
      if (tabWrapperElem.style.transform === 'scaleX(0)') {
        tabWrapperElem.style.transform = 'scaleX(1)';
      } else {
        tabWrapperElem.style.transform = 'scaleX(0)';
      }
    }, 50);
  }

  useEffect(() => {
    const tabNamesElem = getElement('.tab_list');

    if (mode === 'tabs') {
      if (!tabNamesElem.style.transform || tabNamesElem.style.transform === 'scaleX(0)') {
        tabNamesElem.style.transform = 'scaleX(1)';
      } else {
        tabNamesElem.style.transform = 'scaleX(0)';
      }
    }

    if (prevMode === 'tabs') {
      tabNamesElem.style.transform = 'scaleX(0)';
      getElement('#autoPlay').style.right = '460px';
      getElement('.graphControlPanel').style.right = '460px';
    }
  }, [mode]);

  return (
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
  );
};

TabHeader.propTypes = {
  mode: PropTypes.string.isRequired,
  setMode: PropTypes.func.isRequired,
};

export default TabHeader;
