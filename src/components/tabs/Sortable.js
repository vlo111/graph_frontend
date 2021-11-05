import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import Tooltip from 'rc-tooltip/es';
import Utils from '../../helpers/Utils';
import MapsInfo from '../maps/MapsInfo';
import Button from '../form/Button';
import CustomFields from '../../helpers/CustomFields';
import { ReactComponent as PlusSvg } from '../../assets/images/icons/plus.svg';
import { ReactComponent as DescriptionSvg } from '../../assets/images/icons/tab-description.svg';
import { ReactComponent as DescriptionActiveSvg } from '../../assets/images/icons/tab-description-active.svg';
import { ReactComponent as LocationSvg } from '../../assets/images/icons/location.svg';
import { ReactComponent as LocationActiveSvg } from '../../assets/images/icons/location-active.svg';
import { ReactComponent as LeftArrowSvg } from '../../assets/images/icons/left-arrow.svg';
import { ReactComponent as RightArrowSvg } from '../../assets/images/icons/right-arrow.svg';

class Sortable extends Component {
    static propTypes = {
      keyExtractor: PropTypes.func,
      onChange: PropTypes.func.isRequired,
      renderItem: PropTypes.func.isRequired,
      items: PropTypes.array.isRequired,
    }

    constructor(props) {
      super(props);
      this.state = {
        rightArrow: true,
        leftArrow: false,
      };
    }

    static defaultProps = {
      keyExtractor: (val) => val.id,
    }

    componentDidMount() {
      this.getTabElement().addEventListener('mousewheel', this.handleNavigation);
    }

    componentWillUnmount() {
      this.getTabElement().removeEventListener('mousewheel', this.handleNavigation);
    }

    getTabElement = () => document.getElementsByClassName('tab-data')[0]

    scrollLeft = () => {
      const { rightArrow } = this.state;

      if (!rightArrow) {
        this.setState({
          rightArrow: !rightArrow,
        });
      }
      const scrollLeft = this.getTabElement().scrollLeft -= 400;

      if (scrollLeft <= 0) {
        this.setState({
          leftArrow: false,
        });
      }
    }

    scrollWidth = () => {
      let tabDataWidth = 0;

      const tabButtonsElement = document.querySelectorAll('.tab-data .tab-button');

      Array.from(tabButtonsElement).forEach((el) => {
        tabDataWidth += el.clientWidth;
      });

      tabDataWidth += (tabButtonsElement.length * 5);

      const tabBarWidth = this.getTabElement().clientWidth;

      return tabDataWidth - tabBarWidth;
    }

    scrollRight = () => {
      const { leftArrow } = this.state;

      if (!leftArrow) {
        this.setState({
          leftArrow: !leftArrow,
        });
      }

      const scrollLeft = this.getTabElement().scrollLeft += 400;

      const scrollWidth = this.scrollWidth();

      if (scrollWidth <= scrollLeft) {
        this.setState({
          rightArrow: false,
        });
      }
    }

    handleNavigation = (ev) => {
      this.getTabElement().scrollLeft += (ev.deltaY * -5);

      if (this.getTabElement().scrollLeft <= 0) {
        this.setState({
          leftArrow: false,
        });
      } else {
        this.setState({
          leftArrow: true,
        });
      }

      const scrollWidth = this.scrollWidth();

      if (scrollWidth <= this.getTabElement().scrollLeft) {
        this.setState({
          rightArrow: false,
        });
      } else {
        this.setState({
          rightArrow: true,
        });
      }
    }

    handleSortEnd = ({ oldIndex, newIndex }) => {
      const { items } = this.props;
      this.props.onChange(Utils.arrayMove(items, oldIndex, newIndex));
    }

    onClose = (data) => {
      this.props.onClose(data);

      if (data) {
        this.setState({ formModalOpen: null, activeTab: data.name });
      }
    }

    sortableItem = SortableElement((props) => this.props.renderItem(props));

    sortableList = SortableContainer(({ items }) => {
      const SortableItem = this.sortableItem;
      const { editable, node, activeTab } = this.props;

      const { rightArrow, leftArrow } = this.state;

      return (
        <div className="sortable">
          <div className="description">
            <Tooltip overlay="Description" placement="top">
              <Button
                className="document tab-button"
                icon={activeTab === '_description' ? <DescriptionActiveSvg /> : <DescriptionSvg />}
                onClick={() => this.props.setActiveTab('_description')}
              />
            </Tooltip>
          </div>
          <div onClick={this.scrollLeft} className={`left-arrow ${!leftArrow ? 'left-arrow_inactive' : ''}`}>
            <LeftArrowSvg />
          </div>
          <div className="tab-data">
            {items.map((value, index) => (
              <SortableItem
                onClick={() => this.props.setActiveTab(value)}
                key={this.props.keyExtractor(value)}
                index={index}
                value={value}
              />
            ))}
          </div>
          <div onClick={this.scrollRight} className={`right-arrow ${!rightArrow ? 'right-arrow_inactive' : ''}`}>
            <RightArrowSvg />
          </div>

          {node?.location?.length ? (
            <div className="location">
              <Tooltip overlay="Location" placement="top">
                <Button
                  className="tab-button"
                  icon={activeTab === '_location' ? <LocationActiveSvg /> : <LocationSvg />}
                  onClick={() => this.props.setActiveTab('_location')}
                />
              </Tooltip>
            </div>
          ) : null}

          <div className="add-tab">
            {editable && !node.sourceId && node.customFields?.length < CustomFields.LIMIT ? (
              <Tooltip overlay="Add New Index" placement="top">
                <Button
                  className="addTab tab-button"
                  icon={<PlusSvg />}
                  onClick={this.props.openAddTabModal}
                />
              </Tooltip>
            ) : null}
          </div>
        </div>
      );
    });

    render() {
      const SortableList = this.sortableList;
      const {
        items, onChange, keyExtractor, renderItem, activeTab, node, ...props
      } = this.props;

      return (
        <>
          <SortableList
            axis="x"
            helperClass="sortableListItem"
            items={items}
            onSortEnd={this.handleSortEnd}
            {...props}
          />
          {(activeTab === '_location') && (
          <MapsInfo node={node} />
          )}
        </>
      );
    }
}

export default Sortable;
