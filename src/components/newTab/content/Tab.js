import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { ReactComponent as DeleteSvg } from '../../../assets/images/icons/delete.svg';
import Button from '../../form/Button';
import { ReactComponent as EditSvg } from '../../../assets/images/icons/edit.svg';
import { ReactComponent as CloseSvg } from '../../../assets/images/icons/close.svg';
import { ReactComponent as NodeExpandTabSvg } from '../../../assets/images/icons/node-expand.svg';
import { ReactComponent as NodeShortenTabSvg } from '../../../assets/images/icons/node-shorten.svg';
import ModalConfirmation from '../../../helpers/ModalConfirmation';
import { updateNodesCustomFieldsRequest } from '../../../store/actions/nodes';
import { getNodeCustomFieldsRequest } from '../../../store/actions/graphs';
import Utils from '../../../helpers/Utils';

const getElement = (name) => document.querySelector(name);

const getMultyElements = (names) => document.querySelectorAll(names);

const Tab = ({
  node, customFields,
  editable = true, name, setOpenAddTab, setActiveTab, graphId,
  singleExpand: expand, setSingleExpand,
}) => {
  const dispatch = useDispatch();

  const html = customFields.find((f) => f.name === name)?.value || '';

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  /* @todo get document elements size
    * 56 graph header height
    * 40 - switch tabs header
    * 58 - tab header node info
    * 20 - tab header
    * 50 - padding tab header content
    *  */
  const height = window.innerHeight - 56 - 58 - 40 - 20 - 50;

  const contentStyle = {
    height,
  };

  const noTab = <div className="tab_content-description-nodata">you have no data yet</div>;

  const editElement = (
    <Button
      icon={<EditSvg />}
      title="Edit"
      onClick={() => setOpenAddTab(name)}
    />
  );

  const addElement = (
    <Button
      icon={<CloseSvg />}
      className="add"
      title="Add"
      onClick={() => setOpenAddTab(name)}
    />
  );

  const expandHandle = (ev) => {
    ev.stopPropagation();
    expandNode();
    setSingleExpand(!expand);
  };

  const expandElement = (
    <Button
      className="expand"
      icon={expand ? <NodeExpandTabSvg /> : <NodeShortenTabSvg />}
      title="expand"
      onClick={expandHandle}
    />
  );

  let description;
  let tab;
  let expandTab;
  let editOrAdd;

  if (name === '_description') {
    if (node.description) {
      editOrAdd = editElement;
      expandTab = expandElement;
      description = <div dangerouslySetInnerHTML={{ __html: node.description }} />;
    } else {
      editOrAdd = addElement;
      description = noTab;
      expandTab = <></>;
    }
  } else if (html) {
    editOrAdd = editElement;
    expandTab = expandElement;
    tab = <div dangerouslySetInnerHTML={{ __html: html }} />;
  } else {
    editOrAdd = addElement;
    tab = noTab;
    expandTab = <></>;
  }

  const deleteTab = () => {
    dispatch(updateNodesCustomFieldsRequest(graphId, [{
      id: node.id,
      customFields: customFields.filter((f) => f.name !== name),
      name,
    }]));
    setActiveTab('_description');
    setShowConfirmModal(false);
  };

  useEffect(() => {
    dispatch(getNodeCustomFieldsRequest(graphId, node.id));
  }, []);

  useEffect(() => {
    if (!expand) expandNode(true);
  }, [expand]);

  const expandNode = (enable) => {
    const tabElement = getElement('.tab-wrapper');
    const { body } = document;

    const enableEffect = () => {
      body.className = body.className.replace('node_expand', '');

      tabElement.style.width = '450px';
      getElement('.tab_list').style.right = '100%';
    };

    if (enable) {
      enableEffect();
    } else if (!expand) {
      body.className += ' node_expand';
      Utils.sleep(150).then(() => tabElement.style.width = 'calc(100% - 200px)');
    } else {
      enableEffect();
    }
  };

  return (
    <div className="tab_content">
      <div className="tab_content-header">
        <p className="tab_content-header-text">{name === '_description' ? 'Description' : name}</p>
        <div className="tab_content-header-icons">
          <>
            {editable && editOrAdd}
            {expandTab}
            {editable && (
            <>
              {name !== '_description'
              && (
              <Button
                icon={<DeleteSvg />}
                title="Delete"
                onClick={() => setShowConfirmModal(true)}
              />
              )}
            </>
            )}
          </>
        </div>
      </div>
      <div style={contentStyle} className="tab_content-description">
        {description}
        {tab}
      </div>
      {showConfirmModal
      && (
      <ModalConfirmation
        title="Are you sure ?"
        description="Are you want to delete this tab"
        yes="Delete"
        no="Cancel"
        onCancel={() => setShowConfirmModal(false)}
        onAccept={deleteTab}
      />
      )}
    </div>
  );
};

Tab.propTypes = {
  customFields: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  editable: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  setOpenAddTab: PropTypes.func.isRequired,
  graphId: PropTypes.string.isRequired,
};

export default Tab;
