import hmacSHA256 from "crypto-js/hmac-sha256";

function sig(query_string, apiSecret) {
  return hmacSHA256(query_string, apiSecret).toString();
}

function urlQuery(params = {}, apiSecret) {
  params.timestamp = Date.now();
  const queryString = new URLSearchParams(params).toString();
  return `?${queryString}&signature=${sig(queryString, apiSecret)}`;
}

export default urlQuery;
