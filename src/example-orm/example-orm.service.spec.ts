import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserEntitySchema } from "./entities/user.entity";
import { ExampleOrmService } from "./example-orm.service";

describe("ExampleOrmService", () => {
  let exampleOrmService: ExampleOrmService;
  let moduleRef: TestingModule;
  let repository: Repository<User>;
  const testUser = {
    name: { first: "John", last: "Doe" },
    notes: "a new user",
    isActive: true,
  };
  const savedTestUser = {
    uuid: "dfb23ad9-9dd1-48f9-9dc7-4b634119dc5d",
    ...testUser,
  } as User;
  const mockedRepo = {
    // mock the repo `findOneOrFail`
    find: jest.fn(() => Promise.resolve(testUser as User)),
    save: jest.fn(() => Promise.resolve(savedTestUser)),
    findOneByOrFail: jest.fn((obj) =>
      obj?.uuid == "dfb23ad9-9dd1-48f9-9dc7-4b634119dc5d"
        ? Promise.resolve(savedTestUser)
        : Promise.reject("not found")
    ),
    delete: jest.fn(() => Promise.resolve()),
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [],
      providers: [
        ExampleOrmService,
        { provide: getRepositoryToken(UserEntitySchema), useValue: mockedRepo },
      ],
    }).compile();

    //exampleOrmService = moduleRef.get<ExampleOrmService>(ExampleOrmService);
    repository = moduleRef.get<Repository<User>>(
      getRepositoryToken(UserEntitySchema)
    );
    exampleOrmService = new ExampleOrmService(repository);
  });

  it("exampleOrmService can be defined", () => {
    expect(ExampleOrmService).toBeDefined();
  });

  it("create func call should return success", async () => {
    expect(await exampleOrmService.create(testUser as User)).toMatchObject(
      savedTestUser
    );
    expect(mockedRepo.save).toBeCalledTimes(1);
  });

  it("findAll func call calls the .find of the Repository", async () => {
    expect(await exampleOrmService.findAll()).toBe(testUser);
    expect(mockedRepo.find).toBeCalledTimes(1);
  });

  it("findOne func call calls .findOneBy of the Repository and returns the user is found.", async () => {
    expect(
      await exampleOrmService.findOne("dfb23ad9-9dd1-48f9-9dc7-4b634119dc5d")
    ).toBe(savedTestUser);
    expect(mockedRepo.findOneByOrFail).toBeCalledTimes(1);
  });

  it("findOne func call calls .findOneBy of the Repository and rejects the user is NOT found.", async () => {
    expect(
      async () =>
        await exampleOrmService.findOne("aec73a9d-9dd1-48f9-9dc7-4b634119dc51")
    ).rejects.toThrow("not found");
    expect(mockedRepo.findOneByOrFail).toBeCalledTimes(2);
  });
});
