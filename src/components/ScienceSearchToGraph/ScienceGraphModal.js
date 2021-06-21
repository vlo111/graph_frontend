import React, { Component } from "react";
import Modal from "react-modal";
import { connect } from "react-redux";
import _ from "lodash";
import PropTypes from "prop-types";
import { toggleNodeModal } from "../../store/actions/app";
import { parseStringPromise } from "xml2js";
import moment from "moment";
import Chart from "../../Chart";
import ChartUtils from "../../helpers/ChartUtils";
import ApiImg from "../../assets/images/icons/science.png";
import arxivImg from "../../assets/images/icons/arxiv.jpg";
import coreImg from "../../assets/images/icons/core.png";
import Api from "../../Api";
import { ScienceCategories } from "../../data/scienceCategory";

const {
  REACT_APP_ARXIV_URL,
  REACT_APP_CORE_URL,
  REACT_APP_ARTICLE_URL,
  REACT_APP_AUTHOR_URL,
} = Api;

class ScienceGraphModal extends Component {
  static propTypes = {
    currentUserId: PropTypes.number.isRequired,
    graphId: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      apiSearchReturnValues: [],
      apiTitleSearchTerms: "",
      apiAuthorSearchTerms: "",
      onClose: PropTypes.func.isRequired,
      getChecked: false,
      searchResults: NaN,
      checkedList: [],
    };
  }
  /**
   * Search user input in core and arxiv APIs
   *
   * @param {object} e
   * @returns
   */
  handleSearch = async (e) => {
    this.setState({
      searchResults: NaN,
      checkedList: [],
    });
    e.preventDefault();

    if (
      (this.state.apiTitleSearchTerms === undefined &&
        this.state.apiAuthorSearchTerms === undefined) ||
      (this.state.apiTitleSearchTerms === "" &&
        this.state.apiAuthorSearchTerms === "")
    ) {
      return;
    }
    this.setState({
      apiSearchReturnValues: [],
    });

    Chart.loading(true);
    const pointerToThis = this;

    // combined author and topic fields and putted it in arxivUrl and coreUrl
    const arxivUrl =
      REACT_APP_ARXIV_URL +
      `search_query=all:${this.state.apiTitleSearchTerms} ${this.state.apiAuthorSearchTerms}&sortBy=relevance&max_results=30`;
    const author = !!this.state.apiAuthorSearchTerms
      ? this.state.apiAuthorSearchTerms
      : "";
    const title = !!this.state.apiTitleSearchTerms
      ? "title:" + this.state.apiTitleSearchTerms
      : "";
    const coreUrl =
      REACT_APP_CORE_URL +
      `"${title} ${author}"?page=1&pageSize=10&fulltext=false&citations=true&metadata=true&apiKey=uRj8cMByiodHF0Z61XQxzVUfqpkYJW2D`;

    const urls = [
      {
        url: arxivUrl,
        name: "arxiv",
      },
      {
        url: coreUrl,
        name: "core",
      },
    ];
    const fetchedSources = await this.fetchUrls(urls);
    // if couldn't find any results return
    if (!fetchedSources.filter((source) => source != undefined)) {
      this.setState({
        searchResults: 0,
      });
      Chart.loading(true);
      return;
    }

    let arxivJsonData = "";
    let coreJsonData = "";
    if (fetchedSources.find((source) => source.name === "arxiv") != undefined) {
      const arxivResponse = fetchedSources.find(
        (source) => source.name === "arxiv"
      ).articles;
      const arxivXml = await arxivResponse.text();
      arxivJsonData = await parseStringPromise(arxivXml);
    }
    if (fetchedSources.find((source) => source.name === "core") != undefined) {
      const coreResponse = fetchedSources.find(
        (source) => source.name === "core"
      ).articles;
      const coreString = await coreResponse.text();
      coreJsonData = JSON.parse(coreString);
    }

    if (!arxivJsonData && !coreJsonData) {
      this.setState({
        searchResults: 0,
      });
      Chart.loading(false);
      return;
    }
    if (arxivJsonData.feed.entry) {
      // collect articles from arix
      await arxivJsonData.feed.entry.map((article) => {
        const categoryAcronim = article.category[0].$.term.trim();
        const category = ScienceCategories.find(
          (category) => category.acronym.trim() == categoryAcronim
        );
        const topics = !!category ? [category.fullName] : undefined;
        let authors = "";
        article.author.map((auth) => (authors += auth.name + ", "));

        pointerToThis.state.apiSearchReturnValues.push({
          authorsList: authors.split(",").slice(0, -1),
          authors: authors,
          url: article.id[0].replace("abs", "pdf") + ".pdf",
          queryResultPageID: article.id[0].split("/").slice(-1)[0],
          title: article.title[0],
          abstract: article.summary[0],
          topics: topics,
          published: article.published[0].split("T")[0],
          origin: ["arxiv"],
        });
      });
    }

    // collect articles from core
    if (coreJsonData && coreJsonData.data) {
      await coreJsonData.data.map((article) => {
        const articleAlreadyExists =
          pointerToThis.state.apiSearchReturnValues.find(
            (arxivArticle, index) => {
              if (arxivArticle.title === article.title) {
                if (
                  !pointerToThis.state.apiSearchReturnValues[
                    index
                  ].origin.includes("core")
                ) {
                  pointerToThis.state.apiSearchReturnValues[index].origin.push(
                    "core"
                  );
                }
                return arxivArticle;
              }
              return;
            }
          );

        if (articleAlreadyExists) {
          return;
        }
        let url = article.downloadUrl;
        if ((url === undefined || url === "") && article.urls) {
          url = article.urls[0];
        }
        if ((url === undefined || url === "") && article.relations) {
          url = article.relations[0];
        }
        if (
          !url ||
          (url.split("/")[0] !== "http:" && url.split("/")[0] !== "https:") ||
          !article.description
        ) {
          return;
        }

        let authors = "";
        article.authors.map((auth) => (authors += auth + ", "));
        const topics = Array.isArray(article.topics)
          ? article.topics
          : article.topics.split(";");

        pointerToThis.state.apiSearchReturnValues.push({
          authors: authors,
          authorsList: article.authors,
          url: url,
          queryResultPageID: article.id,
          title: article.title,
          abstract: article.description,
          topics: topics,
          published:
            article.year < new Date().getFullYear() ? article.year : "", // some articles in core have year 10000
          origin: ["core"],
        });
      });
    }
    this.setState({
      searchResults: pointerToThis.state.apiSearchReturnValues.length,
    });
    Chart.loading(false);
    pointerToThis.forceUpdate();
  };

  /**
   * Get results from core and arix
   *
   * @param {object[]} urls
   * @returns {object[]}
   */
  fetchUrls = async (urls) => {
    const result = await Promise.all(
      urls.map(async (url) => {
        const result = {
          articles: await fetch(url.url),
          name: url.name,
        };
        return result;
      })
    );
    return result;
  };

  changeApiTitleSearchTerms = (e) => {
    this.setState({
      apiAuthorSearchTerms: e.target.value,
    });
  };
  changeApiAuthorSearchTerms = (e) => {
    this.setState({
      apiTitleSearchTerms: e.target.value,
    });
  };

  /**
   * Create nodes for selected Articles
   * @param {object} ev
   */
  createSelectedNodes = async (ev) => {
    const { checkedList } = this.state;
    Chart.loading(true);
    if (!checkedList.length) {
      return;
    }
    const chosenArticles = this.state.checkedList.map((articleIndex) => {
      return this.state.apiSearchReturnValues[parseInt(articleIndex)];
    });
    await this.getArticlesData(chosenArticles).then(async (res) => {
      const newNodes = [];
      res.map((graph) => {
        graph.nodes.map((node) => newNodes.push(node));
      });
      // This code will be used after auto position is fixed for folders
      // Chart.render({}, { isAutoPosition: true });
      // await setTimeout(() => {
      //   Chart.event.emit('auto-position.change', false);
      // }, 2000)
      Chart.render();
      Chart.loading(false);
      this.props.onClose(ev);
    });
    return;
  };

  /**
   * Get articles data from state by selected articles
   *
   * @param {object[]} chosenArticles
   * @returns {object[]}
   */
  getArticlesData = async (chosenArticles) => {
    if (!chosenArticles.length) {
      return;
    }
    const nodes = [...Chart.getNodes()];
    const ArticleList = [];
    for (const chosenArticle in chosenArticles) {
      const new_nodes = [];
      const new_links = [];
      const articleJson = chosenArticles[chosenArticle];
      articleJson.author = true;
      const { title, url, authorsList } = articleJson;

      const article = await this.createNode(
        nodes,
        title.trim(),
        url,
        "article",
        articleJson
      );
      new_nodes.push(article);

      const getAuthorsData = async () => {
        if (!authorsList) {
          return;
        }
        return this.getAuthors(
          authorsList,
          nodes,
          article,
          new_links,
          new_nodes
        );
      };
      // handle empty getAuthorsData
      let AuthorsData = await getAuthorsData().then(this.sendResultsToBackEnd);
      ArticleList.push(AuthorsData);
    }
    return ArticleList;
  };

  /**
   * Create Article/Author Node
   *
   * @param {object[]} nodes
   * @param {string} name
   * @param {string} url
   * @param {string} type
   * @param {object} contentData
   * @returns {object}
   */
  createNode = (nodes, name, url, type, contentData = false) => {
    const { currentUserId } = this.props;
    const updatedAt = moment().unix();
    const icon = contentData.author
      ? REACT_APP_ARTICLE_URL
      : REACT_APP_AUTHOR_URL;
    const keywords = !!contentData.topics ? contentData.topics : [];
    const arxivHref =
      url != undefined
        ? `
        <a href="${url}" target="_blank">
          Go to article
        </a>
      `
        : "";
    const about = contentData.author
      ? `<div>
        <br>Topics: ${contentData.topics}<br>
        <br>Published at: ${contentData.published}<br>
        <br>${contentData.abstract}<br>
        ${arxivHref}
      </div>`
      : false;

    const customFields = about
      ? [
          {
            name: "About",
            subtitle: "",
            value: about,
          },
        ]
      : "";
    const _type = type || _.last(nodes)?.type || "";
    const node = {
      create: true,
      color: ChartUtils.nodeColorObj[_type] || "",
      createdAt: updatedAt,
      createdUser: currentUserId,
      customFields: customFields,
      fx: -189.21749877929688 + Math.random() * 150,
      fy: -61.72186279296875 + Math.random() * 150,
      icon: icon,
      id: ChartUtils.uniqueId(nodes),
      index: 0,
      keywords: keywords,
      d: undefined,
      infographyId: undefined,
      location: undefined,
      labels: [],
      link: url,
      manually_size: 1,
      name: name,
      nodeType: "circle",
      status: "approved",
      type: _type,
      updatedAt: updatedAt,
      updatedUser: currentUserId,
    };
    return node;
  };

  /**
   * Create author nodes compare and connect to article node
   *
   * @param {string[]} authorsList
   * @param {object[]} nodes
   * @param {object} article
   * @param {object[]} new_links
   * @param {object[]} new_nodes
   * @returns {object}
   */
  getAuthors = (authorsList, nodes, article, new_links, new_nodes) => {
    return Promise.all(
      authorsList.map(async (author) => {
        const type = "author";
        const authorData = await this.createNode(
          nodes,
          author.trim(),
          author.url,
          type,
          { topics: article.keywords }
        );
        const target = authorData.id;
        const source = article.id;
        const links = [...(await Chart.getLinks())];
        const { currentUserId } = this.props;

        const existingLink = links.find(
          (link) => link.target === target && link.source === source
        );

        if (!existingLink) {
          const _type = type || _.last(links)?.type || "";
          const link = {
            create: true,
            createdAt: moment().unix(),
            createdUser: currentUserId,
            direction: "",
            id: ChartUtils.uniqueId(links),
            index: 0,
            linkType: "a",
            source: article.id,
            status: "approved",
            target: authorData.id,
            type: _type,
            updatedAt: moment().unix(),
            updatedUser: currentUserId,
            value: 2,
          };
          new_links.push(link);
        }
        new_nodes.push(authorData);
        return { nodes: new_nodes, links: new_links };
      })
    );
  };

  /**
   * Merge all new cerated nodes and links
   *
   * @param {object} res
   * @returns {object}
   */
  sendResultsToBackEnd = async (res) => {
    if (!res) {
      return;
    }
    if (!res.filter((obj) => obj !== undefined).length) {
      return;
    }
    const { graphId } = this.props;
    await Api.dataPast(graphId, undefined, [0, 0], "merge", {
      labels: [],
      nodes: res[0].nodes,
      links: res[0].links,
    }).catch((e) => e.response);
    if (res.status === "error") {
      toast.error(res.message);
      return;
    }
    return { nodes: res[0].nodes, links: res[0].links };
  };

  handleCheckedButton = (param) => {
    const oldCheckedList = this.state.checkedList;
    if (oldCheckedList.includes(param)) {
      this.setState({
        checkedList: oldCheckedList.filter(
          (checkedItems) => checkedItems !== param
        ),
      });
    } else {
      this.state.checkedList.push(param);
    }
    this.setState({
      getChecked: param,
    });
  };

  render() {
    const apiSearchResults = [];
    const resultAmount = Number.isInteger(this.state.searchResults)
      ? `Got ${this.state.searchResults} results`
      : "";
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
              <a
                target="_blank"
                rel="noreferrer"
                href={this.state.apiSearchReturnValues[key3].url}
              >
                {this.state.apiSearchReturnValues[key3].title}
              </a>
            </h3>
            <p className="scienceAuthor">
              {" "}
              <b>Authors:</b> {this.state.apiSearchReturnValues[key3].authors}
            </p>
            {!!this.state.apiSearchReturnValues[key3].topics ? (
              <p className="scienceAuthor">
                {" "}
                <b>Topic:</b>{" "}
                {this.state.apiSearchReturnValues[key3].topics.join(", ")}
              </p>
            ) : (
              ""
            )}
            <p
              className=" scienceArticleDescription"
              dangerouslySetInnerHTML={{
                __html:
                  "Abstract:" +
                    this.state.apiSearchReturnValues[key3].abstract !==
                  undefined
                    ? this.state.apiSearchReturnValues[key3].abstract + "..."
                    : "",
              }}
            />
            <div>
              {this.state.apiSearchReturnValues[key3].origin.includes(
                "arxiv"
              ) ? (
                <img
                  src={arxivImg}
                  alt="arxiv"
                  className="arxivLogo sourceLogo"
                />
              ) : (
                ""
              )}
              {this.state.apiSearchReturnValues[key3].origin.includes(
                "core"
              ) ? (
                <img
                  src={coreImg}
                  alt="arxiv"
                  className="coreLogo sourceLogo"
                />
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
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
                  <input
                    className="scienceAuthorInput scienceInput"
                    type="text"
                    value={this.state.apiAuthorSearchTerms || ""}
                    onChange={this.changeApiTitleSearchTerms}
                    placeholder="Search Authors"
                  />
                  <input
                    className="scienceTitleInput scienceInput"
                    type="text"
                    value={this.state.apiTitleSearchTerms || ""}
                    onChange={this.changeApiAuthorSearchTerms}
                    placeholder="Search  Articles"
                    autoFocus
                  />
                  <button
                    className="scienceSearchSubmit button"
                    type="submit"
                    onClick={this.handleSearch}
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>
            <div className="scienceResultBox">
              <div className="scienceResultAmountBox">
                <p className="scienceResultAmount">{resultAmount}</p>
              </div>
            </div>
            {apiSearchResults}
          </div>
          <div className="createGraphButton">
            {this.state.checkedList.length ? (
              <>
                <button
                  onClick={(ev) => this.createSelectedNodes(ev)}
                  className="ghButton accent alt "
                >
                  Create Graph
                </button>
                <p className="selectedArticlesAmount">
                  Selected Articles {this.state.checkedList.length}
                </p>
              </>
            ) : (
              ""
            )}
          </div>
        </Modal>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  customFields: state.graphs.customFields || {},
  singleGraphId: state.graphs.singleGraph.id,
  currentUserId: state.account.myAccount.id,
});

const mapDispatchToProps = {
  toggleNodeModal,
};

const Container = connect(
  mapStateToProps,
  mapDispatchToProps
)(ScienceGraphModal);

export default ScienceGraphModal;
