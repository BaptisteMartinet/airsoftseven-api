import { makeContext } from "@sequelize-graphql/core";

// TODO auth
export default async function createContext() {
  return {
    ...makeContext(),
  };
}
