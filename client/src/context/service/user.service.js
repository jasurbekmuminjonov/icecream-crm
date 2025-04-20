import { api } from "./api";

export const userApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createUser: builder.mutation({
            query: (body) => ({
                url: "/user/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User"],
        }),
        loginUser: builder.mutation({
            query: (body) => ({
                url: "/user/login",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User"],
        }),
        getUsers: builder.query({
            query: () => ({
                url: "/user/get",
                method: "GET",
            }),
            providesTags: ["User"],
        })
    })
});

export const {
    useCreateUserMutation,
    useLoginUserMutation,
    useGetUsersQuery,
} = userApi;
