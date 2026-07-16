import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GRAPHQL_URL } from "./config";

const httpLink = new HttpLink({
  uri: GRAPHQL_URL
});

const authLink = setContext((_, { headers }) => {
  const mockRoles = localStorage.getItem("f1-mock-roles") || "f1.admin";
  return {
    headers: {
      ...headers,
      "x-mock-roles": mockRoles
    }
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      DriverStanding: {
        keyFields: ["id"]
      }
    }
  })
});
