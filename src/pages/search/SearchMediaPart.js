import React, { Component } from 'react';
import NodeIcon from "../../components/NodeIcon";
import {Link} from "react-router-dom";
import moment from "moment";
import Utils from "../../helpers/Utils";
import ChartUtils from "../../helpers/ChartUtils";
import Loading from "../../components/Loading";

class SearchMediaPart extends Component {

    constructor(props) {
        super(props);
        this.state = {loading: true};
    }

    goToNodeTab = (graphId, node, userId) => {
        const {currentUserId} = this.props;
        const mode = currentUserId === userId ? 'update' : 'view';
        this.props.history.replace(`/graphs/${mode}/${graphId}?info=${node.id}`);
        ChartUtils.findNodeInDom(node);
    }

    componentDidMount() {
        if (this.state.loading) {
            const {documentSearch} = this.props;
            if (documentSearch && documentSearch.length) {
                this.setState({loading: false});
            }
        }
    }

    render() {
        let { mediaMode, data, setLimit } = this.props;
        const {loading} = this.state;

        if (data) {
            data.map((d) => {
                d.node = d.graphs.nodes.filter((n) => n.id === d.nodeId)[0];
                d.graphName = d.graphs.title;
                d.userName = `${d.user.firstName} ${d.user.lastName}`;
            });
        }

        return (
            <div>
                {data && data.length ? (
                    data.map((document) => (
                            <div className="searchMediaContent">
                                <article key={document.userId} className="searchData__graph">
                                    <div className="searchDocumentContent documentContainer">
                                        <div className="nodeTabs tabDoc">
                                            <p
                                                className="nodeLink"
                                                onClick={() => this.goToNodeTab(
                                                    document.graphId,
                                                    document.node,
                                                    document.userId,
                                                )}>
                                                <div className="left">
                                                    {document.node && <NodeIcon node={document?.node}/>}
                                                </div>
                                                <div className="right">
                                                    <span className="headerName">{document.node?.name}</span>
                                                    <span className="type">{document.node?.type}</span>
                                                </div>
                                            </p>
                                            {document.altText
                                                ? <a download={document.altText} target="_blank"
                                                     href={document.data}>{document.altText}</a>
                                                : (mediaMode === 'document' ?
                                                        <a download={document.name} href={document.data}>
                                                            <p> {`Ext: ${document.data.substring(document.data.lastIndexOf('.') + 1, document.data.length)}`} </p>
                                                            <p> {`Desctiption: ${document.description}`}</p>
                                                        </a> :
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
                                                                            {document.description && document.description.length > 59
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
                                        <div className="searchData__graphInfo">
                                            <div>
                                                <h3>{document.graphName}</h3>
                                            </div>
                                            <div className="searchData__graphInfo-details">
                                                <p className="createdBy">
                                                    <span>created by </span>
                                                    <Link to={`/profile/${document.userId}`}>
                                                        {document.userName}
                                                    </Link>
                                                </p>
                                                <p className="createdBy">{moment(document.graphCreated).calendar()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        ))
                ) : ((!setLimit && (!loading
                    ? <Loading/>
                    : <h3 className="mediaNotFound">No Documents Found</h3>)) || null)}
            </div>
        );
    }
}

export default SearchMediaPart;
