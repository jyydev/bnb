import bnbApi from "../bnbApi";

function getAccs(u) {
  let r;
  switch (u) {
    case "t2":
      r = process.env.tmp2;
      break;
    case "y":
      r = process.env.ysubs;
      break;
    case "d":
      r = process.env.dsubs;
      break;
    case "j":
      r = process.env.jsubs;
      break;
    case "j2":
      r = process.env.jsubs2;
      break;
    case "m":
      r = process.env.msubs;
      break;
    case "m2":
      r = process.env.msubs2;
      break;
    default:
      r = process.env.tmp;
  }
  const apis = JSON.parse(r);

  let accs = {};
  // let ac1 = {};
  Object.keys(apis).forEach((k, i) => {
    accs[k] = new bnbApi(apis[k][0], apis[k][1]);
    // if (i === 0) ac1 = accs[k];
  });
  return accs;
}

export default getAccs;
// export { ac1 };
