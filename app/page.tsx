import prisma from "@/prisma/prisma";

export const dynamic = "force-dynamic"
export default async function Home() {
    const docs = await prisma.integrations.findMany();
    console.log(docs)
      return (
        <div >
            {JSON.stringify(docs, null, 2)}
        </div>
      );
}
