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

export const GET_RACE_CALENDAR = gql`
  query GetRaceCalendar {
    raceCalendar {
      round
      season
      raceName
      circuitId
      circuitName
      locality
      country
      date
      time
      isSprint
      sessions {
        name
        date
        time
      }
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages {
    messages {
      id
      author
      text
      createdAt
    }
  }
`;

export const ADD_MESSAGE = gql`
  mutation AddMessage($input: MessageInput!) {
    addMessage(input: $input) {
      id
      author
      text
      createdAt
    }
  }
`;

export const VIEWER_AND_PERMISSIONS = gql`
  query ViewerAndPermissions {
    viewer {
      actorId
      contextId
      roles
      userType
    }
    uiPermissions {
      groups {
        id
        label
        roles
        pages
        actions
      }
    }
  }
`;
