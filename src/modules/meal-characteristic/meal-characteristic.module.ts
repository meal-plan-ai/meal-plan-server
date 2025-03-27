import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealCharacteristicService } from './meal-characteristic.service';
import { MealCharacteristicController } from './meal-characteristic.controller';
import { MealCharacteristic } from './entities/meal-characteristic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MealCharacteristic])],
  controllers: [MealCharacteristicController],
  providers: [MealCharacteristicService],
  exports: [MealCharacteristicService],
})
export class MealCharacteristicModule {}
