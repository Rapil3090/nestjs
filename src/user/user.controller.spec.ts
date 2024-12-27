import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        }
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(true).toBeDefined();
    expect(userController).toBeDefined();
  });


  describe("create", () => {
    it('should return correct value', async () => {

      const createUserDto : CreateUserDto = {
        email: 'test@test.com',
        password: '1234',
      }
  
      const user = {
        id: 1,
        ...createUserDto,
        password: '12kdw1nlkd21k',
      };
  
      jest.spyOn(userService, 'create').mockResolvedValue(user as User);
  
      const result = await userController.create(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(user);
    })
  });


  describe("findAll", () => {
    it('should return a list of users', async () => {

      const users = [
        {
          id: 1,
          email: 'test1@test.com',
        },
        {
          id: 2,
          email: 'test2@test.com',
        }
      ];

      jest.spyOn(userService, 'findAll').mockResolvedValue(users as User []);
  
      const result = await userController.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findOne", () => {
    it('should return single user', async () => {

      const user = { id: 1, email: 'test@test.com' };

      jest.spyOn(userService, 'findOne').mockResolvedValue(user as User);
      
      const result = await userController.findOne(1);
      
      expect(userService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    })
  });

  describe("update", () => {
    it('should return the update user', async () => {

      const id = 1;
      const updateUserDto : UpdateUserDto = {
        email: 'test2@test.com',
      };

      const user = { id, ...updateUserDto };

      jest.spyOn(userService, 'update').mockResolvedValue(user as User);
      
      const result = await userController.update(1, updateUserDto);
      
      expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(user);
    })
  });

  describe("remove", () => {
    it('should return correct value', async () => {

      const user = { id: 1, email: 'test@test.com' };

      jest.spyOn(userService, 'remove').mockResolvedValue(user.id);
      
      const result = await userController.remove(1);
      
      expect(userService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(user.id);
    })
  });
});
