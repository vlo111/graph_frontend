import axios from 'axios';
import html2canvas from 'html2canvas';

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

  static base64ToBlob = async (base64) => {
    const { data } = await axios.get(base64, {
      responseType: 'arraybuffer',
    });
    return data;
  }

  static graphToPng = async () => {
    const svg = document.querySelector('#graph svg');
    svg.classList.add('capture');
    const canvas = await html2canvas(svg, { allowTaint: true });
    svg.classList.remove('capture');
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    const img = canvas.toDataURL('image/png');
    document.body.removeChild(canvas);

    return img;
  }
}

export default Utils;
