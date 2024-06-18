import { v4 as uid } from "uuid";

function Pm({ pmR }) {
  const pmKeys = {
    uniMMR: "uniMMR",
    totalAvailableBalance: "available",
    accountEquity: "equity",
    accountInitialMargin: "IM",
    accountMaintMargin: "MM",
    actualEquity: "actual equity",
  };

  return (
    <table>
      <caption>PM</caption>
      <thead>
        <tr>
          <th></th>
          {Object.keys(pmKeys).map((k) => {
            return <th key={uid()}>{pmKeys[k]}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        {Object.keys(pmR).map((sub) => {
          let decimal = 0;
          return (
            <tr key={uid()}>
              <td key={uid()}>{sub}</td>
              {Object.keys(pmKeys).map((k) => {
                decimal = k === "uniMMR" ? 2 : 0;
                return <td key={uid()}>{Number(pmR[sub][k]).toFixed(decimal)}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Pm;
