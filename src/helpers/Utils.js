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

  static blobToBase64 = async (blob) => {
    const { data } = await axios.get(blob);
    return Buffer.from(data, 'binary').toString('base64');
  }
}

export default Utils;
