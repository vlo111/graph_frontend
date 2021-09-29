import React, { Component } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { Link, withRouter } from 'react-router-dom';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import { getDocumentsByTagRequest } from '../../store/actions/document';
import SearchMediaPart from './SearchMediaPart';
import Utils from '../../helpers/Utils';

class SearchPictures extends Component {
  static propTypes = {
    setLimit: PropTypes.bool.isRequired,
    documentSearch: PropTypes.object.isRequired,
    getDocumentsByTagRequest: PropTypes.func.isRequired,
    history: PropTypes.string.isRequired,
  };

  searchDocuments = memoizeOne((searchParam) => {
    this.props.getDocumentsByTagRequest(searchParam);
  })

  render() {
    let { documentSearch } = this.props;
    const { setLimit } = this.props;

    const { s: searchParam } = queryString.parse(window.location.search);

    this.searchDocuments(searchParam);

    if (documentSearch.length) {
      documentSearch = documentSearch.filter(
        (p) => Utils.isImg(p.data.substring(p.data.lastIndexOf('.') + 1, p.data.length)),
      );
    }

    return (
      <div className="searchData">
        <div className="searchData__wrapper">
          {documentSearch?.length ? <h3>Pictures</h3> : null}
          <SearchMediaPart setLimit={setLimit} mediaMode="picture" data={documentSearch} history={this.props.history} />
          {setLimit && documentSearch.length > 5
            && (
            <div className="viewAll">
              <Link to={`search-documents?s=${searchParam}`}>View all</Link>
            </div>
            )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userSearch: state.account.userSearch,
  documentSearch: state.document.documentSearch,
});

const mapDispatchToProps = { getDocumentsByTagRequest };
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchPictures);

export default withRouter(Container);
