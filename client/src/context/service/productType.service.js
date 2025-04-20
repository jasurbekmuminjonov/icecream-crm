import { api } from "./api";

export const productTypeApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createProductType: builder.mutation({
            query: (body) => ({
                url: "/product-type/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["ProductType"],
        }),

        getProductTypes: builder.query({
            query: () => ({
                url: "/product-type/get",
                method: "GET",
            }),
            providesTags: ["ProductType"],
        }),

        updateProductType: builder.mutation({
            query: ({ id, body }) => ({
                url: `product-type/update/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["ProductType"],
        }),

        deleteProductType: builder.mutation({
            query: (id) => ({
                url: `/product-type/delete/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ProductType"],
        }),

    }),
});

export const {
    useCreateProductTypeMutation,
    useGetProductTypesQuery,
    useUpdateProductTypeMutation,
    useDeleteProductTypeMutation,
} = productTypeApi;
