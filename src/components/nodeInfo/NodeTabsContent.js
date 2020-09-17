import React, { Component } from 'react';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import Api from '../../Api';
import stripHtml from 'string-strip-html';
import Utils from "../../helpers/Utils";

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
    const { contentType } = this.state;
    const { content, name } = this.props;
    const html = String(content?.content || content || '');
    this.getContentType(html);
    const { result: text } = stripHtml(html);

    if (['text/html', 'application/pdf'].includes(contentType)) {
      const query = queryString.stringify({
        url: text,
      });
      return (
        <div data-name={name} className="contentWrapper previewWrapper">
          <div className="content">
            <img src={Utils.fileSrc(`/helpers/content-thumbnail?${query}`)} alt="thumbnail" />
            <a href={text} target="_blank" rel="noopener noreferrer">{text}</a>
          </div>
        </div>
      );
    }
    return (
      <div data-name={name} className="contentWrapper">
        <div className="content" dangerouslySetInnerHTML={{ __html: html || 'no content' }} />
      </div>
    );
  }
}

export default NodeTabsContent;
