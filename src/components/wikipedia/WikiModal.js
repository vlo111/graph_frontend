import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { setActiveButton, toggleNodeModal } from '../../store/actions/app';
import withGoogleMap from '../../helpers/withGoogleMap';
import Utils from '../../helpers/Utils';
import WikiImg from '../../assets/images/wikipedia_black.png';

class WikiModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      wikiSearchReturnValues: [],
      wikiSearchTerms: '',
      getChecked: false,
    };
  }

  useWikiSearchEngine = (e) => {
    e.preventDefault();
    if (this.state.WikiSearchTerms === undefined) {
      return 0;
    }
    this.setState({
      wikiSearchReturnValues: [],
    });

    const pointerToThis = this;

    let url = 'https://en.wikipedia.org/w/api.php';

    const params = {
      action: 'query',
      list: 'search',
      srsearch: this.state.WikiSearchTerms,
      format: 'json',
    };

    url = `${url}?origin=*`;
    Object.keys(params).forEach((key) => {
      url += `&${key}=${params[key]}`;
    });

    fetch(url)
      .then((response) => response.json())
      .then((response) => {
        // console.log(response);

        for (const key in response.query.search) {
          pointerToThis.state.wikiSearchReturnValues.push({
            queryResultPageFullURL: 'no link',
            queryResultPageID: response.query.search[key].pageid,
            queryResultPageTitle: response.query.search[key].title,
            queryResultPageSnippet: response.query.search[key].snippet,
          });
        }
      })
      .then((response) => {
        for (const key2 in pointerToThis.state.wikiSearchReturnValues) {
          // console.log(pointerToThis.state.wikiSearchReturnValues);
          const page = pointerToThis.state.wikiSearchReturnValues[key2];
          const pageID = page.queryResultPageID;
          const urlForRetrievingPageURLByPageID = `https://en.wikipedia.org/w/api.php?origin=*&action=query&prop=info&pageids=${pageID}&inprop=url&format=json`;

          fetch(urlForRetrievingPageURLByPageID)
            .then((response) => response.json())
            .then((response) => {
              page.queryResultPageFullURL = response.query.pages[pageID].fullurl;

              pointerToThis.forceUpdate();
            });
        }
      });
  };

    changeWikiSearchTerms = (e) => {
      this.setState({
        WikiSearchTerms: e.target.value,
      });
    };

    openAddNewNode = async (ev) => {
      const { getChecked } = this.state;
      if (getChecked === false) {
        return;
      }
      const name = this.state.wikiSearchReturnValues[this.state.getChecked]
        .queryResultPageTitle;

      const desc = this.state.wikiSearchReturnValues[0].queryResultPageSnippet;

      const contentUrl = Utils.wikiContentUrlByName(name);

      const firstImageUrl = Utils.wikifirstImageUrlByName(name);

      const wikiContentData = await Utils.getWikiContent(contentUrl);

      const wikiImageData = await Utils.getWikiImage(firstImageUrl);

      const abount = `<div>
<strong class="tabHeader">About</strong><br>
<br>${wikiContentData}<br>
<a href="https://en.wikipedia.org/wiki/${name}" target="_blank">
https://en.wikipedia.org/wiki/${name}
</a>
</div>`;

      const x = 100;
      const y = 100;
      this.props.toggleNodeModal({
        x,
        y,
        name,
        type: 'wikipedia',
        description: desc,
        icon: wikiImageData,
        customFields: [
          {
            name: 'About',
            subtitle: '',
            value: abount,
          },
        ],
      });
      this.close();
    };

  close = () => {
    this.props.setActiveButton('create');
  };

    checkedWiki = (param) => {
      this.setState({
        getChecked: param,
      });
    };

    render() {
      const { getChecked } = this.state;
      const wikiSearchResults = [];

      for (const key3 in this.state.wikiSearchReturnValues) {
        wikiSearchResults.push(
          <div className="wikiSearch" tabIndex="0" htmlFor={key3}>
            <label htmlFor={key3}>
              <div>
                <input
                  onChange={() => this.checkedWiki(key3)}
                  checked={!getChecked ? getChecked : key3 === getChecked}
                  type="checkbox"
                  id={key3}
                />
              </div>
              <div>
                <h3>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={
                    this.state.wikiSearchReturnValues[key3]
                      .queryResultPageFullURL
                  }
                  >
                    {this.state.wikiSearchReturnValues[key3].queryResultPageTitle}
                  </a>
                </h3>
                <span className="link">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={
                    this.state.wikiSearchReturnValues[key3]
                      .queryResultPageFullURL
                  }
                  >
                    {
                    this.state.wikiSearchReturnValues[key3]
                      .queryResultPageFullURL
                  }
                  </a>
                </span>
                <p
                  className="description"
                  dangerouslySetInnerHTML={{
                    __html:
                    this.state.wikiSearchReturnValues[key3]
                      .queryResultPageSnippet,
                  }}
                />
                <button
                  onClick={(ev) => this.openAddNewNode(ev)}
                  className="ghButton accent alt WikiCreateNode"
                >
                  Create Node
                </button>
              </div>
            </label>
          </div>,
        );
      }

      return (
        <>
          <Modal
            isOpen
            className="ghModal ghMapsModal wikiModal"
            overlayClassName="ghModalOverlay ghMapsModalOverlay"
            onRequestClose={this.close}
          >
            <img src={WikiImg} alt="wikipedia" className="wikipediaLogo" />
            <div className="Wiki">
              <form action="">
                <input
                  type="text"
                  value={this.state.WikiSearchTerms || ''}
                  onChange={this.changeWikiSearchTerms}
                  placeholder="Search Wikipedia Articles"
                />
                <button type="submit" onClick={this.useWikiSearchEngine}>
                  Search
                </button>
              </form>
            </div>
            <div className="Wiki  wikiresult">{wikiSearchResults}</div>
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
  setActiveButton,
};

const Container = connect(mapStateToProps, mapDispatchToProps)(WikiModal);

export default withGoogleMap(Container);
