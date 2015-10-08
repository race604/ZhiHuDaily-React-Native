'use strict';

var invariant = require('invariant');
var isEmpty = require('isEmpty');
var warning = require('warning');

function defaultGetPageData(
  dataBlob: any,
  pageID: number | string,
): any {
  return dataBlob[pageID];
}

type differType = (data1: any, data2: any) => bool;

type ParamType = {
  pageHasChanged: differType;
  getPageData: ?typeof defaultGetPageData;
}

class ViewPagerDataSource {

  constructor(params: ParamType) {
    this._getPageData = params.getPageData || defaultGetPageData;
    this._pageHasChanged = params.pageHasChanged;

    this.pageIdentities = [];
  }

  cloneWithPages(
      dataBlob: any,
      pageIdentities: ?Array<string>,
  ): ViewPagerDataSource {

    var newSource = new ViewPagerDataSource({
      getPageData: this._getPageData,
      pageHasChanged: this._pageHasChanged,
    });

    newSource._dataBlob = dataBlob;

    if (pageIdentities) {
      newSource.pageIdentities = pageIdentities;
    } else {
      newSource.pageIdentities = Object.keys(dataBlob);
    }

    newSource._cachedPageCount = newSource.pageIdentities.length;
    newSource._calculateDirtyPages(
      this._dataBlob,
      this.pageIdentities
    );
    return newSource;
  }

  getPageCount(): number {
    return this._cachedPageCount;
  }

  /**
   * Returns if the row is dirtied and needs to be rerendered
   */
  pageShouldUpdate(pageIndex: number): bool {
    var needsUpdate = this._dirtyPages[pageIndex];
    warning(needsUpdate !== undefined,
      'missing dirtyBit for section, page: ' + pageIndex);
    return needsUpdate;
  }

  /**
   * Gets the data required to render the page
   */
  getPageData(pageIndex: number): any {
    if (!this.getPageData) {
      return null;
    }
    var pageID = this.pageIdentities[pageIndex];
    warning(pageID !== undefined,
      'renderPage called on invalid section: ' + pageID);
    return this._dataBlob[pageID];
  }

  /**
   * Private members and methods.
   */

  _getPageData: typeof defaultGetPageData;
  _pageHasChanged: differType;

  _dataBlob: any;
  _dirtyPages: Array<bool>;
  _cachedRowCount: number;

  pageIdentities: Array<string>;

  _calculateDirtyPages(
    prevDataBlob: any,
    prevPageIDs: Array<string>,
  ): void {
    // construct a hashmap of the existing (old) id arrays
    var prevPagesHash = keyedDictionaryFromArray(prevPageIDs);
    this._dirtyPages = [];

    var dirty;
    for (var sIndex = 0; sIndex < this.pageIdentities.length; sIndex++) {
      var pageID = this.pageIdentities[sIndex];
      dirty = !prevPagesHash[pageID];
      var pageHasChanged = this._pageHasChanged
      if (!dirty && pageHasChanged) {
        dirty = pageHasChanged(
          this._getPageData(prevDataBlob, pageID),
          this._getPageData(this._dataBlob, pageID)
        );
      }
      this._dirtyPages.push(!!dirty);
    }
  }

}

function keyedDictionaryFromArray(arr) {
  if (isEmpty(arr)) {
    return {};
  }
  var result = {};
  for (var ii = 0; ii < arr.length; ii++) {
    var key = arr[ii];
    warning(!result[key], 'Value appears more than once in array: ' + key);
    result[key] = true;
  }
  return result;
}

module.exports = ViewPagerDataSource;
