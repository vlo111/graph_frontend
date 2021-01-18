import React, { Component } from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import queryString from 'query-string';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { setActiveButton } from '../../store/actions/app';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Button from '../form/Button';
import { getDocumentsRequest } from '../../store/actions/document';

class MediaModal extends Component {
    static propTypes = {
      setActiveButton: PropTypes.func.isRequired,
      getDocumentsRequest: PropTypes.func.isRequired,
      documentSearch: PropTypes.object.isRequired,
    }

    closeModal = () => {
      this.props.setActiveButton('create');
    }

    searchDocuments = memoizeOne((searchParam) => {
      this.props.getDocumentsRequest(searchParam);
    })

    render() {
      const { documentSearch } = this.props;
      const graphIdParam = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
      this.searchDocuments(graphIdParam);

      if (documentSearch && documentSearch.length) {
        documentSearch.sort((a, b) => a.nodeType.localeCompare(b.nodeType));
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
            <div>
              <h1>Media gallery</h1>
            </div>
            {documentSearch && documentSearch.length
              ? (
                <div className="searchData">
                  <div className="searchData__wrapper">
                    <div className="searchMediaContent">
                      <article className="searchData__graph">
                        <div className="searchDocumentContent">
                          {documentSearch.map((document, index, array) => (
                            document.id && (
                            <div
                              style={document.nodeType !== array[index === 0 ? index : index - 1].nodeType
                                ? { gridColumnEnd: 2 } : {}}
                              className="nodeTabs tabDoc"
                            >
                              <p
                                className="nodeName"
                              >
                                {document.nodeName}
                              </p>

                              <p className="nodeType">{document.nodeType}</p>
                              <p>{moment(document.updatedAt).calendar()}</p>
                              {
                                  document.altText ? (
                                    <a download={document.altText} href={document.data}>
                                      {document.altText}
                                    </a>
                                  ) : (
                                    <table>
                                      <tbody>
                                        <tr>
                                          <td>
                                            <a href={document.data} download="graph_tab_img">
                                              <img
                                                src={document.data}
                                                width="300px"
                                                download="graphTabImage"
                                              />
                                            </a>
                                            {document.description}
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
              : <h3 className="mediaNotFound">No Media Gallery Found</h3>}
            <div className="buttonsWrapper">
              <Button color="transparent" className="cancel" onClick={this.closeModal}>back</Button>
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
