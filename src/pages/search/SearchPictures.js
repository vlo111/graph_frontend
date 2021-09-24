import React, {Component} from 'react';
import {connect} from 'react-redux';
import queryString from 'query-string';
import {Link, withRouter} from 'react-router-dom';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import {getDocumentsByTagRequest} from '../../store/actions/document';
import SearchMediaPart from "./SearchMediaPart";
import Utils from "../../helpers/Utils";

class SearchPictures extends Component {
  static propTypes = {
    setLimit: PropTypes.bool,
    documentSearch: PropTypes.object.isRequired,
    getDocumentsByTagRequest: PropTypes.func.isRequired,
    currentUserId: PropTypes.number.isRequired,
  };

  searchDocuments = memoizeOne((searchParam) => {
    this.props.getDocumentsByTagRequest(searchParam);
  })

  render() {
    let {setLimit, documentSearch} = this.props

    const {s: searchParam} = queryString.parse(window.location.search);

    this.searchDocuments(searchParam);

    if (documentSearch.length) {
      documentSearch = documentSearch.filter(p => {
        return Utils.isImg(p.data.substring(p.data.lastIndexOf('.') + 1, p.data.length))
      });
    }

    return (
        <div className="searchData">
          <div className="searchData__wrapper">
<<<<<<< HEAD
            {documentSearch?.length ? <h3>Pictures</h3> : null}
            <SearchMediaPart setLimit={setLimit} mediaMode={'picture'} data={documentSearch} history={this.props.history} />
            {setLimit && documentSearch.length > 5
            && <div className="viewAll"><Link to={`search-documents?s=${searchParam}`}>View all</Link>
            </div>}
=======
            <h3>Pictures</h3>
            {Object.keys(users).map((item) => (
              <div>
                {Object.keys(users[item]).map((graph) => (
                  users[item].user?.id && users[item][graph].length
                    ? (
                      <div className="searchMediaContent">
                        <article key={users[item].user.id} className="searchData__graph">
                          <div className="searchData__graphInfo">
                            <div>
                              <h3>{users[item][graph][0].graphName}</h3>
                            </div>
                            <div className="searchData__graphInfo-details">
                              <p className="createdBy">
                                <span>created by </span>
                                <Link to={`/profile/${users[item].user.id}`}>
                                  {`${users[item].user.firstName} ${users[item].user.lastName}`}
                                </Link>
                              </p>
                              <p className="createdBy">{moment(users[item][graph][0].graphCreated).calendar()}</p>
                            </div>
                          </div>
                          <hr className="line" />
                          <div className="searchDocumentContent">
                            {users[item][graph].map((document, index, array) => (
                              document.id && (
                                <div
                                  style={document.nodeType !== array[index === 0 ? index : index - 1].nodeType
                                    ? { gridColumnEnd: 2 } : {}}
                                  className="nodeTabs tabDoc"
                                >
                                  <p
                                    className="nodeLink"
                                    onClick={() => this.goToNodeTab(
                                      document.graphId,
                                      document.node,
                                      users[item].user.id,
                                    )}
                                  >
                                    <div className="left">
                                      {document.node &&<NodeIcon node={document.node} />}
                                    </div>
                                    <div className="right">
                                      <span className="headerName">{document.node?.name}</span>
                                      <span className="type">{document.node?.type}</span>
                                    </div>
                                  </p>
                                  {document.altText
                                    ? <a target="_blank" href={document.data}>{document.altText}</a>
                                    : (
                                      <table className="mediaTable">
                                        <tbody>
                                          <tr>
                                            <td>
                                              <div className="mediaTumbnail">
                                                <div className="container">
                                                  <a target="_blank" href={document.data}>
                                                    <img
                                                      target="_blank"
                                                      src={document.data}
                                                      width="300px"
                                                    />
                                                  </a>
                                                </div>
                                                <p title={document.description}>
                                                  { document.description && document.description.length > 59
                                                    ? `${document.description.substr(0, 59)}... `
                                                    : document.description}
                                                </p>
                                              </div>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    )}
                                </div>
                              )
                            ))}
                          </div>
                        </article>
                      </div>
                    ) : <div />
                ))}
              </div>
            ))}
            {
              setLimit && document.length > 5
              && <div className="viewAll"><Link to={`search-documents?s=${searchParam}`}>View all</Link></div>
            }
>>>>>>> origin/master
          </div>
        </div>
    );
  }

}

const mapStateToProps = (state) => ({
  currentUserId: state.account.myAccount.id,
  userSearch: state.account.userSearch,
  documentSearch: state.document.documentSearch,
});

const mapDispatchToProps = { getDocumentsByTagRequest, };
const Container = connect(
    mapStateToProps,
    mapDispatchToProps,
)(SearchPictures);

export default withRouter(Container);
