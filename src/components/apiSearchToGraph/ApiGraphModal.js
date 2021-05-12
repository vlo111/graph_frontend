import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { toggleNodeModal } from '../../store/actions/app';
import withGoogleMap from '../../helpers/withGoogleMap';
import Utils from '../../helpers/Utils';
import {parseStringPromise} from 'xml2js'
import moment from 'moment';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';
import ApiImg from '../../assets/images/kgg.png';
import { color } from 'd3-color';
import Api from '../../Api';


class ApiGraphModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiSearchReturnValues: [],
      apiTitleSearchTerms: '',
      apiAuthorSearchTerms: '',
      onClose: PropTypes.func.isRequired,
      getChecked: false,
      searchResults: NaN
    };
  }


    useWikiSearchEngine = async (e) => {
      e.preventDefault();
      if (this.state.apiTitleSearchTerms === undefined && this.state.apiAuthorSearchTerms) {
        return 0
      }
      this.setState({
        apiSearchReturnValues: [],
      });

      const pointerToThis = this;

      // combine author name and topic fields and put it in url
      let url = `https://export.arxiv.org/api/query?search_query=all:${this.state.apiTitleSearchTerms} ${this.state.apiAuthorSearchTerms}&sortBy=relevance&max_results=100`

      const response = await fetch(url)
      const xml = await response.text()
      const jsonData = await parseStringPromise(xml)
      
      // Handle undefined !!!
      if (jsonData.feed.entry === undefined) {return 0}
      this.setState({searchResults: jsonData.feed.entry.length })
      await jsonData.feed.entry.map(article => {
        let authors = ''
        article.author.map(auth => authors+=auth.name+', ')

        pointerToThis.state.apiSearchReturnValues.push({
          queryResultPageAuthors: authors,
          queryResultPageFullURL: article.id[0],
          queryResultPageID: article.id[0].split('/').slice(-1)[0],
          queryResultPageTitle: article.title[0],
          queryResultPageSnippet: article.summary[0],
        });
      })
      pointerToThis.forceUpdate();
    }

    changeApiTitleSearchTerms = (e) => {
      this.setState({
        apiTitleSearchTerms: e.target.value,
      });
    }
    changeApiAuthorSearchTerms = (e) => {
      this.setState({
        apiAuthorSearchTerms: e.target.value,
      });
    }

    getAllNodes = async (ev) => {
      const { getChecked } = this.state;
      if (getChecked === false) {
        return;
      }

      const contentUrl = this.state.apiSearchReturnValues[this.state.getChecked].queryResultPageFullURL;
      const arixId = contentUrl.split('/').slice(-1)[0].split('v')[0]
      const sematicURL = `https://api.semanticscholar.org/v1/paper/arXiv:${arixId}`
      
      const fetchSemantic = await fetch(sematicURL)
      const semanticText = JSON.parse(await fetchSemantic.text())
      
      const abstract = semanticText.abstract
      const title = semanticText.title
      const url = semanticText.url
      const authors = semanticText.authors
      
      const nodes = [...Chart.getNodes()]
      const links = [...Chart.getLinks()]
      // const nodes = []
      // const links = []
      const article = await this.createNodes(nodes, title, url, abstract)
      nodes.push(article)

      if (authors) {
        await authors.map( (author, index) => {

          const authorData = this.createNodes(nodes, author.name, author.url)

          const link = {
            create: true,
            color: "#82abd1", 
            createdAt: moment().unix(),
            createdUser: 1, // get users
            direction: "",
            id: ChartUtils.uniqueId(links),
            index: 0,
            linkType: "a",
            source: article.id,
            status: "approved",
            target: authorData.id,
            type: "author",
            updatedAt: moment().unix(),
            updatedUser: 1, // get userId
            value: 2,
          }

          links.push(link)
          nodes.push(authorData)
        })
      }
      
      const compare = await Api.dataPastCompare(8, nodes)
      console.log('compare: ', compare.data.duplicatedNodes)
      console.log(`nodes `,nodes)
      console.log(`links `,links)
      Chart.render({links, nodes})
      this.props.onClose(ev);
    }

    createNodes = (nodes, name, url, contentData=false) => {
      const updatedAt = moment().unix();

      const about = contentData ? `<div>
          <strong class="tabHeader">About</strong><br>
          <br>${contentData}<br>
          <a href="${url}" target="_blank">
            ${url}
          </a>
        </div>` : false;

      const customFields = about ? [{
        name: 'About',
        subtitle: '',
        value: about,
      }] : ''

      const node = {
        color: "#1f77b4",
        createdAt: updatedAt, 
        createdUser: 1, // get user id
        customFields: customFields, 
        description: contentData, 
        fx: -189.21749877929688 + (Math.random()*150), 
        fy: -61.72186279296875 + (Math.random()*150),
        icon: "",
        id: ChartUtils.uniqueId(nodes), // what is this
        index: 0, // will it generate an index or I should give it by hand
        keywords: [], // in case of article keywords could be added
        labels: [],
        link: url, 
        manually_size: 1,
        name: name, 
        nodeType: "circle",
        status: "approved",
        type: "arxiv", 
        updatedAt: updatedAt, 
        updatedUser: 1, // remove this guy
      }
      return node
    }

    checkedWiki = (param) => {
      this.setState({
        getChecked: param,
      });
    }

    render() {
      const { getChecked } = this.state;
      const wikiSearchResults = [];
      const resultAmount =  Number.isInteger(this.state.searchResults) ? `Got ${this.state.searchResults} results` : ''
      for (const key3 in this.state.apiSearchReturnValues) {
        wikiSearchResults.push(
          <div className="wikiSearch apiSearch" key={key3}>
            {key3 === getChecked
            && <button onClick={(ev) => this.getAllNodes(ev)} className="ghButton accent alt WikiCreateNode">Create Node</button>}
            <div>
              <input
                onChange={() => this.checkedWiki(key3)}
                checked={!getChecked ? getChecked : (key3 === getChecked)}
                className="graphsCheckbox"
                type="checkbox"
                name="layout"
                id={key3}
                value="option1"
              />
              
              <label className="pull-left" htmlFor={key3} />
            </div>
            <h3>
              <a target="_blank" rel="noreferrer" href={this.state.apiSearchReturnValues[key3].queryResultPageFullURL}>
                {this.state.apiSearchReturnValues[key3].queryResultPageTitle}
              </a>
            </h3>
            <span className="link">
              <a target="_blank" rel="noreferrer" href={this.state.apiSearchReturnValues[key3].queryResultPageFullURL}>
                {this.state.apiSearchReturnValues[key3].queryResultPageFullURL}
              </a>
            </span>
            <p> <b>Authors:</b> {this.state.apiSearchReturnValues[key3].queryResultPageAuthors}</p>
            <p
              className="description apiDescription"
              dangerouslySetInnerHTML={{ __html: this.state.apiSearchReturnValues[key3].queryResultPageSnippet }}
            />
          </div>,
        );
      }

      return (
        <>
          <Modal
            isOpen
            className="ghModal ghMapsModal ApiModal"
            overlayClassName="ghModalOverlay ghMapsModalOverlay"
            onRequestClose={this.props.onClose}
          >
            <img src={ApiImg} alt="api" className="ApiLogo" />
            <div className="Api">
              <form action="">
                <input className="ApiOne" type="text" value={this.state.apiTitleSearchTerms || ''} onChange={this.changeApiTitleSearchTerms} placeholder="Search Authors" />
                <input type="text" value={this.state.apiAuthorSearchTerms || ''} onChange={this.changeApiAuthorSearchTerms} placeholder="Search  Articles" />
                <button type="submit" onClick={this.useWikiSearchEngine}>Search</button>
              </form>
            </div>
            <div className="Wiki">
              <p style={{color:'#1a0dab', fontSize:'2em', textAlign:'left', margin:'1em 0 1em 1em'}}>{resultAmount}</p>
              {wikiSearchResults}
            </div>
          </Modal>

        </>
      );
    }
}

const mapStateToProps = (state) => ({
  customFields: state.graphs.singleGraph.customFields || {},
});

const mapDispatchToProps = {
  toggleNodeModal,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ApiGraphModal);

export default withGoogleMap(Container);
