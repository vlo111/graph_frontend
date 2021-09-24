import React, {Component} from 'react';
import {connect} from 'react-redux';
import queryString from 'query-string';
import {Link, withRouter} from 'react-router-dom';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import {getDocumentsByTagRequest} from '../../store/actions/document';
import SearchMediaPart from "./SearchMediaPart";
import Utils from "../../helpers/Utils";

class SearchDocuments extends Component {
    static propTypes = {
        setLimit: PropTypes.bool,
        documentSearch: PropTypes.object.isRequired,
        getDocumentsByTagRequest: PropTypes.func.isRequired,
        currentUserId: PropTypes.number.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {loading: true};
    }

    static defaultProps = {
        setLimit: false,
    }

    searchDocuments = memoizeOne((searchParam) => {
        this.props.getDocumentsByTagRequest(searchParam);
    })

    render() {
        let {setLimit, documentSearch} = this.props


        const {s: searchParam} = queryString.parse(window.location.search);

        this.searchDocuments(searchParam);

        if (documentSearch.length) {
            documentSearch = documentSearch.filter(p => {
                return !Utils.isImg(p.data.substring(p.data.lastIndexOf('.') + 1, p.data.length))
            });
        }

<<<<<<< HEAD
        return (
            <div className="searchData">
                <div className="searchData__wrapper">
                    {documentSearch?.length ? <h3>Documents</h3> : null}
                    <SearchMediaPart setLimit={setLimit} mediaMode={'document'} data={documentSearch} history={this.props.history} />
                    {setLimit && documentSearch.length > 5
                    && <div className="viewAll"><Link to={`search-documents?s=${searchParam}`}>View all</Link>
                    </div>}
=======
      return (
        <div className="searchData">
          {Object.keys(users) && Object.keys(users).length ? (
            <div className="searchData__wrapper">
              <h3>Documents</h3>
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
                                        <NodeIcon node={document.node} />
                                      </div>
                                      <div className="right">
                                        <span className="headerName">{document.node.name}</span>
                                        <span className="type">{document.node.type}</span>
                                      </div>
                                    </p>
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
                        ) : <div />
                  ))}
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
)(SearchDocuments);

export default withRouter(Container);
