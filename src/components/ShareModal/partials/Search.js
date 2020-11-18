import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import SearchData from './SearchData';
import { getUsersByTextRequest } from '../../../store/actions/account';
import { updateShareGraphStatusRequest } from '../../../store/actions/shareGraphs';
import Button from '../../form/Button';

const Search = ({ select, setSelect, user, closeModal }) => {
  const dispatch = useDispatch();
  const options = useSelector((state) => state.account.userSearch);
  const graph = useSelector((state) => state.graphs.singleGraph);
  const [isLoading, setIsLoading] = useState(false);
  const refTypeahead = useRef();

  const handleSearch = async (query) => {
    setIsLoading(true);
    await dispatch(getUsersByTextRequest(query));
    setIsLoading(false);
  };

  const changeStatus = async () => {
    await dispatch(updateShareGraphStatusRequest({ graphId: graph.id }));
    closeModal();
  }

  return (
    <div className="share-modal__search-user">
      <AsyncTypeahead
        id="search-user"
        className="ghInput share-modal__search"
        isLoading={isLoading}
        labelKey={option =>`${option.firstName} ${option.lastName} ${option.email}`}
        minLength={3}
        onSearch={handleSearch}
        options={options}
        placeholder="Search user..."
        ref={refTypeahead}
        onChange={(selected) => selected && refTypeahead.current.clear()}
        renderMenuItemChildren={(option, props) => <SearchData user={user} option={option} select={select} setSelect={setSelect} />}
      />
      <Button
            onClick={() => changeStatus()}
        >Save</Button>
    </div>
  );
};

Search.propTypes = {
  select: PropTypes.array.isRequired,
  setSelect: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

export default Search;
