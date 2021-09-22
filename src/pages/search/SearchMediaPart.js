import React, { Component } from 'react';
import NodeIcon from "../../components/NodeIcon";
import { Link } from "react-router-dom";
import moment from "moment";
import Utils from "../../helpers/Utils";
import ChartUtils from "../../helpers/ChartUtils";
import Loading from "../../components/Loading";
import bgImage from '../../assets/images/mediaDocument.png';

class SearchMediaPart extends Component {

    constructor(props) {
        super(props);
        this.state = { loading: true };
    }

    goToNodeTab = (graphId, node, userId) => {
        const { currentUserId } = this.props;
        const mode = currentUserId === userId ? 'update' : 'view';
        this.props.history.replace(`/graphs/${mode}/${graphId}?info=${node.id}`);
        ChartUtils.findNodeInDom(node);
    }
    showMediaOver = (id) => {
        console.log(id)
        // document.getElementsByClassName(`medInfo1_${id}`)[0].style.display = 'flex';
    }

    hideMediaOver = (id) => {
        document.getElementsByClassName(`medInfo1_${id}`)[0].style.display = 'none';
    }

    componentDidMount() {
        if (this.state.loading) {
            const { documentSearch } = this.props;
            if (documentSearch && documentSearch.length) {
                this.setState({ loading: false });
            }
        }
    }

    render() {
        let { mediaMode, data, setLimit } = this.props;
        const { loading } = this.state;
        const size = 3;

        if (data) {
            data.map((d) => {
                d.node = d.graphs.nodes.filter((n) => n.id === d.nodeId)[0];
                d.graphName = d.graphs.title;
                d.userName = `${d.user.firstName} ${d.user.lastName}`;
            });
        }
        console.log(data)
        return (
            <>
                {data && data.length ? (
                    data.map((document) => (
                        <>
                            <article key={document.userId} className="graphs">
                                <div className={`${document.type !== 'Video' ? 'mediaPart_wrapper' : ''}`}>
                                    <div className="top">
                                        <p
                                            className="nodeLink"
                                            onClick={() => this.goToNodeTab(
                                                document.graphId,
                                                document.node,
                                                document.userId,
                                            )}>
                                            <div className="right">
                                                <span className="headerName">{document.node?.name}</span>
                                            </div>
                                        </p>
                                        <div className="infoContent">
                                            <img
                                                className="avatar"
                                                src={document.user.avatar}
                                                alt={document.user.name}
                                            />
                                            <div className="infoWrapper">
                                                <Link to={`/profile/${document.user.id}`}>
                                                    <span className="author">{`${document.user.firstName} ${document.user.lastName}`}</span>
                                                </Link>
                                                <div className="info">
                                                    <span>{moment(document.updatedAt).calendar()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {document.altText
                                            ? <a download={document.altText} target="_blank"
                                                href={document.data}>{document.altText}</a>
                                            : (mediaMode === 'document' ?
                                                // <a download={document.name} href={document.data}>
                                                //     <p> {`Ext: ${document.data.substring(document.data.lastIndexOf('.') + 1, document.data.length)}`} </p>
                                                //     <p> {`Desctiption: ${document.description}`}</p>
                                                // </a> 
                                                <div>

                                                </div> :
                                                // <table className="mediaTable">
                                                //     <tbody>
                                                //     <tr>
                                                //         <td>
                                                //             <div className="mediaTumbnail">
                                                //                 <div className="container">
                                                //                     <a target="_blank" href={document.data}>
                                                //                         <img
                                                //                             target="_blank"
                                                //                             src={document.data}
                                                //                             width="300px"
                                                //                         />
                                                //                     </a>
                                                //                 </div>
                                                //                 <p title={document.description}>
                                                //                     {document.description && document.description.length > 59
                                                //                         ? `${document.description.substr(0, 59)}... `
                                                //                         : document.description}
                                                //                 </p>
                                                //             </div>
                                                //         </td>
                                                //     </tr>
                                                //     </tbody>
                                                // </table>
                                                <div></div>
                                            )}
                                    </div>
                                    <div>
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
                                        {typeof document.data !== 'string'
                                            ? (
                                                <>

                                                </>
                                            )
                                            : document.type !== 'Image' && document.type !== 'Video' && !Utils.isImg(document.data) ? (
                                                <div className="documContainer ">
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
                                        {/* <div>
                                                <h3>{document.graphName}</h3>
                                            </div> */}
                                        {/* <div className="searchData__graphInfo-details">
                                                <p className="createdBy">
                                                    <span>created by </span>
                                                    <Link to={`/profile/${document.userId}`}>
                                                        {document.userName}
                                                    </Link>
                                                </p>
                                                <p className="createdBy">{moment(document.graphCreated).calendar()}</p>
                                            </div> */}

                                        <div className="ooo">

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
                                </div>
                            </article>
                        </>
                    ))
                ) : ((!setLimit && (!loading
                    ? <Loading />
                    : <h3 className="mediaNotFound">No Documents Found</h3>)) || null)}
            </>
        );
    }
}

export default SearchMediaPart;
