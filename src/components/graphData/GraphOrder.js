import React, { useState } from 'react';
import _ from 'lodash';
import Outside from '../Outside'

const GraphOrder = ({ showFilterModal, toggleDropDown, currentTab, filter }) => {

    let localOrder = JSON.parse(localStorage.getItem(currentTab)) || 'newest';
    
    let [order, setOrder] = useState(localOrder);

    function setFilter(value) {
        
        localStorage.setItem(currentTab, JSON.stringify(value));
    
        filter(value)

        setOrder(value)
    }

    return(
        showFilterModal && <div className="filter">
        <Outside onClick={toggleDropDown} exclude=".filter">
        <div className="filter-container">
            <p className="sort-text"> Sort by </p>
            <p className={localOrder === 'ascending' ? localOrder : ''} onClick={() => setFilter('ascending')} >A to Z</p>
            <p className={localOrder === 'descending' ? localOrder : ''} onClick={() => setFilter('descending')} >Z to A</p>
            <p className={localOrder === 'newest' ? localOrder : ''} onClick={() => setFilter('newest')} >Newest first</p>
            <p className={localOrder === 'oldest' ? localOrder : ''} onClick={() => setFilter('oldest')} >Oldest first</p>
          </div>
          </Outside>
        </div>
        );
}

export default GraphOrder;
