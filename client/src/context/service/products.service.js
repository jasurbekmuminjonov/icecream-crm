import { api } from "./api";

export const productApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createProduct: builder.mutation({
            query: (body) => ({
                url: "/product/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Product"],
        }),

        getProducts: builder.query({
            query: () => ({
                url: "/product/get",
                method: "GET",
            }),
            providesTags: ["Product"],
        }),

        updateProduct: builder.mutation({
            query: ({ id, body }) => ({
                url: `product/update/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Product"],
        }),

        deleteProduct: builder.mutation({
            query: (id) => ({
                url: `/product/delete/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Product"],
        }),

    }),
});

export const {
    useCreateProductMutation,
    useGetProductsQuery,
    useUpdateProductMutation,
    useDeleteProductMutation,
} = productApi;
