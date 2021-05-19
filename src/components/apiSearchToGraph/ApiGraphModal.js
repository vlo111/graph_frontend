import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { toggleNodeModal } from '../../store/actions/app';
import withGoogleMap from '../../helpers/withGoogleMap';
import {parseStringPromise} from 'xml2js'
import moment from 'moment';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';
import ApiImg from '../../assets/images/kgg.png';
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
      searchResults: NaN,
      currentUserId: 0
    };
  }

    useApiSearchEngine = async (e) => {
      this.setState({searchResults: NaN})
      e.preventDefault();
      if (this.state.apiTitleSearchTerms === undefined && 
        this.state.apiAuthorSearchTerms
      ) {
        return 0;
      }
      this.setState({
        apiSearchReturnValues: [],
      });

      const pointerToThis = this;
      const currentUser = await Api.getMyAccount()
      this.setState({currentUserId: currentUser.data.user.id})
      // combine author name and topic fields and put it in arxivUrl
      const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:${this.state.apiTitleSearchTerms} ${this.state.apiAuthorSearchTerms}&sortBy=relevance&max_results=100`
      const arxivResponse = await fetch(arxivUrl);
      const arxivXml = await arxivResponse.text();
      const arxivJsonData = await parseStringPromise(arxivXml);
      
      // const coreUrl = `https://core.ac.uk:443/api-v2/articles/search/${this.state.apiTitleSearchTerms} ${this.state.apiAuthorSearchTerms}?page=1&pageSize=10&apiKey=uRj8cMByiodHF0Z61XQxzVUfqpkYJW2D`
      // const coreResponse = await fetch(coreUrl);
      // const coreXml = await coreResponse.text();
      // const coreJsonData = JSON.parse(coreXml)

      // Handle undefined !!!
      if (!arxivJsonData || arxivJsonData.feed.entry === undefined ) {
        this.setState({searchResults: 0})
        return 0;
      }
      // this.setState({searchResults: arxivJsonData.feed.entry.length + coreJsonData.data.length });
      this.setState({searchResults: arxivJsonData.feed.entry.length });

      // collect articles from arix
      await arxivJsonData.feed.entry.map(article => {
        let authors = "";
        article.author.map(auth => authors += auth.name + ", ");

        pointerToThis.state.apiSearchReturnValues.push({
          queryResultPageAuthors: authors,
          queryResultPageFullarxivURL: article.id[0],
          queryResultPageID: article.id[0].split('/').slice(-1)[0],
          queryResultPageTitle: article.title[0],
          queryResultPageSnippet: article.summary[0],
          queryResultPageOrigin: 'arxiv',
        });
      })
      // collect articles from core 
      // await coreJsonData.data.map(article => {
      //   let authors = "";
      //   article.authors.map(auth => authors += auth + ", ");

      //   pointerToThis.state.apiSearchReturnValues.push({
      //     queryResultPageAuthors: authors,
      //     queryResultPageFullarxivURL: article.id[0],
      //     queryResultPageID: article.id[0].split('/').slice(-1)[0],
      //     queryResultPageTitle: article.title,
      //     queryResultPageSnippet: article.description,
      //     queryResultPageOrigin: 'core',
      //   });
      // })
      pointerToThis.forceUpdate();
    }

    changeApiTitleSearchTerms = (e) => {
      this.setState({
        apiTitleSearchTerms: e.target.value,
      });
    };
    changeApiAuthorSearchTerms = (e) => {
      this.setState({
        apiAuthorSearchTerms: e.target.value
      });
    };

    getByArixId = async (arixId) => {
      const sematicarxivURL = `https://api.semanticscholar.org/v1/paper/arXiv:${arixId}`;
      const fetchSemantic = await fetch(sematicarxivURL);
      return await fetchSemantic.json();
    };

    getAllNodes = async (ev) => {
      const { getChecked } = this.state;
      if (getChecked === false) {
        return;
      }

      const contentarxivUrl = this.state.apiSearchReturnValues[this.state.getChecked].queryResultPageFullarxivURL;
      const arixId = contentarxivUrl.split('/').slice(-1)[0].split('v')[0];
      const semantic = await this.getByArixId(arixId);
      const { abstract, title, arxivUrl, authors } = semantic;
      
      const nodes = [...Chart.getNodes()];
      const links = [...Chart.getLinks()];

      const article = await this.createNodes(
        nodes, 
        title, 
        arxivUrl, 
        'article', 
        abstract
      );
      const checkedArticle = await this.compareArticle(nodes, article, ev);
      if (!checkedArticle.isDuplicate) {
        nodes.push(checkedArticle.node);
      }

      const getData = async () => {
        if (!authors) {
          return
        }
        return Promise.all(
          authors.map( async (author, index) => {
            const type = "author"
            const authorData = await this.createNodes(nodes, author.name, author.arxivUrl, type)
            const checkedAuthor = await this.compareArticle(nodes, authorData, ev)
            const target = checkedAuthor.node.id
            const source = checkedArticle.node.id
            const new_links = [...(await Chart.getLinks())]
            const existingLink = new_links.find(link => (link.target === target && link.source === source))
            
            if (!existingLink) {
              const _type = type || _.last(links)?.type || '';
              const link = {
                create: true,
                // color: "#82abd1", 
                createdAt: moment().unix(),
                createdUser: this.state.currentUserId, // get users
                direction: "",
                id: ChartUtils.uniqueId(links),
                index: 0,
                linkType: "a",
                source: checkedArticle.node.id,
                status: "approved",
                target: checkedAuthor.node.id,
                type: _type,
                updatedAt: moment().unix(),
                updatedUser: this.state.currentUserId, // get userId
                value: 2,
              }
              links.push(link);
            }
            if (!checkedAuthor.isDuplicate) {
              nodes.push(checkedAuthor.node);
            } 
            return {nodes: nodes, links: links};
          })
        )
      }
      await getData().then(res => {
        console.log('this.props:', this.props);
        this.props.onClose(ev);
        Chart.render({ nodes: res[0].nodes, links: res[0].links });
      })
    }
    
    compareArticle = async (nodes, node, ev) => {
      const { 
        data: compare 
      } = await Api.dataPastCompare(
        window.location.pathname.substring(
          window.location.pathname.lastIndexOf('/') + 1
        ), 
        [node]
      );
      if (!(compare.duplicatedNodes && compare.duplicatedNodes.length)) {
        return {node: node, isDuplicate: false}
      }
      if (compare.duplicatedNodes && compare.duplicatedNodes.length) {
        return {node: compare.duplicatedNodes[0], isDuplicate: true};
      }
    }

    createNodes = (nodes, name, arxivUrl, type, contentData=false) => {
      const updatedAt = moment().unix();

      const about = contentData 
      ? `<div>
          <strong class="tabHeader">About</strong><br>
          <br>${contentData}<br>
          <a href="${arxivUrl}" target="_blank">
            ${arxivUrl}
          </a>
        </div>` 
      : false;

      const customFields = about 
        ? [
          {
            name: "About",
            subtitle: "",
            value: about,
          }
        ] : "";
      // const { x, y } = ChartUtils.calcScaledPosition(0,0);
      const _type = type || _.last(nodes)?.type || '';
      const node = {
        create: true,
        color: ChartUtils.nodeColorObj[_type] || '',
        createdAt: updatedAt, 
        createdUser: this.state.currentUserId, // get user id
        customFields: customFields, 
        description: contentData, 
        fx: -189.21749877929688 + (Math.random()*150), 
        fy: -61.72186279296875 + (Math.random()*150),
        icon: "",
        id: ChartUtils.uniqueId(nodes), // what is this
        index: 0, // will it generate an index or I should give it by hand
        keywords: [], // in case of article keywords could be added
        // labels: [],
        d: undefined,
        infographyId: undefined,
        location: undefined,
        link: arxivUrl, 
        manually_size: 1,
        name: name, 
        nodeType: "circle",
        status: "approved",
        type: _type, 
        updatedAt: updatedAt, 
        updatedUser: this.state.currentUserId, // remove this guy
      }
      return node;
    }

    checkedApi = (param) => {
      this.setState({
        getChecked: param
      });
    };

    render() {
      const { getChecked } = this.state;
      const apiSearchResults = [];
      const resultAmount =  Number.isInteger(this.state.searchResults) ? `Got ${this.state.searchResults} results` : ''
      for (const key3 in this.state.apiSearchReturnValues) {
        apiSearchResults.push(
          <div className="wikiSearch apiSearch" key={key3}>
            {key3 === getChecked
            && <button onClick={(ev) => this.getAllNodes(ev)} className="ghButton accent alt WikiCreateNode">Create Nodes</button>}
            <div>
              <input
                onChange={() => this.checkedApi(key3)}
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
              <a target="_blank" rel="noreferrer" href={this.state.apiSearchReturnValues[key3].queryResultPageFullarxivURL}>
                {this.state.apiSearchReturnValues[key3].queryResultPageTitle}
              </a>
            </h3>
            <span className="link">
              <a target="_blank" rel="noreferrer" href={this.state.apiSearchReturnValues[key3].queryResultPageFullarxivURL}>
                {this.state.apiSearchReturnValues[key3].queryResultPageFullarxivURL}
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
                <button type="submit" onClick={this.useApiSearchEngine}>Search</button>
              </form>
            </div>
            <div className="Wiki">
              <p className="resultAmount" >{resultAmount}</p>
              {apiSearchResults}
            </div>
          </Modal>

        </>
      );
    }
}

const mapStateToProps = (state) => ({
  customFields: state.graphs.customFields || {},
});

const mapDispatchToProps = {
  toggleNodeModal,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ApiGraphModal);

export default withGoogleMap(Container);
