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
import ApiImg from '../../assets/images/icons/science.png';
import arxivImg from '../../assets/images/icons/arxiv.jpg';
import coreImg from '../../assets/images/icons/core.png';
import Api from '../../Api';
const { REACT_APP_ARXIV_URL } = process.env;
const { REACT_APP_CORE_URL } = process.env;
const { REACT_APP_SEMANTIC_URL } = process.env;
import Loading from '../Loading';
import { index } from 'd3-array';

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
      checkedList: []
    };
  }

    useApiSearchEngine = async (e) => {
      this.setState({searchResults: NaN})
      e.preventDefault();
      if ((this.state.apiTitleSearchTerms === undefined && 
        this.state.apiAuthorSearchTerms === undefined) || (
        this.state.apiTitleSearchTerms === '' && 
        this.state.apiAuthorSearchTerms === '')
      ) {
        return 0;
      }
      this.setState({
        apiSearchReturnValues: [],
      });
      this.setState({isLoading:true})
      const pointerToThis = this;
      const currentUser = await Api.getMyAccount()
      this.setState({currentUserId: currentUser.data.user.id})
      // combine author name and topic fields and put it in arxivUrl
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

      // if couldn't find any results
      if (!fetchedSources) {
        return 
      }
      const arxivResponse = (fetchedSources.find(source => source.name === 'arxiv')).articles;
      const arxivXml = await arxivResponse.text();
      const arxivJsonData = await parseStringPromise(arxivXml);
      
      const coreResponse = (fetchedSources.find(source => source.name === 'core')).articles;
      const coreString = await coreResponse.text();
      const coreJsonData = JSON.parse(coreString)

      // Handle undefined !!!
      if (!arxivJsonData || arxivJsonData.feed.entry === undefined ) {
        this.setState({searchResults: 0})
        return 0;
      }

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

      // collect articles from core 
      if (coreJsonData && coreJsonData.data) {
        await coreJsonData.data.map(article => {
           
          const articleAlreadyExists = pointerToThis.state.apiSearchReturnValues.find(
            (arxivArticle, index) => {
              if (arxivArticle.title === article._source.title) {

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

          const url = article._source.downloadUrl !== "" 
            ? article._source.downloadUrl
            : article._source.urls[0]

          // article url validation  change to regex
          if (!url || !(url.split('/')[0] === "http:" || url.split('/')[0] !== "https:")) {
            return
          }

          let authors = "";
          article._source.authors.map(auth => authors += auth + ", ");
          pointerToThis.state.apiSearchReturnValues.push({
            authors: authors,
            authorsList: article._source.authors,
            url: url,
            queryResultPageID: article._source.id,
            title: article._source.title,
            abstract: article._source.description,
            origin: ['core'],
          });
        })
      }
      this.setState({searchResults: pointerToThis.state.apiSearchReturnValues.length });
      this.setState({isLoading:false})
      pointerToThis.forceUpdate();
    }

    fetchUrls = async (urls) => {
      if (!urls || urls.length < 1 || !Array.isArray(urls)) {
        return 'error'
      }
      return Promise.all(
        urls.map(async url => {
          return {
            articles: await fetch(url.url),
            name: url.name
          }
        })
      )
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
      const getArticlesData = async () => {
        if (!chosenArticles.length) {
          return
        }
        const theAuthorsData = []
        const nodes = [...Chart.getNodes()];
        const links = [...Chart.getLinks()];
        
        return Promise.all(
          chosenArticles.map(async chosenArticle => {
            const new_nodes = []
            const new_links = []
            const articleJson = chosenArticle
            const { abstract, title, url, authorsList } = articleJson;
            const article = await this.createNodes(
              nodes, 
              title.trim(), 
              url, 
              'article', 
              abstract
            );
            const checkedArticle = await this.compareArticle(nodes, article, ev);
            if (!checkedArticle.isDuplicate) {
              new_nodes.push(checkedArticle.node);
            }

            const getAuthorsData = async () => {
              if (!authorsList) {
                return
              }
              return Promise.all(
                authorsList.map( async (author, index) => {
                  const type = "author"
                  const authorData = await this.createNodes(nodes, author.trim(), author.url, type)
                  const checkedAuthor = await this.compareArticle(nodes, authorData, ev)
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
            return await getAuthorsData().then( async res => {
              // write validations !!!
              // theAuthorsData.push({ nodes: res[0].nodes, links: res[0].links })
              // this.props.onClose(ev);

              // const graphId =  window.location.pathname.substring(
              //   window.location.pathname.lastIndexOf('/') + 1
              // ) Api.dataPast(id, undefined, [x, y], 'merge-compare',
              await Api.dataPast(8, undefined, [0, 0], 'merge', {
                labels: [],
                nodes: res[0].nodes,
                links: res[0].links,
              }).catch((e) => e.response);
              if (res.status === 'error') {
                toast.error(res.message);
                return;
              }
              console.log('inside getAuthorsData', { nodes: res[0].nodes, links: res[0].links });
              debugger
              // Chart.render({ nodes: res[0].nodes, links: res[0].links });
              return { nodes: res[0].nodes, links: res[0].links }
            })
          })
        )
      }
      await getArticlesData().then(res => {
        // write validations !!!
        // theArticlesData.push(res)
        // debugger
        // Chart.render({ nodes: res[0].nodes, links: res[0].links });
        this.props.onClose(ev);
      })
      return 
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
                dangerouslySetInnerHTML={{ __html: "Abstract:"+ this.state.apiSearchReturnValues[key3].abstract.slice(0,300)+"..." }}
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
