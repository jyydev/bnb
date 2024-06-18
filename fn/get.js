import axios from "axios";

async function get(url, pr = {}, accs = {}) {
  if (Object.keys(accs).length !== 0) {
    let r = await Promise.all(
      Object.values(accs).map((sub) => {
        return sub.getAll(url, pr);
      })
    );
    let dt = {};
    Object.keys(accs).forEach((sub, i) => {
      let mbx1m = r[i].headers?.["x-mbx-used-weight-1m"];
      if (mbx1m > global.mbx1m) global.mbx1m = mbx1m;
      dt[sub] = r[i].data;
    });
    return dt;
  } else {
    if (url.match(/^\/api\//)) url = "https://api.binance.com" + url;
    if (url.match(/^\/sapi\//)) url = "https://api.binance.com" + url;
    if (url.match(/^\/papi\//)) url = "https://papi.binance.com" + url;
    if (url.match(/^\/fapi\//)) url = "https://fapi.binance.com" + url;
    if (url.match(/^\/dapi\//)) url = "https://dapi.binance.com" + url;
    let r = await axios.get(url);
    return r.data;
  }
}

export default get;
