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
      <>
        {userSearch && userSearch.length ? (
          <>
            {/* <h3>{`${userSearch.length > 1 ? 'People' : 'Person'}`}</h3> */}
            {userSearch.slice(0, 5).map((user) => (
              <article key={user.id} className="graphs">
                <div className="searchData__graphUsers">  
                    <Link to={`/profile/${user.id}`}>
                      <span className='author'>{`${user.firstName} ${user.lastName}`}</span>
                    </Link> 
                  <div>
                  <AddFriend user={user} />
                  </div>
                </div>
                <div className='searchData__graphUsers_img'>
                <img
                    className="avatar UserImage"
                    src={user.avatar}
                    alt={user.firstName}
                  />
                </div>
              </article>
            ))}
            {
              setLimit && userSearch.length > 5
              && <div className="viewAll"><Link to={`search-people?s=${searchParam}`}>View all</Link></div>
            }
          </>
        ) : ((!setLimit && <h3>No User Found</h3>) || null)}
      </>
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
