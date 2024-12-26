import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entity/user.entity';

const mockUserRepository = {
  findOne: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
}


describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        }
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe("findAll", () =>  {
    it('should return all uesrs', async () => {
      const users = [
      { id: 1,
        email: 'test@test.com',
      },
    ];

    mockUserRepository.find.mockResolvedValue(users);

    const result = await userService.findAll();

    expect(result).toEqual(users);
    expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });
});
