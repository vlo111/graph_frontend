import React, { Component } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { Link, withRouter } from 'react-router-dom';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getDocumentsByTagRequest } from '../../store/actions/document';

class SearchDocuments extends Component {
    static propTypes = {
      setLimit: PropTypes.bool,
      documentSearch: PropTypes.object.isRequired,
      getDocumentsByTagRequest: PropTypes.func.isRequired,
      currentUserId: PropTypes.number.isRequired,
    };

    static defaultProps = {
      setLimit: false,
    }

    searchDocuments = memoizeOne((searchParam) => {
      this.props.getDocumentsByTagRequest(searchParam);
    })

    goToNodeTab = (graphId, nodeId, userId) => {
      const { currentUserId } = this.props;
      const mode = currentUserId === userId ? 'update' : 'view';
      this.props.history.replace(`/graphs/${mode}/${graphId}?info=${nodeId}`);
    }

    render() {
      const { setLimit, documentSearch } = this.props;
      const { s: searchParam } = queryString.parse(window.location.search);
      this.searchDocuments(searchParam);
      let users = {};
      if (documentSearch.length) {
        documentSearch.sort((a, b) => a.nodeType.localeCompare(b.nodeType));

        const groupByUserId = (array, key) => array.reduce((result, obj) => {
          (result[obj[key]] = result[obj[key]] || []).push(obj);
          if (obj.user && !result[obj[key]].user) {
            result[obj[key]].user = obj.user;
          }
          return result;
        }, {});
        users = groupByUserId(documentSearch, 'userId');
      }

      return (
        <div className="searchData">
          {Object.keys(users) && Object.keys(users).length ? (
            <div className="searchData__wrapper">
              <h3>Documents</h3>
              {Object.keys(users).slice(0, 5).map((item) => (
                <div className="searchMediaContent">
                  <article key={users[item].user.id} className="searchData__graph">
                    <div className="searchData__graphInfo">
                      <img
                        className="avatar"
                        src={users[item].user.avatar}
                        alt={users[item].user.firstName}
                      />
                      <div className="searchData__graphInfo-details">
                        <Link to={`/profile/${users[item].user.id}`}>
                          {`${users[item].user.firstName} ${users[item].user.lastName}`}
                        </Link>
                        <span className="description">
                          {users[item].user.email}
                        </span>
                      </div>
                    </div>
                    <div className="searchDocumentContent">
                      {users[item].map((document, index, array) => (
                        document.id && (
                         <div
                          style={document.nodeType !== array[index === 0 ? index : index - 1].nodeType
                            ? { gridColumnEnd:2 } : {}}
                          className="nodeTabs tabDoc"
                        >
                          <p
                            onClick={() => this.goToNodeTab(document.graphId, document.nodeId, users[item].user.id)}
                            className="nodeName"
                          >
                            {document.nodeName}
                          </p>

                          <p className="nodeType">{document.nodeType}</p>
                          <p>{moment(document.updatedAt).calendar()}</p>
                          {
                              document.altText
                                ? <a download={document.altText} href={document.data}>{document.altText}</a>
                                : (
                                  <a download={document.name} href={document.data}>{document.name}</a>
                                )
                          }
                        </div>
                        )
                      ))}
                    </div>

                  </article>
                </div>
              ))}
              {
                  setLimit && document.length > 5
                  && <div className="viewAll"><Link to={`search-documents?s=${searchParam}`}>View all</Link></div>
              }
            </div>
          ) : ((!setLimit && <h3>No Documents Found</h3>) || null)}
        </div>
      );
    }
}

const mapStateToProps = (state) => ({
  currentUserId: state.account.myAccount.id,
  userSearch: state.account.userSearch,
  documentSearch: state.document.documentSearch,
});
const mapDispatchToProps = {
  getDocumentsByTagRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchDocuments);

export default withRouter(Container);
