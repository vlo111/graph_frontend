import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { setActiveButton } from '../../store/actions/app';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Button from '../form/Button';
import { getDocumentsRequest } from '../../store/actions/document';
import NodeIcon from '../NodeIcon';
import Loading from '../Loading';

class MediaModal extends Component {
    static propTypes = {
      setActiveButton: PropTypes.func.isRequired,
      getDocumentsRequest: PropTypes.func.isRequired,
      documentSearch: PropTypes.object.isRequired,
    }

    constructor() {
      super();
      this.state = { loading: true };
    }

    closeModal = () => {
      this.props.setActiveButton('create');
    }

    searchDocuments = memoizeOne((searchParam) => {
      this.props.getDocumentsRequest(searchParam);
    })

    componentDidMount() {
      if (this.state.loading) {
        const { documentSearch } = this.props;
        if (documentSearch && documentSearch.length) {
          this.setState({ loading: false });
        }
      }
    }

    render() {
      const { documentSearch } = this.props;
      const { loading } = this.state;
      const graphIdParam = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
      this.searchDocuments(graphIdParam);
      if (documentSearch && documentSearch.length) {
        if (loading) {
          this.setState({ loading: false });
        }
        documentSearch.sort((a, b) => a.nodeType.localeCompare(b.nodeType));
        documentSearch.map((p) => {
          if (p.graphs?.nodes && p.graphs?.nodes.length) {
            p.node = p.graphs.nodes.filter((n) => n.id === p.nodeId)[0];
          }
        });
      }

      return (
        <div className="mediaModal">
          <Modal
            isOpen
            className="ghModal ghModalMedia"
            overlayClassName="ghModalOverlay"
            onRequestClose={this.closeModal}
          >
            <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeModal} />
            <div className="mediaHeader">
              <h2>Media gallery</h2>
            </div>
            {documentSearch && documentSearch.length
              ? (
                <div className="searchData">
                  <div className="searchData__wrapper mediaContent">
                    <div className="searchMediaContent">
                      <article className="searchData__graph mediaForm">
                        <div className="searchDocumentContent mediaGallery">
                          {documentSearch.map((document, index, array) => (
                            document.id && (
                            <div
                              style={document.nodeType !== array[index === 0 ? index : index - 1].nodeType
                                ? { gridColumnEnd: 2 } : {}}
                              className="nodeTabs tabDoc"
                            >
                              <div className="imageFrame">
                                <a
                                  className="nodeLink"
                                  href={`/graphs/update/${document.graphId}?info=${document.nodeId}`}
                                >
                                  <div className="left">
                                    <NodeIcon node={document.node} />
                                  </div>
                                  <div className="right">
                                    <span className="headerName">{document.node.name}</span>
                                    <p>{moment(document.updatedAt).calendar()}</p>
                                  </div>
                                </a>

                                <p className="createdBy">
                                  <span>uploaded by </span>
                                  <Link to={`/profile/${document.user.id}`}>
                                    {`${document.user.firstName} ${document.user.lastName}`}
                                  </Link>
                                </p>
                                <table className="mediaTable">
                                  <tbody>
                                    <tr>
                                      <td>
                                        <div className="mediaTumbnail">
                                          <div className="container">
                                            {document.type.includes('image') ? (
                                              <a target="_blank" href={document.data}>
                                                <img
                                                  src={document.data}
                                                  width="300px"
                                                />
                                              </a>
                                            ) : (
                                              <a className="linkDocumentDownload" download={document.altText} href={document.data}>
                                                <div className="docContainer">
                                                  <div className="docFrame">
                                                    {document.data.split('.').pop().toUpperCase()}
                                                  </div>
                                                </div>
                                              </a>
                                            )}
                                          </div>
                                          <p title={document.description}>
                                            { document.description && document.description.length > 50
                                              ? `${document.description.substr(0, 50)}... `
                                              : document.description}
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            )
                          ))}
                        </div>
                      </article>
                    </div>
                  </div>
                </div>
              )
              : (!loading
                ? <Loading />
                : <h3 className="mediaNotFound">No Media Gallery Found</h3>)}
          </Modal>
        </div>
      );
    }
}

const mapStateToProps = (state) => ({
  documentSearch: state.document.documentSearch,
});

const mapDispatchToProps = {
  setActiveButton,
  getDocumentsRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MediaModal);

export default Container;
