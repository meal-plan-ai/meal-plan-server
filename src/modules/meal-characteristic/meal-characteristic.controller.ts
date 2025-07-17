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
import { MealCharacteristicService } from './meal-characteristic.service';
import {
  CreateMealCharacteristicDto,
  UpdateMealCharacteristicDto,
  MealCharacteristicBaseResponseDto,
  MealCharacteristicsBaseResponseDto,
} from './dto/meal-characteristic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IMealCharacteristic } from './entities/meal-characteristic.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { IBaseResponse } from '../../types/base-response.interface';

interface RequestWithUser extends Request {
  user: {
    id: string;
    userId: string;
    email: string;
    [key: string]: unknown;
  };
}

@ApiTags('meal-characteristics')
@Controller('meal-characteristics')
export class MealCharacteristicController {
  constructor(
    private readonly mealCharacteristicService: MealCharacteristicService,
  ) {}

  @ApiOperation({ summary: 'Create a new meal characteristic' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The meal characteristic has been successfully created.',
    type: MealCharacteristicBaseResponseDto,
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
    @Body() createMealCharacteristicDto: CreateMealCharacteristicDto,
    @Req() request: RequestWithUser,
  ): Promise<IBaseResponse<IMealCharacteristic>> {
    const userId = request.user.userId || request.user.id;
    const data = await this.mealCharacteristicService.create(
      createMealCharacteristicDto,
      userId,
    );

    return { data };
  }

  @ApiOperation({ summary: 'Get all meal characteristics (User only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all meal characteristics.',
    type: MealCharacteristicsBaseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Req() request: RequestWithUser,
  ): Promise<IBaseResponse<IMealCharacteristic[]>> {
    // For security, return only user's meal characteristics instead of all
    const userId = request.user.userId || request.user.id;
    const data = await this.mealCharacteristicService.findAllByUser(userId);

    return { data };
  }

  @ApiOperation({ summary: 'Get user meal characteristics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return user meal characteristics.',
    type: MealCharacteristicsBaseResponseDto,
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
  ): Promise<IBaseResponse<IMealCharacteristic[]>> {
    const userId = request.user.userId || request.user.id;
    const data = await this.mealCharacteristicService.findAllByUser(userId);

    return { data };
  }

  @ApiOperation({ summary: 'Get a meal characteristic by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the meal characteristic with specified ID.',
    type: MealCharacteristicBaseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Meal characteristic not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiParam({ name: 'id', description: 'Meal characteristic ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ): Promise<IBaseResponse<IMealCharacteristic>> {
    const userId = request.user.userId || request.user.id;
    const data = await this.mealCharacteristicService.findOneByIdAndUser(
      id,
      userId,
    );

    return { data };
  }

  @ApiOperation({ summary: 'Update a meal characteristic' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The meal characteristic has been successfully updated.',
    type: MealCharacteristicBaseResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Meal characteristic not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiParam({ name: 'id', description: 'Meal characteristic ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMealCharacteristicDto: UpdateMealCharacteristicDto,
    @Req() request: RequestWithUser,
  ): Promise<IBaseResponse<IMealCharacteristic>> {
    // Ensure ID from URL is used
    updateMealCharacteristicDto.id = id;
    const userId = request.user.userId || request.user.id;
    const data = await this.mealCharacteristicService.updateByUserOwnership(
      updateMealCharacteristicDto,
      userId,
    );

    return { data };
  }

  @ApiOperation({ summary: 'Delete a meal characteristic' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The meal characteristic has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Meal characteristic not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiParam({ name: 'id', description: 'Meal characteristic ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ): Promise<IBaseResponse<number | null | undefined>> {
    const userId = request.user.userId || request.user.id;
    const data = await this.mealCharacteristicService.removeByUserOwnership(
      id,
      userId,
    );
    return { data };
  }
}
