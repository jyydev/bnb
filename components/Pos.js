// "use client";
// import { useMemo, useState, useEffect } from "react";
import { v4 as uid } from "uuid";
import prec from "toprecision";
import collR from "/json/collateral.json";
import _ from "lodash";

function Pos({ umR, cmR, assetR, priceR }) {
  console.log("render", "Pos");

  function isCm(symbol) {
    return symbol.includes("_PERP");
  }
  function toSym(symbol) {
    return symbol.match(/^(.*)USD/)?.[1] || symbol;
  }
  function rg(n, op = {}) {
    op.pc ||= 3;
    return (
      <span className={n > 0 ? "green" : n < 0 ? "red" : ""}>
        {op.dollar ? prec(n, op.pc, { dollar: 1 }) : prec(n, op.pc)}
      </span>
    );
  }
  function obAr2ob(obAr, key, valKey) {
    let r = {};
    obAr.forEach((e) => {
      r[e[key]] = valKey ? e[valKey] : e;
    });
    return r;
  }

  // let priceM = useMemo(() => obAr2ob(priceR, "symbol", "price"), [priceR]);
  let priceM = obAr2ob(priceR, "symbol", "price");

  let asset = {};
  Object.entries(assetR).forEach(([sub, e]) => {
    asset[sub] = obAr2ob(e, "asset");
  });
  // let asset = useMemo(() => {
  //   let r = {};
  //   Object.entries(assetR).forEach(([sub, e]) => {
  //     r[sub] = obAr2ob(e, "asset");
  //   });
  //   return r;
  // }, [assetR]);

  function toUcm(ob) {
    for (let sub in ob) {
      ucm[sub] ||= {};
      for (let e of ob[sub]) {
        if (typeof e.notional === "undefined") {
          e.notional = e.notionalValue * e.markPrice;
          e.posAmtOnly = e.notionalValue;
          e.positionAmt = Number(e.notionalValue) + Number(e.unRealizedProfit);
          e.pnlSym = e.unRealizedProfit;
          e.unRealizedProfit = e.unRealizedProfit * e.markPrice;
        }
        let {
          symbol,
          positionSide: side,
          notional,
          positionAmt,
          unRealizedProfit,
          leverage: lev,
          markPrice,
        } = e;

        let symE = (ucm[sub][symbol] ||= {});
        e.pnlRatio = (unRealizedProfit / Math.abs(notional)) * 100;
        e.imHedge = isCm(symbol)
          ? 0
          : Math.abs(Number(e.positionAmt) / Number(lev) / Number(collR[toSym(symbol)]));
        symE[side] = e;
        symE.leverage = Number(lev);
        symE.markPrice = Number(markPrice);
        symE.sym = toSym(symbol);

        let tSymE = (ucmSum[symbol] ||= {});
        tSymE[side] ||= {};
        tSymE[side].notional = (tSymE[side].notional ?? 0) + Number(notional);
        tSymE[side].positionAmt = (tSymE[side].positionAmt ?? 0) + Number(positionAmt);
        tSymE.pnlRatio ||= 0;
        if (e.pnlRatio > tSymE.pnlRatio) {
          tSymE.pnlRatio = e.pnlRatio;
        }
        tSymE.markPrice = markPrice;
      }
    }
  }
  let ucm = {};
  let ucmSum = {};

  toUcm(umR);
  toUcm(cmR);

  // let fundR = {};
  // if (Object.keys(fundR).length === 0) {
  //   ac1.getPublic("/fapi/v1/fundingRate", { symbol: "BTCUSDT" }).then((r) => {
  //     fundR.BTCUSDT = r;
  //   });
  // }

  for (let sub in ucm) {
    for (let sym in ucm[sub]) {
      let symE = ucm[sub][sym];
      symE.pHedge = 0;
      symE.imHedge = Number(symE.LONG?.imHedge || 0) + Number(symE.SHORT?.imHedge || 0);
      let netPos =
        Number(symE.LONG?.positionAmt || 0) + Number(symE.SHORT?.positionAmt || 0);
      if (netPos == 0) {
        symE.pair = "debt";
      } else {
        symE.pair = "funding";
        symE.pHedge = -Number(
          (netPos * (1 - Number(collR[symE.sym]))) / Number(collR[symE.sym])
        );
      }
      symE.fHedge = symE.imHedge + symE.pHedge;
      symE.netPos = netPos;
    }
  }

  for (let sym in ucmSum) {
    ucmSum[sym].pair =
      Math.abs(ucmSum[sym].LONG?.positionAmt) == Math.abs(ucmSum[sym].SHORT?.positionAmt)
        ? "debt"
        : "funding";
  }

  ucmSum = Object.fromEntries(
    Object.entries(ucmSum).sort((a, b) => {
      if (
        (b[1].pnlRatio > 4 && b[1].pair == "debt") ||
        (a[1].pnlRatio > 4 && a[1].pair == "debt")
      )
        return b[1].pnlRatio - a[1].pnlRatio;
      else if (b[1].pair == "funding" && a[1].pair == "funding")
        return a[1].SHORT.notional - b[1].SHORT.notional;
      else if (b[1].pair == "funding") return 1;
      else if (a[1].pair == "funding") return -1;
      else return a[1].SHORT.notional - b[1].SHORT.notional;
    })
  );

  let groups = _.groupBy(Object.entries(ucmSum), (e) => {
    let m = e[0].match(/^(.*)USD/);
    return m[1];
  });

  let merged = [];
  Object.entries(groups).forEach(([sym, e]) => {
    let group = [];
    e.forEach((e2) => {
      group.push(e2[0]);
    });
    e.forEach((e2, i) => {
      e[i][1].sym = sym;
      e[i][1].group = group;
    });
    if (e.length > 1) merged.push([sym, { sym: sym, group: group }]);
    merged.push(...e);
  });
  ucmSum = Object.fromEntries(merged);

  // console.log(ucmSum);
  // console.log(ucm);
  // console.log(asset.s1);
  // console.log(priceM);

  function UcmSum({ ucmSum }) {
    return (
      <tr>
        <td title="T:total">T</td>
        {Object.entries(ucmSum).map(([sym, e]) => {
          return (
            <td key={uid()}>
              {e.markPrice && `$${prec(e.markPrice, 4)}`}
              {e.SHORT?.notional && (
                <div className={"red"}>
                  {prec(e.SHORT?.positionAmt, 4)}(
                  {prec(e.SHORT?.notional, 4, { dollar: 1 })})
                </div>
              )}
              {e.LONG?.notional && (
                <div className={"green"}>
                  {prec(e.LONG?.positionAmt, 4)}(
                  {prec(e.LONG?.notional, 4, { dollar: 1 })})
                </div>
              )}
            </td>
          );
        })}
      </tr>
    );
  }

  return (
    <table>
      {console.log("return pos")}
      <caption>Futures pos</caption>
      <thead>
        <tr>
          <th title="h:initial margin hedge, w:wallet, e:extra, eh:extra hedge, ph:pnl hedge fh:full hedge(+cm)">
            <i>i</i>
          </th>
          {Object.keys(ucmSum).map((k) => {
            return <th key={uid()}>{k}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        <UcmSum ucmSum={ucmSum} />
        {Object.keys(ucm).map((sub) => {
          return (
            <tr key={uid()}>
              <td key={uid()}>{sub}</td>
              {Object.keys(ucmSum).map((symbol) => {
                let sym = ucmSum[symbol].sym;
                let wallet = asset[sub]?.[sym]?.totalWalletBalance;
                let symE = ucm[sub][symbol];
                // let price = priceM[symbol];
                // console.log(toSym(symbol));
                let price = priceM[toSym(symbol) + "USDT"];
                // let price = symE?.markPrice;

                return (
                  <td key={uid()}>
                    {symE && (
                      <>
                        {symE.pair !== "debt" && (
                          <div>
                            net:{rg(symE.netPos)}(
                            {rg(symE.netPos * symE.markPrice, { dollar: 1 })}) ph:
                            {prec(symE.pHedge, 3)}
                          </div>
                        )}
                        {Object.entries(symE).map(([k, e]) => {
                          return (
                            (k == "LONG" || k == "SHORT") && (
                              <div key={uid()}>
                                <div>
                                  {rg(e.positionAmt)}({rg(e.notional, { dollar: 1 })})h:
                                  {prec(e.imHedge, 4)}
                                </div>
                                <div>
                                  p:
                                  {e.pnlRatio ? (
                                    <span className={e.pnlRatio > 5 ? "yellow" : null}>
                                      {prec(e.pnlRatio, 3)}%
                                    </span>
                                  ) : null}
                                  &nbsp;({prec(e.unRealizedProfit, 4, { dollar: 1 })})
                                </div>
                              </div>
                            )
                          );
                        })}
                        {ucmSum[symbol].group.length == 1 && (
                          <div>
                            <div>
                              w:{rg(wallet) ?? "NA"}(
                              {rg(Number(wallet) * Number(price), { dollar: 1 })}
                              )eh:
                              {rg(Number(wallet) - Number(symE.fHedge))}(
                              {rg(
                                (Number(wallet) - Number(symE.fHedge)) * Number(price),
                                { dollar: 1 }
                              )}
                              )
                            </div>
                          </div>
                        )}
                        {
                          <div>
                            fh:{prec(symE.fHedge, 3)}(
                            {prec(symE.fHedge * price, 3, { dollar: 1 })})
                          </div>
                        }
                      </>
                    )}
                    {(() => {
                      if (!symbol.includes("USD")) {
                        let extra = Number(wallet);
                        let eh = extra;
                        let fh = extra;
                        ucmSum[symbol].group.forEach((gSym) => {
                          let netPos = Number(ucm[sub][gSym]?.netPos) || 0;
                          let fHedge = ucm[sub][gSym]?.fHedge || 0;
                          extra = extra + netPos;
                          eh = isCm(gSym) ? eh + netPos : eh + netPos - fHedge;
                          fh = fh + netPos - fHedge;
                        });
                        return (
                          <>
                            <div>w{prec(wallet, 4)}</div>
                            <div>
                              e{rg(extra)}(
                              {rg(extra * Number(priceM[symbol + "USDT"]), { dollar: 1 })}
                              )
                            </div>
                            <div>eh{rg(eh)}</div>
                            <div>fh{rg(fh)}</div>
                          </>
                        );
                      }
                    })()}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Pos;
