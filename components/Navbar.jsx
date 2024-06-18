import Link from "next/link";
import { v4 as uid } from "uuid";

export default function Navbar() {
  let links = [
    ["/", "Home"],
    ["/t", "Test"],
    ["/t2", "tmp2"],
    ["/y", "Y"],
    ["/d", "D"],
    ["/j", "J"],
    ["/j2", "J2"],
    ["/m", "M"],
    ["/m2", "M2"],
  ];
  return (
    <div className="p-1">
      {links.map((e) => {
        return (
          <Link className="p-2" href={e[0]} key={uid()}>
            {e[1]}
          </Link>
        );
      })}
    </div>
  );
}
