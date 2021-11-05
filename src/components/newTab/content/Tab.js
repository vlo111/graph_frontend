import React, { useState } from 'react';
import { ReactComponent as DeleteSvg } from '../../../assets/images/icons/delete.svg';
import Button from '../../form/Button';
import { ReactComponent as EditSvg } from '../../../assets/images/icons/edit.svg';
import { ReactComponent as ExpandTabSvg } from '../../../assets/images/icons/expand.svg';

const Tab = ({
  node, customFields,
  editable = true, name, openAddTabModal, deleteCustomField,
}) => {
  const html = customFields.find((f) => f.name === name)?.value || '';

  const [expandNode, setExpandNode] = useState(false);

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

  return (
    <div className="tab_content">
      <div className="tab_content-header">
        <p className="tab_content-header-text">{name === '_description' ? 'Description' : name}</p>
        <div className="tab_content-header-icons">
          <>
            {editable && (
            <>
              <Button
                icon={<EditSvg />}
                title="Edit"
                onClick={(ev) => openAddTabModal(ev, name)}
              />
              <div onClick={expand} className="expand">
                <ExpandTabSvg />
              </div>
              {name !== '_description'
                  && (
                  <Button
                    icon={<DeleteSvg />}
                    title="Delete"
                  />
                  )}
            </>
            )}
          </>
        </div>
      </div>
      <div style={contentStyle} className="tab_content-description">
        {name === '_description'
          ? <div dangerouslySetInnerHTML={{ __html: node.description }} />
          : <div dangerouslySetInnerHTML={{ __html: html }} />}
      </div>
    </div>
  );
};

Tab.propTypes = {};

export default Tab;
