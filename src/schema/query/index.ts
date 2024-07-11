import { GraphQLObjectType, GraphQLString } from "graphql";

export default new GraphQLObjectType({
  name: "Query",
  fields: {
    helloWorld: {
      type: GraphQLString,
      resolve() {
        return "Hello World";
      },
    },
  },
});
