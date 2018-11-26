/* 获取url问号后面的参数 */
const queryUrlParams = (url) => {
  let obj = {};
  let wellIndex = url.indexOf('#');
  wellIndex > -1 ? url = url.replace(/#/, '&hash=') : null;
  let reg = /[?&]([^?&=]+)(?:=([^?&=]*))?/g;
  url.replace(reg, function () {
    obj[arguments[1].toLowerCase()] = arguments[2];
  })
  return obj;
}
module.exports = {
  queryUrlParams
}