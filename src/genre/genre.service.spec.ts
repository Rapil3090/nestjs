import { Test, TestingModule } from '@nestjs/testing';
import { GenreService } from './genre.service';
import { Repository } from 'typeorm';
import { Genre } from './entity/genre.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { when } from 'joi';
import { NotFoundException } from '@nestjs/common';

const mockGenreRepository = {
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};


describe('GenreService', () => {
  let genreService: GenreService;
  let genreRepository: Repository<Genre>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreService,
      {
        provide: getRepositoryToken(Genre),
        useValue: mockGenreRepository,
      }],
    }).compile();

    genreService = module.get<GenreService>(GenreService);
    genreRepository = module.get<Repository<Genre>>(getRepositoryToken(Genre));
  });

  it('should be defined', () => {
    expect(genreService).toBeDefined();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a genre successfully', async () => {
      const createGenreDto = {name: 'Fantasy'};
      const savedGenre = {id: 1, ...createGenreDto};

      jest.spyOn(genreRepository, 'save').mockResolvedValue(savedGenre as Genre);

      const result = await genreService.create(createGenreDto);
      
      expect(genreRepository.save).toHaveBeenCalledWith(createGenreDto);
      expect(result).toEqual(savedGenre);
    });
  });

  describe('findAll', () => {
    it('should return an array of genres', async () => {

      const genres = [
        {
          id: 1,
          name: 'Fantasy',
        },
      ];

      jest.spyOn(genreRepository, 'find').mockResolvedValue(genres as Genre[]);

      const result = await genreService.findAll();

      expect(genreRepository.find).toHaveBeenCalled();
      expect(result).toEqual(genres);
    });
  });

  describe('findOne', () => {
    it('should return a genre if found', async () => {

      const genre = {id:1, name: 'Fantasy'};

      jest.spyOn(genreRepository, 'findOne').mockResolvedValue(genre as Genre);

      const result = await genreService.findOne(genre.id);

      expect(genreRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: genre.id,
        },
      });

      expect(result).toEqual(genre);
    });

    it('should throw a NotFoundException if genre is not found', async () => {
      jest.spyOn(genreRepository, 'findOne').mockResolvedValue(null);

      await expect(genreService.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the genre if it exists', async () => {
      const updateGenreDto = {
        name: 'Updated Fantasy',
      };

      const existngGenre = {
        id: 1,
        name: 'Fantasy',
      };

      const updatedGenre = {
        id: 1, 
        ...updateGenreDto,
      };

      jest.spyOn(genreRepository, 'findOne')
      .mockResolvedValueOnce(existngGenre as Genre)
      .mockResolvedValueOnce(updatedGenre as Genre);

      const result = await genreService.update(1, updateGenreDto);

      expect(genreRepository.findOne).toHaveBeenCalledWith({ where: { id: 1,}});
      expect(genreRepository.update).toHaveBeenCalledWith({id:1}, updateGenreDto);
      expect(result).toEqual(updatedGenre);
    });

    it('should throw a NotFoundException if genre to update does not exist', async () => {
      jest.spyOn(genreRepository, 'findOne').mockResolvedValue(null);

      await expect(genreService.update(1, {name: 'Updated Fatasy'})).rejects.toThrow(NotFoundException);
    });

  });




  
});
