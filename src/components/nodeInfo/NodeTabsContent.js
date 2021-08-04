import React, { Component } from 'react';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import stripHtml from 'string-strip-html';
import Api from '../../Api';
import { ReactComponent as NoTabSvg } from '../../assets/images/icons/sad.svg';
import { ReactComponent as AddTabSvg } from '../../assets/images/icons/plus-add-tab.svg';
import { ReactComponent as EditSvg } from '../../assets/images/icons/edit.svg';
import { ReactComponent as DeleteSvg } from '../../assets/images/icons/delete.svg';
import { ReactComponent as ExpandTabSvg } from '../../assets/images/icons/expandtab-data.svg';
import Button from '../form/Button';

class NodeTabsContent extends Component {
  static propTypes = {
    content: PropTypes.string,
  }

  static defaultProps = {
    content: undefined,
  }

  constructor(props) {
    super(props);
    this.state = {
      contentType: '',
    };
  }

  getContentType = memoizeOne(async (html) => {
    this.setState({ contentType: '' });
    const { result: text } = stripHtml(html);
    if (text) {
      const { data: { contentType } } = await Api.getContentType(text);
      this.setState({ contentType });
    }
  })

  render() {
    const {
      name, node, customFields, activeTab,
    } = this.props;
    const html = customFields.find((f) => f.name === name)?.value || '';
    // this.getContentType(html);
    // const { result: text } = stripHtml(html);
    // if (['text/html', 'application/pdf'].includes(contentType)) {
    //   const query = queryString.stringify({
    //     url: text,
    //   });
    //   return (
    //       <div data-field-name={name} className="contentWrapper previewWrapper">
    //         <div className="content">
    //           <img src={Utils.fileSrc(`/helpers/content-thumbnail?${query}`)} alt="thumbnail" />
    //           <a href={text} target="_blank" rel="noopener noreferrer">{text}</a>
    //         </div>
    //       </div>
    //   );
    // }

    return (
      <div data-field-name={!node.sourceId ? name : ''} className="contentWrapper">
        <div className="tab-data-settings">
          {html && (
          <Button
            icon={<EditSvg />}
            title="Edit"
            onClick={(ev) => this.props.openAddTabModal(ev, activeTab)}
          >
            Edit
          </Button>
          )}

          {activeTab !== '_description'
          && (
          <Button
            icon={<DeleteSvg />}
            title="Delete"
            onClick={(ev) => this.props.deleteCustomField(ev, activeTab)}
          >
            Delete
          </Button>
          )}
          {html && (
          <div className="expand">
            <ExpandTabSvg />
          </div>
          )}
        </div>
        {html ? <div className="content" dangerouslySetInnerHTML={{ __html: html }} />
          : (
            <div className="no-tabs">
              <div className="no-tab-content">
                <div className="header">
                  {(activeTab === '_description') && <p className="description">Description</p>}
                  <NoTabSvg />
                  {activeTab !== '_description' ? <p className="no-data">You have no data yet</p>
                    : <p className="no-data">You have no description yet</p> }
                </div>
                <div onClick={(ev) => this.props.openAddTabModal(ev, activeTab)} className="footer">
                  <AddTabSvg />
                  <p className="create-tab">Create</p>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }
}

export default NodeTabsContent;
