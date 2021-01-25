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
              <h1>Media gallery</h1>
            </div>
            {documentSearch && documentSearch.length
              ? (
                <div className="searchData">
                  <div className="searchData__wrapper">
                    <div className="searchMediaContent">
                      <article className="searchData__graph">
                        <div className="searchDocumentContent mediaGallery">
                          {documentSearch.map((document, index, array) => (
                            document.id && (
                            <div
                              style={document.nodeType !== array[index === 0 ? index : index - 1].nodeType
                                ? { gridColumnEnd: 2 } : {}}
                              className="nodeTabs tabDoc"
                            >
                              <a
                                className="nodeLink"
                                href={`/graphs/update/${document.graphId}?info=${document.nodeId}`}
                              >
                                <div className="left">
                                  <NodeIcon node={document.node} />
                                </div>
                                <div className="right">
                                  <span className="name">{document.node.name}</span>
                                  <span className="type">{document.node.type}</span>
                                </div>
                              </a>

                              <p>{moment(document.updatedAt).calendar()}</p>
                              <p className="createdBy">
                                <span>uploaded by </span>
                                <Link to={`/profile/${document.user.id}`}>
                                  {`${document.user.firstName} ${document.user.lastName}`}
                                </Link>
                              </p>
                              {
                                  document.altText ? (
                                    <a target="_blank" href={document.data}>
                                      {document.altText}
                                    </a>
                                  ) : (
                                    <table className="mediaTable">
                                      <tbody>
                                        <tr>
                                          <td>
                                            <div className="mediaTumbnail">
                                              <div className="container">
                                                <a target="_blank" href={document.data}>
                                                  <img
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
                                  )
                              }
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
            <div className="buttonsWrapper">
              <Button color="transparent" className="cancel" onClick={this.closeModal}>cancel</Button>
            </div>
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
