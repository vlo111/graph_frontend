import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import Button from '../../components/form/Button';
import { updateMyAccountRequest } from '../../store/actions/account';
import { getUserRequest } from '../../store/actions/profile';
import Input from '../../components/form/Input';
import UpdatePasswordModal from '../../components/account/UpdatePasswordModal';
import ProfileMain from './ProfileMain';





class Profile extends Component {
    static propTypes = {
        updateMyAccountRequest: PropTypes.func.isRequired,
        myAccount: PropTypes.object.isRequired,
    }

    initValues = memoizeOne((requestData) => {
        this.setState({ requestData });
    })

    constructor(props) {
        super(props);
        this.state = {
            requestData: {
                lastName: '',
                firstName: '',
                email: '',
                phone: '',
                bio: '',
                city: '',
                oldPassword: '',
                password: '',
                repeatPassword: '',
            },
            changePassword: false,
            errors: {},
        };
    }

    componentDidMount() {
        const { myAccount } = this.props;
        if (myAccount) {
            this.props.getUserRequest(myAccount.id)
        }
        
    }

    handleChange = (value, path) => {
        const { requestData, errors } = this.state;
        _.set(requestData, path, value);
        _.unset(errors, path, value);
        this.setState({ requestData, errors });
    }


    saveAccount = async (ev) => {
        ev.preventDefault();
        const { requestData } = this.state;
        const { myAccount } = this.props;
        const { payload: { data } } = await this.props.updateMyAccountRequest(requestData);
        if (data.status === 'ok') {
            toast.info('Successfully saved');
        } else if (data?.errors) {
            this.setState({ errors: data.errors });
        } else {
            toast.error('Something went wrong');
        }
        if (requestData.firstName && requestData.lastName) {
            window.location.href = `/profile/${myAccount.id}`;
        }
    }

    toggleChangePassword = (changePassword) => {
        this.setState({ changePassword });
    }

    render() {
        const { errors, requestData, changePassword } = this.state;
        const { myAccount } = this.props;
        this.initValues(myAccount);
        return (
            <div className="profileSettings profileEdit">
                <div className="row_">
                    <div className="colm-md-6">
                        <ProfileMain userId = {myAccount.id} edit={true}/>
                    </div>
                    <div className="colm-md-6">
                        <form onSubmit={this.saveAccount}>
                             <div className="row_">
                                <div className="colm-xs-12">
                                    <Input
                                        name="firstName"
                                        label="First Name"
                                        value={requestData.firstName}
                                        error={errors.firstName}
                                        onChangeText={this.handleChange}
                                        containerClassName="firstName"
                                    />
                                </div>
                                <div className="colm-xs-12">
                                    <Input
                                        name="lastName"
                                        label="Last"
                                        value={requestData.lastName}
                                        error={errors.lastName}
                                        onChangeText={this.handleChange}
                                    />
                                </div>
                                <div className="colm-xs-12">
                                    <Input
                                        name="email"
                                        label="Email"
                                        value={requestData.email}
                                        error={errors.email}
                                        onChangeText={this.handleChange}
                                    />
                                </div>
                                {/* <div className="colm-xs-12">
                                    <Input
                                        name="phone"
                                        label="Phone"
                                        value={requestData.phone}
                                        error={errors.phone}
                                        onChangeText={this.handleChange}
                                    />
                                </div> */}

                                {/* <div className="colm-xs-12 d-flex country-city">
                                    <Select
                                        label="Country"
                                        portal
                                        containerClassName="country"
                                        options={[ { value: 'Armenia', label: 'Armenia' },{ value: 'Russia', label: 'Russia' }]}
                                        value={[{ value: 'Armenia', label: 'Armenia' }]}
                                        error={errors.status}
                                        onChange={(v) => this.handleChange('status', v?.value || '')}
                                    />

                                    <Input
                                        name="city"
                                        label="City/Town"
                                        value={requestData.city}
                                        error={errors.city}
                                        onChangeText={this.handleChange}
                                    />
                                </div> */}
                                <div className="colm-xs-12">
                                    <Input
                                        name="bio"
                                        label="Description"
                                        containerClassName="bio"
                                        textArea
                                        value={requestData.bio}
                                        error={errors.bio}
                                        onChangeText={this.handleChange}
                                    />
                                </div>
                                <div className="colm-xs-12">
                                    <div className="socialT">
                                        Social
                                    </div>
                                    <div className="rigt-input">
                                        <div className="row">
                                            <div className="social_icon_new">
                                                <i className="fa fa-facebook-square" />
                                            </div>
                                            <Input
                                                name="facebook"
                                                type="url"
                                                value={requestData.facebook}
                                                error={errors.facebook}
                                                onChangeText={this.handleChange}
                                                pattern="^(?:https?:\/\/)?(?:www\.|m\.|touch\.)?(?:facebook\.com|fb(?:\.me|\.com))\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*?(\/)?([^/?\s]*)(?:/|&|\?)?.*$"
                                            />
                                        </div>
                                        <div className="row">

                                            <Input
                                                name="twitter"
                                                type="url "
                                                value={requestData.twitter}
                                                error={errors.twitter}
                                                onChangeText={this.handleChange}
                                                pattern="^(?:https?:\/\/)?(?:www\.|m\.|touch\.)?(?:twitter\.com|tw(?:\.me|\.com))\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*?(\/)?([^/?\s]*)(?:/|&|\?)?.*$"

                                            />
                                            <div className="social_icon_new">
                                                <i className="fa fa-twitter" />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="social_icon_new">
                                                <i className="fa fa-linkedin"> </i>
                                            </div>
                                            <Input
                                                name="linkedin"
                                                type="url"
                                                value={requestData.linkedin}
                                                error={errors.linkedin}
                                                onChangeText={this.handleChange}
                                                pattern="^(?:https?:\/\/)?(?:www\.|m\.|touch\.)?(?:linkedin\.com|in(?:\.me|\.com))\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*?(\/)?([^/?\s]*)(?:/|&|\?)?.*$"
                                            />

                                        </div>
                                        <div className="row">

                                            <Input
                                                name="skype"
                                                type="url"
                                                value={requestData.skype}
                                                error={errors.skype}
                                                onChangeText={this.handleChange}
                                                pattern="^(?:https?:\/\/)?(?:www\.|m\.|touch\.)?(?:skype\.com|sk(?:\.me|\.com))\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*?(\/)?([^/?\s]*)(?:/|&|\?)?.*$"
                                            />
                                            <div className="social_icon_new">
                                                <i className="fa fa-skype" />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                {/* <div className="colm-xs-12 interest-box d-flex">
                                    <div className="d-flex fw-bold">Interests</div>
                                    <div>
                                        <div className="add">+Add</div>
                                        <div className="interest">
                                            <div>Nature</div>
                                            <div>Winemaking</div>
                                            <div>Plants</div>
                                            <div>Winemaking</div>
                                            <div>Plants</div>
                                        </div>
                                    </div>
                                </div> */}
                                <div className="colm-xs-12 saveChange">
                                    <div className="d-flex justify-content-end ">
                                        <Button className="changePassword p-0" onClick={() => this.toggleChangePassword(!changePassword)}>
                                            Change Password
                                        </Button>
                                    </div>
                                    <Button className="save"  type="submit">Save</Button>
                                </div>
                            </div>

                        </form>

                    </div>
                </div>
                {changePassword ? (
                    <UpdatePasswordModal
                        onClose={() => this.toggleChangePassword(false)}
                    />
                ) : null}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    myAccount: state.account.myAccount,
});

const mapDispatchToProps = {
    updateMyAccountRequest,
    getUserRequest
};

const Container = connect(
    mapStateToProps,
    mapDispatchToProps,
)(Profile);

export default Container;
