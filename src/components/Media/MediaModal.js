import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import moment from 'moment';
<<<<<<< HEAD
=======
import { Link } from 'react-router-dom';
>>>>>>> origin/master
import _ from 'lodash';
import { setActiveButton } from '../../store/actions/app';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import { ReactComponent as CompressScreen } from '../../assets/images/icons/compress.svg';
import { ReactComponent as FullScreen } from '../../assets/images/icons/CompresMediaModal.svg';
import bgImage from '../../assets/images/mediaDocument.png';
import Button from '../form/Button';
import { getDocumentsRequest } from '../../store/actions/document';
<<<<<<< HEAD
import { getSingleGraphRequest, getAllTabsRequest, setActiveTab } from '../../store/actions/graphs';
import ChartUtils from '../../helpers/ChartUtils';
import Input from '../form/Input';
import Utils from '../../helpers/Utils';
import Outside from '../Outside';
import { ReactComponent as ArrowSvg } from '../../assets/images/icons/arrow.svg';
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
    user: PropTypes.func.isRequired,
    graph: PropTypes.object.isRequired,
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
      showDropDown: false,
      showVideo: false,
      fullWidth: false,

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
=======
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
>>>>>>> origin/master
    }
  }

  initialGraph = memoizeOne(() => {
    this.props.getSingleGraphRequest(this.props.singleGraph.id);
  });

<<<<<<< HEAD
  filterHandleChange = (path, value) => {
    switch (path) {
      case 'docs': {
        this.setState({
          getCheckedDocs: value,
        });
        break;
      }
      case 'Image': {
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
=======
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
>>>>>>> origin/master
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
      const type = typeof p.data === 'string' ? (Utils.isImg(p.data) ? 'Image' : 'document') : 'video';
      if (type === 'Image' && getCheckedImages) {
        return true;
      }
<<<<<<< HEAD
      return type !== 'Image' && type !== 'video' && getCheckedDocs;
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
                type: 'Image',
                graphId: Utils.getGraphIdFormUrl(),
              });
            }
=======
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
>>>>>>> origin/master
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
                type: 'Video',
                graphId: Utils.getGraphIdFormUrl(),
              });
            }
          });
        });
      });

      return _document;
    }
  }

<<<<<<< HEAD
  toggleDropDown = () => {
    const { showDropDown } = this.state;
    this.setState({ showDropDown: !showDropDown });
  }

  toggleVideo = () => {
    const { showVideo } = this.state;
    this.setState({ showVideo: !showVideo });
  }

  toggleFullWidth = () => {
    const { fullWidth } = this.state;
    this.setState({ fullWidth: !fullWidth });
  }

  showMediaOver = (id) => {
    console.log(id)
    // document.getElementsByClassName(`medInfo1_${id}`)[0].style.display = 'flex';
  }

  hideMediaOver = (id) => {
    document.getElementsByClassName(`medInfo1_${id}`)[0].style.display = 'none';
  }

  render() {
    let { documentSearch } = this.props;

    this.initTabs();

    this.initialGraph();

    const {
      fullWidth, showDropDown, getCheckedVideos, getCheckedDocs, getCheckedImages, getCheckedNodes, search,
    } = this.state;
    const size = 3;
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
    documentSearch = documentSearch?.filter((p) => p.node?.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()));

    return (
      <div className="mediaModal">
        <Modal
          isOpen
          className="ghModal ghModalMedia"
          id={fullWidth ? 'fullWidth' : undefined}
          overlayClassName="ghModalOverlay"
          onRequestClose={this.closeModal}
        >
          <div className="">
            <Button className="reSize" color="transparent" icon={fullWidth ? <CompressScreen /> : <FullScreen />} onClick={this.toggleFullWidth} />
            <Button color="transparent" className="close" icon={<CloseSvg />} onClick={this.closeModal} />
          </div>
          <h2>Media gallery</h2>
          <div className="mediaHeader">
            <div className="showCheck" onClick={this.toggleDropDown}>
              <div>Show</div>
              <div className="carretMedia">
                <ArrowSvg />
              </div>
            </div>
            {showDropDown ? (
              <Outside onClick={this.toggleDropDown} exclude=".showCheck">
                <div className="filterMedia">
                  <Checkbox
                    label="Node icon"
                    checked={getCheckedNodes}
                    onChange={() => this.filterHandleChange('icon', !getCheckedNodes)}
                  />
                  <Checkbox
                    label="Documents of tabs"
                    checked={getCheckedDocs}
                    onChange={() => this.filterHandleChange('docs', !getCheckedDocs)}
                  />
                  <Checkbox
                    label="Images of tabs"
                    checked={getCheckedImages}
                    onChange={() => this.filterHandleChange('Image', !getCheckedImages)}
                  />
                  <Checkbox
                    label="Videos"
                    checked={getCheckedVideos}
                    onChange={() => this.filterHandleChange('videos', !getCheckedVideos)}
                  />
                </div>
              </Outside>
            ) : null}
            <Input
              placeholder="Search ..."
              autoComplete="off"
              value={search}
              onFocus={() => this.searchHandleChange(search)}
              onChangeText={this.searchHandleChange}
              className="mediaSearch "
              containerClassName="mediaSearch"
            />
          </div>
          {(documentSearch && documentSearch.length)
            ? (
              <div className="mediaContainer mediaGallery">
                {documentSearch.map((document) => {
                  document.tags = document?.tags?.filter((p) => p !== '');
                  return document.id && (
                    <div className="imageFrame">
                      <figure className="img-container">
                        <div className={`${document.type !== 'Video' ? 'media-item-hover' : ''}`}>
                          <div className="medInfo">
                            <div className="mediaInfo">
                              <span className="mediaLeter">Uploaded:</span>
                              <span className="item">{moment(document.updatedAt).format('YYYY.MM.DD')}</span>
                            </div>
                            <div className="mediaInfo maediaUserBloc">
                              <span className="mediaLeter">User Name:</span>
                              <span className="mediaUser">
                                <a href={`/profile/${document.user.id}`} target='_blank'>
                                  {`${document.user.firstName} ${document.user.lastName}`}
                                </a>
                              </span>
                            </div>
                            {_.isEmpty(document.data)
                              ? (
                                <></>
                              ) : (
                                <div className="mediaInfo docType">
                                  <span className="mediaLeter">type:</span>
                                  <span className="item">{document.data.substring(document.data.lastIndexOf('.') + 1).toUpperCase()}</span>
                                </div>
                              )}
                            {_.isEmpty(document.description)
                              ? (
                                <></>
                              ) : (
                                <div className="mediaInfo mediaDescription">
                                  <span className="mediaLeter">Description:</span>
                                  <span className="descriptionLeng">
                                    {(document.description && document.description.length > 45
                                      ? `${document.description.substr(0, 45)}... `
                                      : document.description)}
                                  </span>
                                </div>
                              )}
                            {_.isEmpty(document.tags)
                              ? (
                                <></>
                              ) : (
                                <div className="mediaInfo maediaTags">
                                  <span className="mediaLeter">Tags:</span>
                                  <div className="maediaTagsleng">
                                    {`${document.tags
                                      ? `${document.tags.slice(0, size)}...`
                                      : document.tags
                                      } `}
                                    {' '}
                                  </div>
                                </div>
                              )}
                            {document.type !== 'Image' && document.type !== 'Video' && !Utils.isImg(document.data)
                              ? (
                                <div className="wiewDoc">
                                  <i class="fa fa-download"></i>
                                  <a target="_blank" href={document.data} rel="noreferrer">
                                    Download
                                  </a>
                                </div>
                              ) : document.type === 'Image' && Utils.isImg(document.data) ? (
                                <div className="wiewDoc viewImg">
                                  <i class="fa fa-eye"></i>
                                  <a target="_blank" href={document.data} rel="noreferrer">View</a>
                                </div>
                              ) : (
                                <div className="wiewDoc viewImg">
                                  <i class="fa fa-eye"></i>
                                  <a target="_blank" href={document.data} rel="noreferrer">View</a>
                                </div>
                              )}
                          </div>
                          <div>
                            {typeof document.data !== 'string'
                              ? (
                                <div>
                                  <iframe
                                    src={document.data.src}
                                    className="mediaVideo"
                                  />
                                </div>
                              )
                              : document.type !== 'Image' && document.type !== 'Video' && !Utils.isImg(document.data) ? (
                                <div className="documContainer">
                                  <img
                                    src={Utils.isImg(document.data) ? document.data : bgImage}
                                    className="mediaDocument"
                                  />
                                </div>
                              ) : (
                                <img
                                  className="gallery-box__img"
                                  src={document.data}
                                />
                              )}
                          </div>
                        </div>
                        <span
                          className="nodeLink"
                          onClick={
                            () => this.openTab(document.graphId, document.node, document.tabName)
                          }
                        >
                          <div className="containerMedia">
                            <img
                              className="userImg"
                              src={document.user.avatar}
                            />
                            <div className="ooo">
                              <span title={document.node.name} className="headerName">
                                {document.node.name && document.node.name.length > 15
                                  ? `${document.node.name.substr(0, 15)}... `
                                  : document.node.name}
                              </span>
                              {document.type === 'Video' || document.type === 'Image'
                                ? (
                                  <span className="typeDocument">
                                    {' '}
                                    {document.type}
                                    {' '}
                                  </span>
                                ) : Utils.isImg(document.data) ? (
                                  <span className="typeDocument">Image</span>
                                ) : !Utils.isImg(document.data) ? (
                                  <span className="typeDocument">Document</span>
                                ) :
                                  (<span className="typeDocument">Document</span>)
                              }
                            </div>
                          </div>
                        </span>
                      </figure>
                    </div>
                  );
                })}
              </div>
            ) : <h3 className="mediaNotFound">No Media Found</h3>}
        </Modal>

      </div>
    );
  }
=======
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
>>>>>>> origin/master
}

const mapStateToProps = (state) => ({
  documentSearch: state.document.documentSearch,
  singleGraph: state.graphs.singleGraph,
<<<<<<< HEAD
  graphTabs: state.graphs.graphTabs,
=======
>>>>>>> origin/master
});

const mapDispatchToProps = {
  setActiveButton,
  setActiveTab,
  getDocumentsRequest,
  getSingleGraphRequest,
<<<<<<< HEAD
  getAllTabsRequest,
=======
>>>>>>> origin/master
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(MediaModal);

export default Container;
