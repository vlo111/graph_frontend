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
import { getSingleGraphRequest, getAllTabsRequest, setActiveTab } from '../../store/actions/graphs';
import ChartUtils from '../../helpers/ChartUtils';
import Input from '../form/Input';
import Utils from '../../helpers/Utils';
import Checkbox from '../form/Checkbox';

class MediaModal extends Component {
    static propTypes = {
      getSingleGraphRequest: PropTypes.func.isRequired,
      getAllTabsRequest: PropTypes.func.isRequired,
      setActiveButton: PropTypes.func.isRequired,
      getDocumentsRequest: PropTypes.func.isRequired,
      documentSearch: PropTypes.object.isRequired,
      singleGraph: PropTypes.object.isRequired,
      setActiveTab: PropTypes.func.isRequired,
    }

    initTabs = memoizeOne(() => {
      this.props.getAllTabsRequest(window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1));
    })

    initDocument = memoizeOne((document) => {
      document.map((p) => {
        if (p.graphs?.nodes && p.graphs?.nodes.length) {
          p.node = p.graphs.nodes.filter((n) => n.id === p.nodeId)[0];
        }
      });
    })

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

    initialGraph = memoizeOne(() => {
      this.props.getSingleGraphRequest(this.props.singleGraph.id);
    });

    filterHandleChange = (path, value) => {
      switch (path) {
        case 'docs': {
          this.setState({
            getCheckedDocs: value,
          });
          break;
        }
        case 'image': {
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
        case 'icon': {
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

    insertDocument = (document) => {
      const { getCheckedDocs, getCheckedImages } = this.state;

      return document.filter((p) => {
        const type = typeof p.data === 'string' ? (Utils.isImg(p.data) ? 'image' : 'document') : 'video';
        if (type === 'image' && getCheckedImages) {
          return true;
        }
        return type !== 'image' && type !== 'video' && getCheckedDocs;
      });
    }

    insertIcon = (document) => {
      const { singleGraph: { nodesPartial, user } } = this.props;

      if (nodesPartial && nodesPartial.length) {
        const { getCheckedNodes } = this.state;

        if (!getCheckedNodes) {
          document = document.filter((p) => !p.added);
        } else {
          nodesPartial.map((node) => {
            if (node.icon) {
              if (!document.filter((p) => p.added === node.id).length) {
                document.push({
                  id: node.id,
                  user,
                  node,
                  data: node.icon,
                  added: node.id,
                  type: 'image',
                  graphId: Utils.getGraphIdFormUrl(),
                });
              }
            }
          });
        }
      }

      return document;
    }

    insertVideo = (_document) => {
      const { singleGraph: { nodesPartial, user }, graphTabs } = this.props;

      const { getCheckedVideos } = this.state;

      if (graphTabs && graphTabs.length && !_.isEmpty(nodesPartial)) {
        graphTabs.forEach((p) => {
          const node = nodesPartial.filter((g) => g.id === p.nodeId)[0];

          const tabData = p.tab;

          tabData.forEach((tab) => {
            const mediaVideoHtml = document.createElement('div');
            mediaVideoHtml.innerHTML = tab.value;
            Array.from(mediaVideoHtml.getElementsByTagName('iframe')).forEach((el) => {
              if (getCheckedVideos) {
                _document.push({
                  id: node.id,
                  user,
                  node,
                  data: el,
                  added: node.id,
                  type: 'video',
                  graphId: Utils.getGraphIdFormUrl(),
                });
              }
            });
          });
        });

        return _document;
      }
    }

    render() {
      let { documentSearch } = this.props;

      this.initTabs();

      this.initialGraph();

      const {
        getCheckedVideos, getCheckedDocs, getCheckedImages, getCheckedNodes, search,
      } = this.state;

      const graphIdParam = Utils.getGraphIdFormUrl();

      this.searchDocuments(graphIdParam);

      if (documentSearch && documentSearch.length) {
        this.initDocument(documentSearch);

        // Node documents and images of tabs
        documentSearch = this.insertDocument(documentSearch);
      }

      // Insert node icon
      documentSearch = this.insertIcon(documentSearch);

      // Insert tab video
      documentSearch = this.insertVideo(documentSearch);

      // Search media
      documentSearch = documentSearch?.filter((p) => p.node.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()));

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
                  onChange={() => this.filterHandleChange('icon', !getCheckedNodes)}
                />
                <Checkbox
                  label="show documents of tabs"
                  checked={getCheckedDocs}
                  onChange={() => this.filterHandleChange('docs', !getCheckedDocs)}
                />
                <Checkbox
                  label="show images of tabs"
                  checked={getCheckedImages}
                  onChange={() => this.filterHandleChange('image', !getCheckedImages)}
                />
                <Checkbox
                  label="videos"
                  checked={getCheckedVideos}
                  onChange={() => this.filterHandleChange('videos', !getCheckedVideos)}
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
                                              ? `${document.node.name.substr(0, 8)}... `
                                              : document.node.name}
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
                                      <div className="gallery-box">
                                        { typeof document.data !== 'string'
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
                                                  {Utils.isImg(document.data) ? (
                                                    <a target="_blank" href={document.data} rel="noreferrer">
                                                      <img
                                                        className="gallery-box__img"
                                                        src={document.data}
                                                      />
                                                    </a>
                                                  ) : (
                                                    <a
                                                      className="linkDocumentDownload"
                                                      download={document.node.name}
                                                      href={document.data}
                                                      target="_blank"
                                                      rel="noreferrer"
                                                    >
                                                      <div className="docContainer">
                                                        <div className="docFrame">
                                                          {document.data.substring(document.data.lastIndexOf('.') + 1).toUpperCase()}
                                                        </div>
                                                      </div>
                                                    </a>
                                                  )}
                                                </figure>
                                              </span>
                                              <span className="gallery-box__text-wrapper">
                                                <span title={document.description} className="gallery-box__text">
                                                  { document.added
                                                    ? (document.node.type)
                                                    : (document.description && document.description.length > 38
                                                      ? `${document.description.substr(0, 38)}... `
                                                      : document.description)}
                                                </span>
                                              </span>
                                            </div>
                                          )}
                                      </div>
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
  graphTabs: state.graphs.graphTabs,
});

const mapDispatchToProps = {
  setActiveButton,
  setActiveTab,
  getDocumentsRequest,
  getSingleGraphRequest,
  getAllTabsRequest,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MediaModal);

export default Container;
