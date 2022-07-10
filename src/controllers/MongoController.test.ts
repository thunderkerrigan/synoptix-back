import { loadDatabase } from "./MongoController";
import { connect, connection, Connection } from "mongoose";

const fakeConnection = {} as Connection;
jest.mock("mongoose", () => {
  return {
    connect: jest.fn(),
    connection: {
      asPromise: jest
        .fn()
        .mockImplementation(() => Promise.resolve(fakeConnection)),
    },
  };
});
describe("MongoController", () => {
  it("should load database", async () => {
    // jest
    //   .mocked(connection.asPromise)
    //   .mockImplementation(() => Promise.resolve(new Connection()));
    await loadDatabase();
    expect(jest.mocked(connect)).toHaveBeenCalledTimes(1);
    await loadDatabase();
    expect(jest.mocked(connection.asPromise)).toHaveBeenCalledTimes(1);
  }, 10000);
});
describe("MongoController", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
    await loadDatabase();
  }, 10000);
  it("should returned already loaded database", async () => {
    await loadDatabase();
    expect(jest.mocked(connect)).toHaveBeenCalledTimes(0);
    await loadDatabase();
    expect(jest.mocked(connection.asPromise)).toHaveBeenCalledTimes(0);
  }, 10000);
});
