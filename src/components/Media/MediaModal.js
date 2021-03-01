import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import moment from 'moment';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { setActiveButton } from '../../store/actions/app';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Button from '../form/Button';
import { getDocumentsRequest } from '../../store/actions/document';
import NodeIcon from '../NodeIcon';
import { getSingleGraphRequest, setActiveTab } from '../../store/actions/graphs';
import Checkbox from '../form/Checkbox';
import ChartUtils from '../../helpers/ChartUtils';
import Input from '../form/Input';

class MediaModal extends Component {
    static propTypes = {
      getSingleGraphRequest: PropTypes.func.isRequired,
      setActiveButton: PropTypes.func.isRequired,
      getDocumentsRequest: PropTypes.func.isRequired,
      documentSearch: PropTypes.object.isRequired,
      setActiveTab: PropTypes.func.isRequired,
    }

    constructor() {
      super();
      this.state = {
        loading: true,
        getCheckedNodes: true,
        getCheckedDocs: true,
        getCheckedImages: true,
        getCheckedVideos: true,
        search: '',
      };
      this.iframes = [];
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

    filterHandleChange = (path, value) => {
      switch (path) {
        case 'docs': {
          this.setState({
            getCheckedDocs: value,
          });
          break;
        }
        case 'images': {
          this.setState({
            getCheckedImages: value,
          });
          break;
        }
        case 'videos': {
          this.setState({
            getCheckedVideos: value,
          });
          break;
        }
        case 'nodes': {
          this.setState({
            getCheckedNodes: value,
          });
          break;
        }
        default:
          break;
      }
      const { getChecked } = this.state;
      _.set(getChecked, path, value);
    }

    searchHandleChange = (search = '') => {
      this.setState({ search });
    }

    openTab = (graphId, node, tabName) => {
      ChartUtils.findNodeInDom(node);
      this.closeModal();

      if (tabName) {
        this.props.setActiveTab(tabName);
        this.props.history.replace(`${graphId}?info=${node.id}`);
      }
    }

    render() {
      let { documentSearch, singleGraph } = this.props;

      const { nodes } = singleGraph;

      const {
        getCheckedNodes, getCheckedDocs, getCheckedImages, getCheckedVideos, search,
      } = this.state;
      console.log(search);
      const graphIdParam = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
      this.searchDocuments(graphIdParam);

      // Node documents and images of tabs
      if (documentSearch && documentSearch.length) {
        documentSearch.map((p) => {
          if (p.graphs?.nodes && p.graphs?.nodes.length) {
            p.node = p.graphs.nodes.filter((n) => n.id === p.nodeId)[0];
          }
        });
        documentSearch = documentSearch.filter((p) => {
          if (p.altText && getCheckedDocs) {
            return true;
          }
          if (p.type.includes('image') && getCheckedImages) {
            return true;
          }
          return false;
        });
      }

      // Insert node icon
      if (nodes && nodes.length) {
        if (!getCheckedNodes) {
          documentSearch = documentSearch.filter((p) => !p.added);
        } else {
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
                  graphId: graphIdParam,
                });
              }
            }
          });
        }
      }

      // Insert tab video
      const nodeTypes = Object.keys(singleGraph.customFields);

      nodeTypes.forEach((nmodeType) => {
        const tabNames = Object.keys(singleGraph.customFields[nmodeType]);

        tabNames.forEach((tabName) => {
          const tabValue = singleGraph.customFields[nmodeType][tabName].values;

          Object.keys(tabValue).forEach((nodeId) => {
            const tabContent = tabValue[nodeId];

            const mediaVideoHtml = document.createElement('div');

            mediaVideoHtml.innerHTML = tabContent;

            Array.from(mediaVideoHtml.getElementsByTagName('iframe')).forEach((el) => {
              const node = ChartUtils.getNodeById(nodeId);

              if (getCheckedVideos) {
                documentSearch.push({
                  id: nodeId,
                  user: singleGraph.user,
                  node,
                  data: el,
                  nodeId: node.id,
                  nodeName: node.name,
                  nodeType: node.type,
                  tabName,
                  added: node.id,
                  type: 'video',
                  graphId: graphIdParam,
                });
              }
            });
          });
        });
      });

      // Search media
      documentSearch = documentSearch.filter((p) => p.nodeName.toLocaleLowerCase().includes(search.toLocaleLowerCase()));

      return (
        <div className="mediaModal">
          <Modal
            isOpen
            className="ghModal ghModalMedia"
            overlayClassName="ghModalOverlay"
            onRequestClose={this.closeModal}
          >
            <div className="mediaHeader">
              <h2>Media gallery</h2>
              <hr className="line mediaLine" />
              <Input
                placeholder="Search ..."
                autoComplete="off"
                value={search}
                icon="fa-search"
                containerClassName="mediaSearch"
                onFocus={() => this.searchHandleChange(search)}
                onChangeText={this.searchHandleChange}
              />
              <div className="filterMedia">
                <Checkbox
                  label="node icon"
                  checked={getCheckedNodes}
                  onChange={() => this.filterHandleChange('nodes', !getCheckedNodes)}
                  className="graphsCheckbox"
                />
                <Checkbox
                  label="show documents of tabs"
                  checked={getCheckedDocs}
                  onChange={() => this.filterHandleChange('docs', !getCheckedDocs)}
                  className="graphsCheckbox"
                />
                <Checkbox
                  label="show images of tabs"
                  checked={getCheckedImages}
                  onChange={() => this.filterHandleChange('images', !getCheckedImages)}
                  className="graphsCheckbox"
                />
                <Checkbox
                  label="videos"
                  checked={getCheckedVideos}
                  onChange={() => this.filterHandleChange('videos', !getCheckedVideos)}
                  className="graphsCheckbox"
                />
              </div>
              <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeModal} />
            </div>
            {(documentSearch && documentSearch.length)
              ? (
                <div className="mediaContainer">
                  <div className="mediaRightContent">
                    <div className="searchData">
                      <div className="searchData__wrapper mediaContent">
                        <div className="searchMediaContent">
                          <article className="searchData__graph mediaForm">
                            <div className="searchDocumentContent mediaGallery">
                              {documentSearch.map((document) => (
                                document.id && (
                                <div
                                  className="nodeTabs tabDoc"
                                >
                                  <div className="imageFrame">
                                    <div className="imageFrameHeader">
                                      <span
                                        className="nodeLink"
                                        onClick={
                                          () => this.openTab(document.graphId, document.node, document.tabName)
                                        }
                                      >
                                        <div className="left">
                                          <NodeIcon node={document.node} />
                                        </div>
                                        <div className="right">
                                          <span title={document.node.name} className="headerName">
                                            { document.node.name && document.node.name.length > 8
                                              ? `${document.nodeName.substr(0, 8)}... `
                                              : document.nodeName}
                                          </span>
                                          <p>{moment(document.updatedAt).calendar()}</p>
                                        </div>
                                      </span>

                                      <p className="createdBy">
                                        <span>uploaded by </span>
                                        <Link to={`/profile/${document.user.id}`}>
                                          {`${document.user.firstName} ${document.user.lastName}`}
                                        </Link>
                                      </p>
                                    </div>

                                    <div className="gallery-box-container">
                                      <a href="#" className="gallery-box">
                                        {
                                          document.type.includes('video')
                                            ? (
                                              <span
                                                ref={(nodeElement) => {
                                                  nodeElement && nodeElement.appendChild(document.data);
                                                }}
                                              />
                                            )
                                            : (
                                              <div>
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
                                                        : document.description)}
                                                  </span>
                                                </span>
                                              </div>
                                            )
                                        }
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
                  </div>
                </div>
              ) : <h3 className="mediaNotFound">No Media Found</h3>}
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
  setActiveTab,
  getDocumentsRequest,
  getSingleGraphRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MediaModal);

export default Container;
