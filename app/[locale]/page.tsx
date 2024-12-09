export default async function Home({searchParams}:{searchParams:any}) {
    console.log(await searchParams)
      return (
        <div >
            Main Page
        </div>
      );
}
