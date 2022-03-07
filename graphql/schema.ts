import { gql } from "apollo-server-micro";

export const typeDefs = gql`
  enum Role {
    USER
    ADMIN
  }

  enum AccessType {
    PRIVATE
    PUBLIC
  }

  enum StepType {
    INSTRUCTION
    CHOICE
  }

  type User {
    id: String
    name: String
    email: String
    image: String
    role: Role
    steps: [Step]
    sessions: [Session]
  }

  type Step {
    id: String
    text: String
    user: User
    userId: String
    accessType: AccessType
    stepType: StepType
    parents: [StepRelation]
    children: [StepRelation]
    anchors: [Anchor]
    sessionSteps: [SessionStep]
  }

  type StepRelation {
    id: String
    child: Step
    parent: Step
    childIndex: Int
  }

  type Anchor {
    id: String
    parent: Step
    stepId: String
  }

  # type Session {
  #   id: String
  #   user: User
  #   steps: [SessionStep]
  # }

  # type SessionStep {
  #   id: String
  #   step: Step
  #   session: Session
  #   index: Int
  # }

  type Query {
    steps: [Step]!
  }
`;
