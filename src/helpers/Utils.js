import axios from 'axios';
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'; 
import _ from 'lodash';
import Bowser from 'bowser';
import memoizeOne from 'memoize-one';
import { uuid } from 'uuidv4';
import Api from '../Api';
import { useHistory } from "react-router-dom";
import { deleteGraphRequest } from '../store/actions/graphs';
import { getGraphsListRequest } from '../store/actions/graphs';

const browser = Bowser.getParser(window.navigator.userAgent);

class Utils {
  static sleep = (ms) => new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  })

  static fileToBlob = (file) => {
    try {
      const URL = window.URL || window.webkitURL;
      return URL.createObjectURL(file);
    } catch (e) {
      return null;
    }
  }

  /**
   * Check Image url exist
   * @param url
   * @param callback
   * @param timeout
   */
  static checkImageUrl = (url, callback, timeout) => {
    timeout = timeout || 5000;
    let timedOut = false; let
      timer;
    const img = new Image();
    img.onerror = img.onabort = function () {
      if (!timedOut) {
        clearTimeout(timer);
        callback(url, 'error');
      }
    };
    img.onload = function () {
      if (!timedOut) {
        clearTimeout(timer);
        callback(url, 'success');
      }
    };
    img.src = url;
    timer = setTimeout(() => {
      timedOut = true;
      callback(url, 'timeout');
    }, timeout);
  }

  /**
   * Get FileReader form url string
   * @param dataurl
   * @param filename
   * @returns {File}
   */
  static dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');

    const mime = arr[0].match(/:(.*?);/)[1];

    const bstr = atob(arr[1]);

    let n = bstr.length;

    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  static fileToString = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
    reader.readAsText(file, 'UTF-8');
  })

  static blobToBase64 = async (blob) => {
    try {
      const {
        data,
        headers: { 'content-type': type },
      } = await axios.get(blob, { responseType: 'arraybuffer' });
      const base64 = Buffer.from(data, 'binary').toString('base64');
      return `data:${type};base64,${base64}`;
    } catch (e) {
      console.warn(e);
      return null;
    }
  }

  static base64ToBlob = async (base64) => {
    const { data } = await axios.get(base64, {
      responseType: 'arraybuffer',
    });
    return data;
  }

  static fileSrc(src) {
    if (src.uri) {
      src = src.uri;
    }
    if (/^https?:\/\//.test(src) || src.toString().includes('base64,') || src.toString().startsWith('blob:')) {
      return src;
    }
    if(!src) return; 
    
    return `${Api.url}${src}`;
  }

  static getOS() {
    return browser.getOS().name.toLowerCase();
  }

  static getBrowser() {
    return browser.getBrowserName().toLowerCase();
  }

  static escRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  static getCurrentPosition = memoizeOne(() => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Error: Your browser doesn't support geolocation."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject);
  }))

  static popupWindow = (url, title, width, height) => {
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    const params = {
      toolbar: 'no',
      location: 'no',
      directories: 'no',
      status: 'no',
      menubar: 'no',
      scrollbars: 'no',
      resizable: 'no',
      copyhistory: 'no',
      width,
      height,
      top,
      left,
    };
    return window.open(url, title, _.map(params, (v, k) => `${k}=${v}`).join(', '));
  }

  static moveCursorToEnd(el) {
    const pos = el.value.length;
    if (el.setSelectionRange) {
      el.focus();
      el.setSelectionRange(pos, pos);
    } else if (el.createTextRange) {
      const range = el.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  }

  static isInEmbed() {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  static hexToRgb(hex, opacity = 1) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return opacity ? `rgba(${r}, ${g}, ${b}, ${opacity})` : `rgb(${r}, ${g}, ${b})`;
  }

  static orderGroup(groups, curentType) {
    if (groups.length > 1) {
      groups = groups.sort((a, b) => {
        if (a.value?.toUpperCase() < b.value?.toUpperCase()) return -1;
        if (a.value?.toUpperCase() > b.value?.toUpperCase()) return 1;
        return 0;
      });

      const indexValue = groups.map((p) => (p ? p.value : null)).indexOf(curentType);

      if (indexValue > 0) {
        const firstItem = groups.find((p) => p.value === curentType);
        groups.splice(indexValue, 1);

        groups.unshift(firstItem);
      }
    }
  }

  static wikiContentUrlByName(name) {
    let url = 'https://en.wikipedia.org/w/api.php';

    const params = {
      action: 'query',
      prop: 'extracts',
      titles: name,
      exintro: 0,
      explaintext: 0,
      redirects: 1,
      format: 'json',
    };

    url += '?origin=*';

    Object.keys(params).forEach((key) => {
      url += `&${key}=${params[key]}`;
    });

    return url;
  }

  static wikifirstImageUrlByName(name) {
    let url = 'https://en.wikipedia.org/w/api.php';

    const params = {
      action: 'query',
      prop: 'pageimages',
      piprop: 'original',
      titles: name,
      format: 'json',
    };

    url += '?origin=*';

    Object.keys(params).forEach((key) => {
      url += `&${key}=${params[key]}`;
    });

    return url;
  }

  static wikiUrlByImage(name) {
    let url = 'https://en.wikipedia.org/w/api.php';

    const params = {
      action: 'query',
      prop: 'imageinfo|categories',
      generator: 'search',
      gsrsearch: 'roses',
      gsrnamespace: '6',
      format: 'json',
    };

    url += '?origin=*';

    Object.keys(params).forEach((key) => {
      url += `&${key}=${params[key]}`;
    });

    return url;
  }

  static async getWikiContent(url) {
    return fetch(url)
      .then((response) => response.json())
      .then((response) => Object.values(response.query.pages)[0].extract)
      .catch((error) => {
        console.log(error);
      });
  }

  static async getWikiImage(url) {
    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const result = data.query.pages;
        const id = Object.keys(result)[0];
        if (result[id].original) {
          const imgURL = result[id].original.source;
          console.log(imgURL);
          return imgURL;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  static getGraphIdFormUrl() {
    const [, graphId] = window.location.pathname.match(/\/(\d+)$/) || [];
    return +graphId || '';
  }

  static mergeDeep(a, b) {
    return _.mergeWith({}, a, b, (objValue, srcValue) => {
      if (_.isArray(srcValue)) {
        return srcValue;
      }
      return undefined;
    });
  }

  static differenceNested(object, base) {
    function changes(_object, _base) {
      return _.transform(_object, (result, value, key) => {
        console.log(value, _base[key]);
        if (!_.isEqual(value, _base[key])) {
          result[key] = (_.isObject(value) && _.isObject(_base[key])) ? changes(value, _base[key]) : value;
        }
      });
    }

    return changes(object, base);
  }

  static #InfographyImageWidth = {};

  static getInfographyImageWidth = (icon) => new Promise((resolve) => {
    if (this.#InfographyImageWidth[icon]) {
      resolve(this.#InfographyImageWidth[icon]);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const acceptRatio = img.naturalWidth / img.naturalHeight; // 384
      const width = (512 * acceptRatio).toFixed(2);
      this.#InfographyImageWidth[icon] = width;
      resolve(width);
    };
    img.src = icon;
  });

  static arrayMove = (array, from, to) => {
    const arrayMoveMutate = (arr, f, t) => {
      const startIndex = f < 0 ? arr.length + f : f;

      if (startIndex >= 0 && startIndex < arr.length) {
        const endIndex = t < 0 ? arr.length + t : t;

        const [item] = arr.splice(f, 1);
        arr.splice(endIndex, 0, item);
      }
    };
    array = [...array];
    arrayMoveMutate(array, from, to);
    return array;
  }

    /**
     * Generate id uuidv4 version 4
     * @returns {string} // uniq id
     */
    static generateUUID = () => uuid()

    /**
     * Tab editor element
     * @param customField
     * @returns {{documentElement: NodeListOf<Element>}}
     */
    static tabHtmlFile = (customField) => {
      const tempDiv = document.createElement('div');

      tempDiv.innerHTML = customField.trim();

      const documentElement = tempDiv.querySelectorAll('.document');

      return { documentElement };
    }

  /**
   * check img on path
   * @param link
   * @returns {boolean}
   */
  static isImg = (link) => !_.isEmpty(['png', 'jpg', 'jpeg', 'gif', 'svg', 'jfif']
    .filter((v) => link.includes(v)))
}

export default Utils;
