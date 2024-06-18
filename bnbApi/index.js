import bnbQuery from "./bnbQuery";
import axios from "axios";

class bnbApi {
  constructor(apiKey = "", secret = "") {
    this.apiKey = apiKey;
    this.secret = secret;
  }
  path(url) {
    if (url.match(/^\/api\//)) url = "https://api.binance.com" + url;
    if (url.match(/^\/sapi\//)) url = "https://api.binance.com" + url;
    if (url.match(/^\/papi\//)) url = "https://papi.binance.com" + url;
    if (url.match(/^\/fapi\//)) url = "https://fapi.binance.com" + url;
    if (url.match(/^\/dapi\//)) url = "https://dapi.binance.com" + url;
    return url;
  }
  get(url, params = {}, op = {}) {
    // default: get data
    op.all ||= 0;
    op.head ||= 0;
    op.limit ||= 0;
    op.mbx ||= 0;
    op.public ||= 0;
    op.secret ||= 1;
    op.apiKey ||= 1;
    if (op.public) {
      op.apiKey = 0;
      op.secret = 0;
    }
    return new Promise((res) => {
      url = this.path(url);

      let q = "";
      if (op.secret) {
        q = bnbQuery(params, this.secret);
      } else if (Object.keys(params).length !== 0) {
        q = bnbQuery(params, "");
      }

      let headers = {};
      if (op.apiKey) headers["X-MBX-APIKEY"] = this.apiKey;

      axios({
        url: url + q,
        headers: headers,
      })
        .then((r) => {
          if (op.all) res(r);
          else if (op.head) res(r.headers);
          else if (op.limit)
            res({
              "x-mbx-used-weight-1m": r.headers["x-mbx-used-weight-1m"],
              "X-mbx-order-count-1m": r.headers["X-mbx-order-count-1m"],
              "x-sapi-used-ip-weight-1m": r.headers["x-sapi-used-ip-weight-1m"],
              "x-sapi-used-uid-weight-1m": r.headers["x-sapi-used-uid-weight-1m"],
            });
          else if (op.mbx) res(r.headers["x-mbx-used-weight-1m"]);
          else res(r.data);
        })
        .catch((e) => {
          console.error(e);
        });
    });
  }
  getPublic(url, params = {}, op = {}) {
    // no apiKey,secret
    return this.get(url, params, { ...op, public: 1 });
  }
  getXsecret(url, params = {}, op = {}) {
    // no secret
    return this.get(url, params, { ...op, secret: 0 });
  }
  getAll(url, params = {}, op = {}) {
    // get head + data
    return this.get(url, params, { ...op, all: 1 });
  }
  getHead(url, params = {}, op = {}) {
    // get head only
    return this.get(url, params, { ...op, head: 1 });
  }
  getLimit(url, params = {}, op = {}) {
    return this.get(url, params, { ...op, limit: 1 });
  }
  getMbx(url, params = {}, op = {}) {
    return this.get(url, params, { ...op, mbx: 1 });
  }
}

export default bnbApi;
