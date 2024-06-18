import "/app/App.css";
import getAccs from "/fn/accs";
import get from "/fn/get";
import Pm from "/components/Pm";
import Pos from "/components/Pos";

async function App({ params }) {
  console.log("render");
  global.mbx1m = 0;
  let u = params.u?.[0];
  let accs = getAccs(u);
  // let [assetR, pmR, umR, cmR, priceR] = await Promise.all([
  let [pmR] = await Promise.all([
    // get("/papi/v1/balance", {}, accs),
    get("/papi/v1/account", {}, accs),
    // get("/papi/v1/um/positionRisk", {}, accs),
    // get("/papi/v1/cm/positionRisk", {}, accs),
    // get("/api/v3/ticker/price", {}),

    // get("/sapi/v1/portfolio/collateralRate", setCollateralRatio);
    // get("/fapi/v1/fundingRate", { symbol: "BTCUSDT" }, setFundingRate);
  ]);
  return (
    <>
      {console.log("return")}
      <div className="flex">
        <span className="pr-3">Binance {u}</span>
        <span>mbx: {global.mbx1m}/6000</span>
      </div>
      <Pm pmR={pmR} />
      {/* <Pos {...{ umR, cmR, assetR, priceR }} /> */}
    </>
  );
}

export default App;
