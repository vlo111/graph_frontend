import React, { useState } from 'react';
import Button from '../form/Button';

import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';

const SelectSearchList = ({ search, deleteSelectSearchItem }) => {
  const [serachData, setSerachData] = useState('');
  return (
    <>
      <div className="select-search-list">

        <div className="select-search-list__name">
          {search.search}
        </div>
        <div className="select-search-list__title">
          <Button
            icon={<CloseSvg style={{ height: 30 }} />}
            onClick={() => deleteSelectSearchItem()}
            className="transparent"
          />
        </div>
      </div>

    </>
  );
};
export default SelectSearchList;
