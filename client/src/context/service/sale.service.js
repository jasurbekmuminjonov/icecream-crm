import { api } from "./api";

export const saleApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createSale: builder.mutation({
            query: (body) => ({
                url: "/sale/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Sale"],
        }),

        getSales: builder.query({
            query: () => ({
                url: "/sale/get",
                method: "GET",
            }),
            providesTags: ["Sale"],
        }),

        deliverSale: builder.mutation({
            query: ({ id, body }) => ({
                url: `sale/deliver/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Sale"],
        }),
        paymentSale: builder.mutation({
            query: ({ id, body }) => ({
                url: `sale/payment/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Sale"],
        }),
    }),
});

export const {
    useCreateSaleMutation,
    useGetSalesQuery,
    useDeliverSaleMutation,
    usePaymentSaleMutation,
} = saleApi;
