import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import { Link } from 'react-router-dom';
import LazyLoad from 'react-lazyload';
import { setActiveButton } from '../../store/actions/app';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Button from '../form/Button';
import { getDocumentsRequest } from '../../store/actions/document';
import NodeIcon from '../NodeIcon';
import Loading from '../Loading';
import { getSingleGraphRequest } from '../../store/actions/graphs';

class MediaModal extends Component {
    static propTypes = {
      getSingleGraphRequest: PropTypes.func.isRequired,
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
      this.resetGraph();
    }

    resetGraph = () => {
      const { id } = this.props.singleGraph;
      this.props.getSingleGraphRequest(id);
    }

    render() {
      const { documentSearch, singleGraph } = this.props;

      const { nodes } = singleGraph;

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
      if (nodes && nodes.length) {
        nodes.map((node) => {
          if (node.icon) {
            if (!documentSearch.filter((p) => p.added === node.id).length) {
              documentSearch.push({
                id: node.id,
                user: singleGraph.user,
                node,
                data: node.icon,
                nodeId: node.id,
                nodeName: node.name,
                nodeType: node.type,
                added: node.id,
                type: 'image',
              });
            }
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
            <hr className="line mediaLine" />
            <LazyLoad height={50} offset={500} unmountIfInvisible>
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
                                // style={!document.added
                                //     && document.nodeType !== array[index === 0 ? index : index - 1].nodeType
                                //   ? { gridColumnEnd: 2 } : {}}
                                className="nodeTabs tabDoc"
                              >
                                <div className="imageFrame">
                                  <div className="imageFrameHeader">
                                    <a
                                      className="nodeLink"
                                      href={`/graphs/update/${document.graphId}?info=${document.nodeId}`}
                                    >
                                      <div className="left">
                                        <NodeIcon node={document.node} />
                                      </div>
                                      <div className="right">
                                        <span title={document.node.name} className="headerName">
                                          { document.node.name && document.node.name.length > 12
                                            ? `${document.nodeName.substr(0, 12)}... `
                                            : document.nodeName}
                                        </span>
                                        <p>{moment(document.updatedAt).calendar()}</p>
                                      </div>
                                    </a>

                                  <p className="createdBy">
                                    <span>uploaded by </span>
                                    <Link to={`/profile/${document.user.id}`}>
                                      {`${document.user.firstName} ${document.user.lastName}`}
                                    </Link>
                                  </p>
                                </div>

                                <div className="gallery-box-container">
                                  <a href="#" className="gallery-box">
                                    <span className="gallery-box__img-container">
                                      <figure className="img-container">
                                        {document.type.includes('image') ? (
                                          <a target="_blank" href={document.data}>
                                            <img
                                              className="gallery-box__img"
                                              src={document.data}
                                            />
                                          </a>
                                        ) : (
                                          <a
                                            className="linkDocumentDownload"
                                            download={document.altText}
                                            href={document.data}
                                          >
                                            <div className="docContainer">
                                              <div title={document.altText} className="docFrame">
                                                  {document.altText}
                                                </div>
                                              </div>
                                            </a>
                                          )}
                                        </figure>
                                      </span>
                                      <span className="gallery-box__text-wrapper">
                                        <span title={document.description} className="gallery-box__text">
                                          { document.added
                                            ? (document.nodeType)
                                            : (document.description && document.description.length > 38
                                              ? `${document.description.substr(0, 38)}... `
                                              : document.description)
                                          }
                                        </span>
                                      </span>
                                    </a>
                                  </div>
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
            </LazyLoad>
          </Modal>
        </div>
      );
    }
}

const mapStateToProps = (state) => ({
  documentSearch: state.document.documentSearch,
  singleGraph: state.graphs.singleGraph,
});

const mapDispatchToProps = {
  setActiveButton,
  getDocumentsRequest,
  getSingleGraphRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MediaModal);

export default Container;
