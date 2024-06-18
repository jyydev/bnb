export const dynamic = "force-dynamic";
export default function Page() {
  let t3 = process.env.ttt;
  console.log({ t3 });
  return (
    <div>
      Test page: tt:{process.env.tt} ttt:{t3} end
    </div>
  );
}
