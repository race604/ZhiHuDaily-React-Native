'use strict';

var React = require('react-native');
var {
  Dimensions,
  Text,
  View,
  TouchableOpacity,
  PanResponder,
  Animated,
  PropTypes,
  StyleSheet,
} = React;

var StaticRenderer = require('StaticRenderer');

var DefaultViewPageIndicator = require('./DefaultViewPageIndicator');
var deviceWidth = Dimensions.get('window').width;
var ViewPagerDataSource = require('./ViewPagerDataSource');

var ViewPager = React.createClass({

  statics: {
    DataSource: ViewPagerDataSource,
  },

  propTypes: {
    ...View.propTypes,
    dataSource: PropTypes.instanceOf(ViewPagerDataSource).isRequired,
    renderPage: PropTypes.func.isRequired,
    isLoop: PropTypes.bool,
    locked: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      isLoop: false,
      locked: false,
    }
  },

  getInitialState() {
    return {
      currentPage: 0,
      viewWidth: 0,
      childIndex: 0,
      scrollValue: new Animated.Value(0)
    };
  },

  componentWillMount() {
    var release = (e, gestureState) => {
      var relativeGestureDistance = gestureState.dx / deviceWidth,
          //lastPageIndex = this.props.children.length - 1,
          vx = gestureState.vx;

      var step = 0;
      if (relativeGestureDistance < -0.5 || (relativeGestureDistance < 0 && vx <= 0.5)) {
        step = 1;
      } else if (relativeGestureDistance > 0.5 || (relativeGestureDistance > 0 && vx >= 0.5)) {
        step = -1;
      }

      this.props.hasTouch && this.props.hasTouch(false);

      this._movePage(step);
    }

    this._panResponder = PanResponder.create({
      // Claim responder if it's a horizontal pan
      onMoveShouldSetPanResponder: (e, gestureState) => {
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          if (/* (gestureState.moveX <= this.props.edgeHitWidth ||
              gestureState.moveX >= deviceWidth - this.props.edgeHitWidth) && */
                this.props.locked !== true && !this.state.fling) {
            this.props.hasTouch && this.props.hasTouch(true);
            return true;
          }
        }
      },

      // Touch is released, scroll to the one that you're closest to
      onPanResponderRelease: release,
      onPanResponderTerminate: release,

      // Dragging, move the view with the touch
      onPanResponderMove: (e, gestureState) => {
        var dx = gestureState.dx;
        var offsetX = -dx / this.state.viewWidth + this.state.childIndex;
        this.state.scrollValue.setValue(offsetX);
      },
    });
  },

  goToPage(pageNumber) {
    console.log('goToPage: ', pageNumber);
    var pageCount = this.props.dataSource.getPageCount();
    if (pageNumber < 0 || pageNumber >= pageCount) {
      console.error('Invalid page number: ', pageNumber);
      return
    }

    var step = pageNumber - this.state.currentPage;
    this._movePage(step);
  },

  _movePage(step) {
    var pageCount = this.props.dataSource.getPageCount();
    var pageNumber = this.state.currentPage + step;

    if (this.props.isLoop) {
      pageNumber = (pageNumber + pageCount) % pageCount;
    } else {
      pageNumber = Math.min(Math.max(0, pageNumber), pageCount - 1);
    }

    this.props.onChangeTab && this.props.onChangeTab({
      i: pageNumber, ref: this.props.children[pageNumber]
    });

    var moved = pageNumber !== this.state.currentPage;

    var scrollStep = (moved ? step : 0) + this.state.childIndex;

    this.state.fling = true;
    Animated.spring(this.state.scrollValue, {toValue: scrollStep, friction: 10, tension: 50})
      .start((event) => {
        if (event.finished) {
          this.state.fling = false;
          this.setState({
            currentPage: pageNumber,
          });
        }
      });
  },

  renderPageIndicator(props) {
    if (this.props.renderPageIndicator === false) {
      return null;
    } else if (this.props.renderPageIndicator) {
      return React.cloneElement(this.props.renderPageIndicator(), props);
    } else {
      return (
        <View style={styles.indicators}>
          <DefaultViewPageIndicator {...props} />
        </View>
      );
    }
  },

  _getPage(pageIdx: number) {
    var dataSource = this.props.dataSource;
    var pageID = dataSource.pageIdentities[pageIdx];
    return (
      <StaticRenderer
        key={'p_' + pageID}
        shouldUpdate={true}
        render={this.props.renderPage.bind(
          null,
          dataSource.getPageData(pageIdx),
          pageID
        )}
      />
    );
  },

  render() {
    console.log('render()', this.state.currentPage);
    var dataSource = this.props.dataSource;
    var pageIDs = dataSource.pageIdentities;

    var bodyComponents = [];

    var pagesNum = 0;
    var hasLeft = false;
    var viewWidth = this.state.viewWidth;

    if(pageIDs.length > 0 && viewWidth > 0) {
      // left page
      if (this.state.currentPage > 0) {
        bodyComponents.push(this._getPage(this.state.currentPage - 1));
        pagesNum++;
        hasLeft = true;
      } else if (this.state.currentPage == 0 && this.props.isLoop) {
        bodyComponents.push(this._getPage(pageIDs.length - 1));
        pagesNum++;
        hasLeft = true;
      }

      // center page
      bodyComponents.push(this._getPage(this.state.currentPage));
      pagesNum++;

      // right page
      if (this.state.currentPage < pageIDs.length - 1) {
        bodyComponents.push(this._getPage(this.state.currentPage + 1));
        pagesNum++;
      } else if (this.state.currentPage == pageIDs.length - 1 && this.props.isLoop) {
        bodyComponents.push(this._getPage(0));
        pagesNum++;
      }
    }

    var sceneContainerStyle = {
      width: this.state.viewWidth * pagesNum,
      flex: 1,
      flexDirection: 'row'
    };

    this.state.childIndex = hasLeft ? 1 : 0;
    this.state.scrollValue.setValue(this.state.childIndex);
    var translateX = this.state.scrollValue.interpolate({
      inputRange: [0, 1], outputRange: [0, -viewWidth]
    });

    return (
      <View style={{flex: 1, width: deviceWidth, backgroundColor: '#FCF4FF'}}
        onLayout={(event) => {
            // console.log('ViewPager.onLayout()');
            var viewWidth = event.nativeEvent.layout.width;
            if (!viewWidth || this.state.viewWidth === viewWidth) {
              return;
            }
            this.setState({
              currentPage: this.state.currentPage,
              viewWidth: viewWidth,
            });
          }}
        >

        <Animated.View style={[sceneContainerStyle, {transform: [{translateX}]}]}
          {...this._panResponder.panHandlers}>
          {bodyComponents}
        </Animated.View>

        {this.renderPageIndicator({goToPage: this.goToPage,
                            pageCount: pageIDs.length,
                            activePage: this.state.currentPage,
                            scrollValue: this.state.scrollValue,
                          })}
      </View>
    );
  }
});

var styles = StyleSheet.create({
  indicators: {
    flex: 1,
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
});

module.exports = ViewPager;
