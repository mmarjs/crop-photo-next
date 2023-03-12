importScripts('md5.js');
onmessage = (e) => {
    var hashData = md5.update(e.data.data).base64();
    postMessage({ hashData });
};