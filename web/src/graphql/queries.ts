import { gql } from "@apollo/client";

export const GET_DRIVER_STANDINGS = gql`
  query GetDriverStandings {
    driverStandings {
      id
      position
      code
      name
      team
      points
      wins
    }
  }
`;

export const GET_DRIVER = gql`
  query GetDriver($id: ID!) {
    driver(id: $id) {
      id
      position
      code
      name
      givenName
      familyName
      nationality
      team
      points
      wins
    }
  }
`;
