import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { relayStylePagination } from "@apollo/client/utilities";

export const client = new ApolloClient({
  link: createHttpLink({
    uri: `${process.env.NEXT_PUBLIC_API_DOMAIN}/graphql`,
    credentials: "include",
  }),
  cache: new InMemoryCache({
    typePolicies: {
      SkinNode: {
        keyFields: [
          "weapon",
          "slug",
          "quality",
          "statTrak",
          "souvenir",
          "prices",
        ],
      },
      Query: {
        fields: {
          csgo: relayStylePagination([
            "weapon",
            "slug",
            "category",
            "type",
            "quality",
            "rarity",
            "statTrak",
            "souvenir",
            "search",
            "group",
          ]),
          inventory: relayStylePagination(["proPlayerId"]),
        },
      },
    },
  }),
});
