import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { NotFoundException } from '@nestjs/common';
import { async } from 'rxjs';
import { CreateUserDto } from './dto/create-user.dto';

const mockUserRepository = {
  findOne: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
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

  describe("findOne", () => {
    it('should return a user by id', async ()=> {
      const user = { id: 1, email: "test@test.com" };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(user);

      const result = await userService.findOne(1);

      expect(result).toEqual(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          id:1,
        },
      });
    });

    it('should throw a NotFoundException if user is not found', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      expect(userService.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 999,
        }
      })
    });
  });

  describe("remove", () => {
    it('should delete a user by id', async () => {
      const id = 999;

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue({
        id:1,
      });

      const result = await userService.remove(id);

      expect(result).toEqual(id);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
        }
      })
    });
    
    it('should throw a NotFoundException if user to delete is not found', () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(null);

      expect(userService.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 999,
        }
      })
    });
  });

  describe('create', () => {
    it('should create a user', async () => {

      const createUserDto : CreateUserDto = { 
        email: 'test@test.com',
        password: '1234'
      };

      const savedUser = { id: 1, ...createUserDto };

      jest.spyOn(mockUserRepository, 'save').mockResolvedValue(savedUser);

      const result = await userService.create(createUserDto);

      expect(result).toEqual(createUserDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(createUserDto);

    })
  })
});
