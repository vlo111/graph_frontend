import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import fetchTimeout from 'fetch-timeout';
import { toggleNodeModal } from '../../store/actions/app';
import withGoogleMap from '../../helpers/withGoogleMap';
import {parseStringPromise} from 'xml2js'
import moment from 'moment';
import Chart from '../../Chart';
import ChartUtils from '../../helpers/ChartUtils';
import ApiImg from '../../assets/images/icons/science.png';
import arxivImg from '../../assets/images/icons/arxiv.jpg';
import coreImg from '../../assets/images/icons/core.png';
import Api from '../../Api';
const { REACT_APP_ARXIV_URL } = process.env;
const { REACT_APP_CORE_URL } = process.env;
const { REACT_APP_SEMANTIC_URL } = process.env;
import Loading from '../Loading';

class ScienceGraphModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiSearchReturnValues: [],
      apiTitleSearchTerms: '',
      apiAuthorSearchTerms: '',
      onClose: PropTypes.func.isRequired,
      getChecked: false,
      searchResults: NaN,
      currentUserId: 0,
      isLoading: null,
      checkedList: [],
      graphId: window.location.pathname.substring(
        window.location.pathname.lastIndexOf('/') + 1
      )
    };
  }

  useApiSearchEngine = async (e) => {
    this.setState({
      searchResults: NaN,
      checkedList: []
    })
    e.preventDefault();

    if ((this.state.apiTitleSearchTerms === undefined && 
      this.state.apiAuthorSearchTerms === undefined) || (
      this.state.apiTitleSearchTerms === '' && 
      this.state.apiAuthorSearchTerms === '')
    ) {
      return 0;
    }
    const currentUser = await Api.getMyAccount()
    this.setState({
      apiSearchReturnValues: [],
      isLoading:true,
      currentUserId: currentUser.data.user.id
    });
    const pointerToThis = this;

    // combined author and topic fields and putted it in arxivUrl and coreUrl
    const arxivUrl = REACT_APP_ARXIV_URL+`search_query=all:${this.state.apiTitleSearchTerms} ${this.state.apiAuthorSearchTerms}&sortBy=relevance&max_results=10`
    const coreUrl = REACT_APP_CORE_URL+`${this.state.apiTitleSearchTerms} ${this.state.apiAuthorSearchTerms}?page=1&pageSize=10&apiKey=uRj8cMByiodHF0Z61XQxzVUfqpkYJW2D`
    
    const urls = [
      {
        url:arxivUrl,
        name: 'arxiv'
      }, {
        url: coreUrl,
        name: 'core'
      }
    ]
    const fetchedSources = await this.fetchUrls(urls)
    debugger
    // if couldn't find any results return
    if (!fetchedSources.filter(source => source != undefined)) {
      return 
    }

    let arxivJsonData = ''
    let coreJsonData = ''
    if (fetchedSources.find(source => source.name === 'arxiv') != undefined) {
      const arxivResponse = (fetchedSources.find(source => source.name === 'arxiv')).articles;
      const arxivXml = await arxivResponse.text();
      arxivJsonData = await parseStringPromise(arxivXml);
    }
    if (fetchedSources.find(source => source.name === 'core') != undefined) {
      const coreResponse = (fetchedSources.find(source => source.name === 'core')).articles;
      const coreString = await coreResponse.text();
      coreJsonData = JSON.parse(coreString)
    }

    // Handle undefined !!!
    if (!arxivJsonData  && !coreJsonData) {
      this.setState({
        searchResults: 0,
        isLoading:true
      })
      return 0;
    }
    if (arxivJsonData.feed.entry) {
      // collect articles from arix
      await arxivJsonData.feed.entry.map(article => {
        let authors = "";
        article.author.map(auth => authors += auth.name + ", ");
        pointerToThis.state.apiSearchReturnValues.push({
          authorsList: authors.split(',').slice(0,-1),
          authors: authors,
          url: article.id[0],
          queryResultPageID: article.id[0].split('/').slice(-1)[0],
          title: article.title[0],
          abstract: article.summary[0],
          origin: ['arxiv'],
        });
      })
    }

    // collect articles from core 
    // do we need to merge nodes by here or it will be done in back end
    if (coreJsonData && coreJsonData.data) {
      await coreJsonData.data.map(article => {
        const articleAlreadyExists = pointerToThis.state.apiSearchReturnValues.find(
          (arxivArticle, index) => {
            
            if (arxivArticle.title === article.title) {

              if (!(pointerToThis.state.apiSearchReturnValues[index].origin.includes("core"))) {
                pointerToThis.state.apiSearchReturnValues[index].origin.push("core")
              }
              return arxivArticle
            }
            return false
        })

        if (articleAlreadyExists) {
          return
        }
        const url = article.downloadUrl ?? article.urls[0] ??  article.relations[0]
        // article url validation change to regex
        if (!url || (url.split('/')[0] !== "http:" && url.split('/')[0] !== "https:") || !article.description) {
          return
        }

        let authors = "";
        article.authors.map(auth => authors += auth + ", ");
        pointerToThis.state.apiSearchReturnValues.push({
          authors: authors,
          authorsList: article.authors,
          url: url,
          queryResultPageID: article.id,
          title: article.title,
          abstract: article.description,
          origin: ['core'],
        });
      })
    }
    this.setState({
      searchResults: pointerToThis.state.apiSearchReturnValues.length,
      isLoading:false 
    });
    pointerToThis.forceUpdate();
  }
// check this before production
  fetchUrls = async (urls) => {
    if (!urls || urls.length <= 1 || !Array.isArray(urls)) {
      return 'error'
    }
    const controller = new AbortController();

    const result = await Promise.all(
      urls.map(async url => {
        try {
          const articles = await fetchTimeout(
            url.url,
            {method:'GET'}, 
            8000, 
            'My custom timeout error string'
            )
        
        const result = {
          articles: articles,
          name: url.name,
        }
        return result
      } catch (error) { 
        return undefined
      }
      })
    )
    return result
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

  // will use semanticschollar in future hopefully
  // getByArixId = async (arixId) => {
  //   const sematicarxivURL = REACT_APP_SEMANTIC_URL+arixId;
  //   const fetchSemantic = await fetch(sematicarxivURL);
  //   return await fetchSemantic.json();
  // };

  getAllNodes = async (ev) => {
    const { checkedList } = this.state;
    if (!checkedList.length) {
      return;
    }
    // code for semantic scholar
    // if (this.state.apiSearchReturnValues[this.state.getChecked].queryResultPageOrigin === 'arxiv') {
    //   const contentarxivUrl = this.state.apiSearchReturnValues[this.state.getChecked].queryResultPageFullarxivURL;
    //   const arixId = contentarxivUrl.split('/').slice(-1)[0].split('v')[0];
    //   const semantic = await this.getByArixId(arixId);
    // } else {
    // }
    const chosenArticles = this.state.checkedList.map( articleIndex => {
      return this.state.apiSearchReturnValues[parseInt(articleIndex)]
    })
    await this.getArticlesData(ev, chosenArticles).then(res => {
      // handle empty res case !!!
      this.props.onClose(ev);
    })
    return 
  }

  getArticlesData = async (ev, chosenArticles) => {
    if (!chosenArticles.length) {
      return
    }
    const nodes = [...Chart.getNodes()];
    const ArticleList = []
    // return Promise.all(
      // chosenArticles.map(async chosenArticle => {
      for (const chosenArticle in chosenArticles) {
        const new_nodes = []
        const new_links = []
        const articleJson = chosenArticles[chosenArticle]
        const { abstract, title, url, authorsList } = articleJson;

        const article = await this.createNode(
          nodes, 
          title.trim(), 
          url, 
          'article', 
          abstract
        );
        const checkedArticle = await this.compareArticle(article);
        if (!checkedArticle.isDuplicate) {
          new_nodes.push(checkedArticle.node);
        }

        const getAuthorsData = async () => {
          if (!authorsList) {
            return
          }
          return this.getAuthors(
            authorsList, 
            nodes, 
            ev, 
            checkedArticle, 
            new_links, 
            new_nodes
          )
        }
        // handle empty getAuthorsData
        // return await getAuthorsData().then(this.sendResultsToBackEnd)
        let AuthorsData =  await getAuthorsData().then(this.sendResultsToBackEnd)
        ArticleList.push(AuthorsData)
      }
      // })
    // )
    return ArticleList
  }

    sendResultsToBackEnd = async res => {
      // write validations !!!
      await Api.dataPast(this.state.graphId, undefined, [0, 0], 'merge', {
        labels: [],
        nodes: res[0].nodes,
        links: res[0].links,
      }).catch((e) => e.response);
      if (res.status === 'error') {
        toast.error(res.message);
        return;
      }
      return { nodes: res[0].nodes, links: res[0].links }
    }
    
    compareArticle = async node => {
      // in case of author, get the name slice it compare each element to others 
      // to get all nodes from backend Api.getGraphNodes() 
      // or just use search function after making it use all nodes of graphs
      // const allNodes = await Api.getGraphNodes(1, {s:'a',graphId:this.state.graphId})
      debugger
      const { 
        data: compare 
      } = await Api.dataPastCompare(
        this.state.graphId, 
        [node]
      );

      if (!(compare.duplicatedNodes && compare.duplicatedNodes.length)) {
        return {node: node, isDuplicate: false}
      }
      if (compare.duplicatedNodes && compare.duplicatedNodes.length) {
        return {node: compare.duplicatedNodes[0], isDuplicate: true};
      }
    }

    getAuthors = (authorsList, nodes, ev, checkedArticle, new_links, new_nodes) => {
      return Promise.all(
        authorsList.map( async (author) => {
          const type = "author"
          const authorData = await this.createNode(nodes, author.trim(), author.url, type)
          const checkedAuthor = await this.compareArticle(authorData)
          const target = checkedAuthor.node.id
          const source = checkedArticle.node.id
          const links = [...(await Chart.getLinks())]

          const existingLink = links.find(link => (link.target === target && link.source === source))
          
          if (!existingLink) {
            const _type = type || _.last(links)?.type || '';
            const link = {
              create: true,
              createdAt: moment().unix(),
              createdUser: this.state.currentUserId, 
              direction: "",
              id: ChartUtils.uniqueId(links),
              index: 0,
              linkType: "a",
              source: checkedArticle.node.id,
              status: "approved",
              target: checkedAuthor.node.id,
              type: _type,
              updatedAt: moment().unix(),
              updatedUser: this.state.currentUserId,
              value: 2,
            }
            new_links.push(link);
          }
          if (!checkedAuthor.isDuplicate) {
            new_nodes.push(checkedAuthor.node);
          } 
          return {nodes: new_nodes, links: new_links};
        })
      )
    }

    createNode = (nodes, name, arxivUrl, type, contentData=false) => {
      const updatedAt = moment().unix();
      const arxivHref = arxivUrl != undefined  
        ? `
          <a href="${arxivUrl}" target="_blank">
            Go to site
          </a>
        ` : ''
      const about = contentData 
      ? `<div>
          <strong class="tabHeader">About</strong><br>
          <br>${contentData}<br>
          ${arxivHref}
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
        labels: [],
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

    handleCheckedButton = (param) => {
      const oldCheckedList = this.state.checkedList
      if (oldCheckedList.includes(param)) {
        this.setState({
          checkedList: oldCheckedList.filter(checkedItems => checkedItems !== param)
        }) 
      } else {
        this.state.checkedList.push(param)
      }
      this.setState({
        getChecked: param
      });
    };

    render() {
      const apiSearchResults = [];
      const resultAmount =  Number.isInteger(this.state.searchResults) ? `Got ${this.state.searchResults} results` : ''
      for (const key3 in this.state.apiSearchReturnValues) {
        apiSearchResults.push(
          <div className="scienceResultsList" key={key3}>
            <div className="scienceCheckBox">
              <input
                onChange={() => this.handleCheckedButton(key3)}
                checked={this.state.checkedList.includes(key3)}
                className="scienceArticleCheckbox"
                type="checkbox"
                name="layout"
                id={key3}
                value="option1"
              />
              
              <label className="pull-left" htmlFor={key3} />
            </div>
            
            <div className="scienceArticleData">
              <h3>
                <a target="_blank" rel="noreferrer" href={this.state.apiSearchReturnValues[key3].url}>
                  {this.state.apiSearchReturnValues[key3].title}
                </a>
              </h3>
              <p className="scienceAuthor"> <b>Authors:</b> {this.state.apiSearchReturnValues[key3].authors}</p>
              <p
                className=" scienceArticleDescription"
                dangerouslySetInnerHTML={{ __html: 
                  "Abstract:"
                  + this.state.apiSearchReturnValues[key3].abstract !== undefined
                      ? this.state.apiSearchReturnValues[key3].abstract + "..."
                      : ''
                }}
              />
              <div>
                {
                  this.state.apiSearchReturnValues[key3].origin.includes("arxiv") 
                  ?  <img src={arxivImg} alt="arxiv" className="arxivLogo sourceLogo" />
                  :  ""
                }
                {
                  this.state.apiSearchReturnValues[key3].origin.includes("core")
                  ?  <img src={coreImg} alt="arxiv" className="coreLogo sourceLogo" />
                  :  ""
                }
              </div>
            </div>
          </div>,
        );
      }

      return (
        <>
          <Modal
            isOpen
            className="ghModal ghMapsModal scienceModal"
            overlayClassName="ghModalOverlay ghMapsModalOverlay"
            onRequestClose={this.props.onClose}
          >
            <div className="scienceModalsubBox">
              <img src={ApiImg} alt="api" className="scienceLogo" />
              <div className="scienceForm">
                <div className="scienceFormInside">
                  <form action="">
                    <input className="scienceAuthorInput" type="text" value={this.state.apiTitleSearchTerms || ''} onChange={this.changeApiTitleSearchTerms} placeholder="Search Authors" />
                    <input className="scienceTitleInput" type="text" value={this.state.apiAuthorSearchTerms || ''} onChange={this.changeApiAuthorSearchTerms} placeholder="Search  Articles" />
                    <button className="scienceSearchSubmit button" type="submit" onClick={this.useApiSearchEngine}>Search</button>
                  </form>
                </div>
              </div>
              
              {this.state.isLoading ? (
                <Loading className="mainLoading scienceModalLoading" size={50} />
                ) : null}
              <div className="scienceResultBox">
                <div className="scienceResultAmountBox">
                  <p className="scienceResultAmount" >{resultAmount}</p>
                </div>
                {apiSearchResults}
              </div>
            </div>
            <div className="createGraphButton">
              {
                this.state.checkedList.length
                ? 
                  <>
                    <button 
                      onClick={(ev) => this.getAllNodes(ev)} 
                      className="ghButton accent alt ">
                      Create Graph 
                    </button>
                    <p className="selectedArticlesAmount">Selected Articles {this.state.checkedList.length}</p>
                  </>
                : ""
              }
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
)(ScienceGraphModal);

export default withGoogleMap(Container);
