import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubscriptionTables1712345678910
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert default subscription plans with specific IDs
    await queryRunner.query(`
      -- Create extension for UUID generation if it doesn't exist
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Insert free plan with ID 0
      INSERT INTO "subscription_plans"
        (id, name, description, price, interval, "isDefault", "isActive",
         "trialDays", "mealPlanMaxDays", "mealPlansPerMonth", "maxPeopleCount")
      VALUES
        ('0', 'Free', 'Basic meal planning for individuals', 0, 'monthly', true, true,
         0, 1, 2, 1);

      -- Insert premium plan with ID 1
      INSERT INTO "subscription_plans"
        (id, name, description, price, interval, "isDefault", "isActive",
         "trialDays", "mealPlanMaxDays", "mealPlansPerMonth", "maxPeopleCount")
      VALUES
        ('1', 'Premium', 'Advanced meal planning for individuals and families', 9.99, 'monthly', false, true,
         7, 7, 999999, 6);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order with their constraints
    await queryRunner.query(`DROP TABLE "payments";`);
    await queryRunner.query(`DROP TABLE "subscriptions";`);
    await queryRunner.query(`DROP TABLE "subscription_plans";`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "public"."payment_provider_enum";`);
    await queryRunner.query(`DROP TYPE "public"."payment_status_enum";`);
    await queryRunner.query(`DROP TYPE "public"."subscription_status_enum";`);
    await queryRunner.query(`DROP TYPE "public"."plan_interval_enum";`);
  }
}
