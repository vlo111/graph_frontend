import axios from 'axios';
import _ from 'lodash';
import Bowser from 'bowser';
import memoizeOne from 'memoize-one';
import Api from '../Api';

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
    if (/^https?:\/\//.test(src) || src.toString().includes('base64,')) {
      return src;
    }

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
    navigator.geolocation.getCurrentPosition((position) => {
      resolve(position);
    }, reject);
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
    hex = hex.toUpperCase().replace('#', '');
    const arrBuff = new ArrayBuffer(4);
    const dv = new DataView(arrBuff);
    dv.setUint32(0, parseInt(hex, 16), false);
    const arrByte = [...new Uint8Array(arrBuff)];
    arrByte.shift();
    return opacity ? `rgba(${arrByte.join(',')}, ${opacity})` : `rgb(${arrByte.join(',')})`;
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
}

export default Utils;
