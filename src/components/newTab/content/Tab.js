import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import moment from 'moment';
import { ReactComponent as DeleteSvg } from '../../../assets/images/icons/delete.svg';
import Button from '../../form/Button';
import { ReactComponent as EditSvg } from '../../../assets/images/icons/edit.svg';
import { ReactComponent as ExpandTabSvg } from '../../../assets/images/icons/expand.svg';
import ModalConfirmation from '../../../helpers/ModalConfirmation';
import { updateNodesCustomFieldsRequest } from '../../../store/actions/nodes';
import ExpandSingleTab from '../expand/ExpandSingleTab';

const Tab = ({
  node, customFields,
  editable = true, name, setOpenAddTab, setActiveTab, graphId,
}) => {
  const dispatch = useDispatch();

  const html = customFields.find((f) => f.name === name)?.value || '';

  const [expandNode, setExpandNode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const expand = () => {
    setExpandNode(!expandNode);
  };

  /* @todo get document elements size
    * 56 graph header height
    * 40 - switch tabs header
    * 20 - tab header
    * 50 - padding tab header content
    *  */
  const height = window.innerHeight - 56 - 40 - 20 - 50;

  const contentStyle = {
    height,
  };

  const noTab = <div className="tab_content-description-nodata">you have no data yet</div>;

  let description;
  let tab;
  let expandTab;
  let editOrPlus;

  const editElement = (
    <Button
      icon={<EditSvg />}
      title="Edit"
      onClick={() => setOpenAddTab(name)}
    />
  );

  const plusElement = (
    <Button
      // icon={<EditSvg />}
      title="Add"
      onClick={() => setOpenAddTab(name)}
    >
      +
    </Button>
  );

  const expandElement = (
    <Button
      className="expand"
      icon={<ExpandTabSvg />}
      title="expand"
      onClick={() => setExpandNode(!expandNode)}
    />
  );

  if (name === '_description') {
    if (node.description) {
      editOrPlus = editElement;
      expandTab = expandElement;
      description = <div dangerouslySetInnerHTML={{ __html: node.description }} />;
    } else {
      editOrPlus = plusElement;
      description = noTab;
      expandTab = <></>;
    }
  } else if (html) {
    editOrPlus = editElement;
    expandTab = expandElement;
    tab = <div dangerouslySetInnerHTML={{ __html: html }} />;
  } else {
    editOrPlus = plusElement;
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

  return (
    <div className="tab_content">
      <div className="tab_content-header">
        <p className="tab_content-header-text">{name === '_description' ? 'Description' : name}</p>
        <div className="tab_content-header-icons">
          <>
            {editable && (
            <>
              {editOrPlus}
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
            {expandTab}
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
      {expandNode
      && (
      <ExpandSingleTab
        html={html || node.description}
        name={name}
        created={moment(node.createdAt * 1000).format('DD/MM/YYYY hh:mm A')}
        createdBy={node.userId}
        onClose={expand}
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
