import {AddRevenueStreamProps} from "@/addRevenueStream.schema";

export {}
declare global {
    namespace PrismaJson {
        type MyType = AddRevenueStreamProps
    }
}