import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAiGenerationStatusToMealPlan1753376283424
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column already exists
    const table = await queryRunner.getTable('meal_plans');
    const column = table?.findColumnByName('ai_generation_status');

    if (!column) {
      await queryRunner.addColumn(
        'meal_plans',
        new TableColumn({
          name: 'ai_generation_status',
          type: 'varchar',
          length: '50',
          isNullable: true,
          default: "'idle'",
          comment:
            'Status of AI meal plan generation: idle, in_progress, completed, failed',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('meal_plans');
    const column = table?.findColumnByName('ai_generation_status');

    if (column) {
      await queryRunner.dropColumn('meal_plans', 'ai_generation_status');
    }
  }
}
