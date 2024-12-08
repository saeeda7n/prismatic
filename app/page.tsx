import prisma from "@/prisma/prisma";
import {AddRevenueStreamProps} from "@/addRevenueStream.schema";

export default async function Home() {
     await prisma.integrations.create({
         data:{data:{stream_type: "UNIT_SALES",unit_price: {
             type: "CONSTANT",
                     amount: 1,
                 }} as AddRevenueStreamProps}
     });
    const docs = await prisma.integrations.findMany();

    console.log(docs[0].data)
      return (
        <div >
          Hello World
        </div>
      );
}
