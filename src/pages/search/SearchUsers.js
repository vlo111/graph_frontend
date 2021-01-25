import React, { Component } from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { Link, withRouter } from 'react-router-dom';
import memoizeOne from 'memoize-one';
import PropTypes from 'prop-types';
import AddFriend from './addFriend';
import { getUsersByTextRequest } from '../../store/actions/account';
import { myFriendsRequest } from '../../store/actions/userFriends';

class SearchUsers extends Component {
  static propTypes = {
    setLimit: PropTypes.bool,
    getUsersByTextRequest: PropTypes.func.isRequired,
    myFriendsRequest: PropTypes.func.isRequired,
    userSearch: PropTypes.array.isRequired,
  };

  static defaultProps = {
    setLimit: false,
  }

  searchUsers = memoizeOne((searchParam) => {
    this.props.getUsersByTextRequest(searchParam);
  })

  componentDidMount() {
    this.props.myFriendsRequest();
  }

  render() {
    const { setLimit, userSearch } = this.props;
    const { s: searchParam } = queryString.parse(window.location.search);
    this.searchUsers(searchParam);

    return (
      <div className="searchData">
        {userSearch && userSearch.length ? (
          <div className="searchData__wrapper">
            <h3>{`${userSearch.length > 1 ? 'People' : 'Person'}`}</h3>
            {userSearch.slice(0, 5).map((user) => (
              <article key={user.id} className="searchData__graph">
                <div className="searchData__graphInfo">
                  <img
                    className="avatar"
                    src={user.avatar}
                    alt={user.firstName}
                  />
                  <div className="searchData__graphInfo-details">
                    <Link to={`/profile/${user.id}`}>
                      {`${user.firstName} ${user.lastName}`}
                    </Link> 
                  </div>
                </div>
                <div>
                  <AddFriend user={user} />
                </div>
              </article>
            ))}
            {
              setLimit && userSearch.length > 5
              && <div className="viewAll"><Link to={`search-people?s=${searchParam}`}>View all</Link></div>
            }
          </div>
        ) : ((!setLimit && <h3>No User Found</h3>) || null)}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userSearch: state.account.userSearch,
});
const mapDispatchToProps = {
  getUsersByTextRequest,
  myFriendsRequest,
};
const Container = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchUsers);

export default withRouter(Container);
