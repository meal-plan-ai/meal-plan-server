import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';
import {
  CreateMealPlanDto,
  UpdateMealPlanDto,
  MealPlanBaseResponseDto,
  MealPlansBaseResponseDto,
} from './dto/meal-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IMealPlan } from './entities/meal-plan.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { IBaseResponse } from '../../types/base-response.interface';
import { Request } from 'express';
import { AiMealGeneratorService } from '../ai-meal-generator/ai-meal-generator.service';
import { AiGeneratedMealPlan } from '../ai-meal-generator/entities/ai-generated-meal-plan.entity';

// Define an interface that extends Request to include the user property
interface RequestWithUser extends Request {
  user: {
    id: string;
    userId: string;
    email: string;
    [key: string]: unknown;
  };
}

@ApiTags('meal-plans')
@Controller('meal-plans')
export class MealPlanController {
  constructor(
    private readonly mealPlanService: MealPlanService,
    private readonly aiMealGeneratorService: AiMealGeneratorService,
  ) {}

  @ApiOperation({ summary: 'Create a new meal plan' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The meal plan has been successfully created.',
    type: MealPlanBaseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createMealPlanDto: CreateMealPlanDto,
    @Req() request: RequestWithUser,
  ): Promise<IBaseResponse<IMealPlan>> {
    const userId = request.user.userId || request.user.id;
    const data = await this.mealPlanService.create(createMealPlanDto, userId);

    return { data };
  }

  @ApiOperation({ summary: 'Get all meal plans' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all meal plans.',
    type: MealPlansBaseResponseDto,
  })
  @Get()
  async findAll(): Promise<IBaseResponse<IMealPlan[]>> {
    const data = await this.mealPlanService.findAll();

    return { data };
  }

  @ApiOperation({ summary: 'Get user meal plans' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return user meal plans.',
    type: MealPlansBaseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user')
  async findAllByUser(
    @Req() request: RequestWithUser,
  ): Promise<IBaseResponse<IMealPlan[]>> {
    const userId = request.user.userId || request.user.id;
    const data = await this.mealPlanService.findAllByUser(userId);

    return { data };
  }

  @ApiOperation({ summary: 'Get a meal plan by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the meal plan with specified ID.',
    type: MealPlanBaseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Meal plan not found.',
  })
  @ApiParam({ name: 'id', description: 'Meal plan ID' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IBaseResponse<IMealPlan>> {
    const data = await this.mealPlanService.findOne(id);

    return { data };
  }

  @ApiOperation({ summary: 'Update a meal plan' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The meal plan has been successfully updated.',
    type: MealPlanBaseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Meal plan not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiParam({ name: 'id', description: 'Meal plan ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMealPlanDto: UpdateMealPlanDto,
  ): Promise<IBaseResponse<IMealPlan>> {
    // Ensure ID from URL is used
    updateMealPlanDto.id = id;
    const data = await this.mealPlanService.update(updateMealPlanDto);

    return { data };
  }

  @ApiOperation({ summary: 'Delete a meal plan' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The meal plan has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Meal plan not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiParam({ name: 'id', description: 'Meal plan ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<IBaseResponse<number | null | undefined>> {
    const data = await this.mealPlanService.remove(id);
    return { data };
  }

  @ApiOperation({
    summary: 'Generate an AI meal plan for an existing meal plan',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The AI meal plan has been successfully generated.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Meal plan or meal characteristic not found.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to generate AI meal plan.',
  })
  @ApiParam({ name: 'id', description: 'Meal plan ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/generate-ai-plan')
  async generateAiPlan(
    @Param('id') id: string,
  ): Promise<IBaseResponse<AiGeneratedMealPlan>> {
    try {
      const data = await this.mealPlanService.generateAiPlan(id);
      return { data };
    } catch (error) {
      console.error('Failed to generate AI plan:', error.message);
      throw error;
    }
  }
}
