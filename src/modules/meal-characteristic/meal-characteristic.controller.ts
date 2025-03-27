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
  MealCharacteristicResponseDto,
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
    type: MealCharacteristicResponseDto,
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
  ): Promise<IMealCharacteristic> {
    const userId = request.user.userId || request.user.id;
    return this.mealCharacteristicService.create(
      createMealCharacteristicDto,
      userId,
    );
  }

  @ApiOperation({ summary: 'Get all meal characteristics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all meal characteristics.',
    type: [MealCharacteristicResponseDto],
  })
  @Get()
  async findAll(): Promise<IMealCharacteristic[]> {
    return this.mealCharacteristicService.findAll();
  }

  @ApiOperation({ summary: 'Get user meal characteristics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return user meal characteristics.',
    type: [MealCharacteristicResponseDto],
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
  ): Promise<IMealCharacteristic[]> {
    const userId = request.user.userId || request.user.id;
    return this.mealCharacteristicService.findAllByUser(userId);
  }

  @ApiOperation({ summary: 'Get a meal characteristic by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the meal characteristic with specified ID.',
    type: MealCharacteristicResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Meal characteristic not found.',
  })
  @ApiParam({ name: 'id', description: 'Meal characteristic ID' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IMealCharacteristic> {
    return this.mealCharacteristicService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a meal characteristic' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The meal characteristic has been successfully updated.',
    type: MealCharacteristicResponseDto,
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
  ): Promise<IMealCharacteristic> {
    // Ensure ID from URL is used
    updateMealCharacteristicDto.id = id;
    return this.mealCharacteristicService.update(updateMealCharacteristicDto);
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
  async remove(@Param('id') id: string): Promise<void> {
    return this.mealCharacteristicService.remove(id);
  }
}
