import axios from 'axios';

class Utils {
  static sleep = (ms) => new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  })

  static fileToBlob = (file) => {
    const URL = window.URL || window.webkitURL;
    return URL.createObjectURL(file);
  }

  static fileToString = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      resolve(ev.target.result);
    };
    reader.readAsText(file, 'UTF-8');
  })

  static blobToBase64 = async (blob) => {
    const { data } = await axios.get(blob);
    return Buffer.from(data, 'binary').toString('base64');
  }
}

export default Utils;
