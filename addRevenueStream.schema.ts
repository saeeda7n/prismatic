import {z} from 'zod'

export const STREAM_TYPES = [
  'UNIT_SALES',
  'BILLABLE_HOURS',
  'RECURRING_CHARGES',
  'REVENUE_ONLY',
] as const

export const SALE_RATE = ['MONTH', 'YEAR'] as const
export const UNIT_FORMAT = ['CONSTANT', 'VARYING'] as const
export const UNIT_PRICE_FORMAT_WITH_FREE = ['NO_FEE', 'CONSTANT', 'VARYING'] as const
export const REVENUE_AMOUNT_TYPE = ['AMOUNT', 'PERCENT_OF_REVENUE'] as const



const streamTypes = z.enum(STREAM_TYPES)
const revenueTypes = z.enum(REVENUE_AMOUNT_TYPE)
const unitTypes = z.enum(UNIT_FORMAT)
const unitWithNoFeeTypes = z.enum(UNIT_PRICE_FORMAT_WITH_FREE)

export const chartDataSchema = z.record(
  z.number({ coerce: true }),
  z
    .array(
      z.object({
        value: z.union([z.number(), z.undefined()]),
        date: z.union([z.number(), z.string()]),
        notes: z.union([
          z.array(
            z.object({
              id: z.string(),
              user: z.object({
                id: z.string(),
                full_name: z.string(),
              }),
              body: z.string(),
              createdAt: z.union([z.string(), z.number()]),
            })
          ),
          z.undefined(),
        ]),
      })
    )
    .length(12)
)

const name = z.string().min(4, 'Name must be at least 4 characters long.')

const unitSaleSchema = z.object({
  name,
  stream_type: streamTypes.extract(['UNIT_SALES']),
  unit_sales: z.discriminatedUnion('type', [
    z.object({
      type: unitTypes.extract(['CONSTANT']),
      amount: z.coerce.number().min(0),
      rate: z.enum(SALE_RATE),
      started: z.string().min(0),
    }),
    z.object({
      type: unitTypes.extract(['VARYING']),
      data: chartDataSchema,
    }),
  ]),
  unit_price: z.discriminatedUnion('type', [
    z.object({
      type: unitTypes.extract(['CONSTANT']),
      amount: z.coerce.number().min(0),
    }),
    z.object({
      type: unitTypes.extract(['VARYING']),
      data: chartDataSchema,
    }),
  ]),
})

const billingHours = z.object({
  name,
  stream_type: streamTypes.extract(['BILLABLE_HOURS']),
  billable_hours: z.discriminatedUnion('type', [
    z.object({
      type: unitTypes.extract(['CONSTANT']),
      amount: z.coerce.number().min(0),
      rate: z.enum(SALE_RATE),
      started: z.string().min(0),
    }),
    z.object({
      type: unitTypes.extract(['VARYING']),
      data: chartDataSchema,
    }),
  ]),
  hourly_rate: z.discriminatedUnion('type', [
    z.object({
      type: unitTypes.extract(['CONSTANT']),
      amount: z.coerce.number().min(0),
    }),
    z.object({
      type: unitTypes.extract(['VARYING']),
      data: chartDataSchema,
    }),
  ]),
})

const recurrentChargeSchema = z.object({
  name,
  stream_type: streamTypes.extract(['RECURRING_CHARGES']),
  signups: z.discriminatedUnion('type', [
    z.object({
      type: unitTypes.extract(['CONSTANT']),
      started: z.string().min(0),
      amount: z.coerce.number().min(0),
    }),
    z.object({
      type: unitTypes.extract(['VARYING']),
      data: chartDataSchema,
    }),
  ]),

  //Charges
  charges: z.object({
    up_front: z.discriminatedUnion('type', [
      z.object({
        type: unitWithNoFeeTypes.extract(['NO_FEE']),
      }),
      z.object({
        type: unitWithNoFeeTypes.extract(['CONSTANT']),
        amount: z.coerce.number().min(0),
      }),
      z.object({
        type: unitWithNoFeeTypes.extract(['VARYING']),
        data: chartDataSchema,
      }),
    ]),
    update_recurrent_frequency: z.discriminatedUnion('type', [
      z.object({
        type: unitTypes.extract(['CONSTANT']),
        amount: z.coerce.number().min(0),
        rate: z.coerce.number().min(1).max(12),
      }),
      z.object({
        type: unitTypes.extract(['VARYING']),
        data: chartDataSchema,
      }),
    ]),
  }),
  //Charges

  churn: z.discriminatedUnion('type', [
    z.object({
      type: unitTypes.extract(['CONSTANT']),
      amount: z.coerce.number().min(0),
    }),
    z.object({
      type: unitTypes.extract(['VARYING']),
      data: chartDataSchema,
    }),
  ]),

  // up_front_fee: z.enum(UNIT_PRICE_FORMAT_WITH_FREE, { message: 'Please choose an option.' }), //How will you enter your hourly rates?
  // recurring_rate_type: z.enum(UNIT_FORMAT, { message: 'Please choose an option.' }), //How will you enter the recurring charge?
  // recurrent_charge: z.coerce.number().min(1, 'Please fill this field.'),
  // charge_rate: z.coerce
  //   .number()
  //   .min(1, 'Please fill this field.')
  //   .max(12, 'Please fill this field.'),
  //
})

const revenueOnlySchema = z.object({
  name,
  stream_type: streamTypes.extract(['REVENUE_ONLY']),
  revenue: z.discriminatedUnion('type', [
    z.object({
      type: revenueTypes.extract(['AMOUNT']),
      data: z.discriminatedUnion('type', [
        z.object({
          type: unitTypes.extract(['CONSTANT']),
          amount: z.coerce.number().min(0),
          rate: z.enum(SALE_RATE),
          started: z.string().min(0),
        }),
        z.object({
          type: unitTypes.extract(['VARYING']),
          data: chartDataSchema,
        }),
      ]),
    }),
    z.object({
      type: revenueTypes.extract(['PERCENT_OF_REVENUE']),
      data: z.discriminatedUnion('type', [
        z.object({
          type: unitTypes.extract(['CONSTANT']),
          stream_id: z.coerce.number().min(0),
          amount: z.coerce.number().min(0),
          started: z.string().min(0),
        }),
        z.object({
          type: unitTypes.extract(['VARYING']),
          data: chartDataSchema,
        }),
      ]),
    }),
  ]),
})

export const addRevenueStreamSchema = z.discriminatedUnion('stream_type', [
  unitSaleSchema,
  billingHours,
  recurrentChargeSchema,
  revenueOnlySchema,
])

export type AddRevenueStreamProps = z.infer<typeof addRevenueStreamSchema>