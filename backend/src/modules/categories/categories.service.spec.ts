import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriesService } from './categories.service';
import { Category } from './schemas/category.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let model: Model<Category>;

  const mockCategory = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Laptops',
    description: 'Portable computers',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategoryModel = function(data: any) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data),
    };
  };
  
  mockCategoryModel.find = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  });
  mockCategoryModel.findById = jest.fn();
  mockCategoryModel.findOne = jest.fn();
  mockCategoryModel.create = jest.fn();
  mockCategoryModel.findByIdAndUpdate = jest.fn();
  mockCategoryModel.findByIdAndDelete = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken(Category.name),
          useValue: mockCategoryModel,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    model = module.get<Model<Category>>(getModelToken(Category.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const categories = [mockCategory];
      mockCategoryModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(categories),
        }),
      });

      const result = await service.findAll();
      expect(result).toEqual(categories);
      expect(mockCategoryModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCategory),
      } as any);

      const result = await service.findOne(mockCategory._id);
      expect(result).toEqual(mockCategory);
      expect(model.findById).toHaveBeenCalledWith(mockCategory._id);
    });

    it('should throw NotFoundException if category not found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.findOne('invalid_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto = {
        name: 'Smartphones',
        description: 'Mobile devices',
        isActive: true,
      };

      mockCategoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      });

      const savedCategory = { ...mockCategory, save: jest.fn().mockResolvedValue(mockCategory) };
      mockCategoryModel.mockReturnValueOnce(savedCategory);

      const result = await service.create(createCategoryDto);
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if category name exists', async () => {
      const createCategoryDto = {
        name: 'Laptops',
        description: 'Portable computers',
        isActive: true,
      };

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCategory),
      } as any);

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateCategoryDto = {
        name: 'Updated Laptops',
      };

      const updatedCategory = { ...mockCategory, ...updateCategoryDto };

      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCategory),
      } as any);

      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(updatedCategory),
      } as any);

      const result = await service.update(mockCategory._id, updateCategoryDto);
      expect(result).toEqual(updatedCategory);
    });

    it('should throw NotFoundException if category not found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.update('invalid_id', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCategory),
      } as any);

      const result = await service.remove(mockCategory._id);
      expect(result).toEqual(mockCategory);
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockCategory._id);
    });

    it('should throw NotFoundException if category not found', async () => {
      jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.remove('invalid_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

