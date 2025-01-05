import { UUID, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { NutritionPlan } from './nutritionPlan.entity';

export class User {
  private _id: UUID = randomUUID();
  private _name: string;
  private _email: string;
  private _password: string;
  private _nutritionPlan: NutritionPlan[];

  constructor(
    id: UUID,
    name: string,
    email: string,
    password: string,
    nutritionPlan: NutritionPlan[],
  ) {
    this._id = id;
    this._name = name;
    this._email = email;
    this._password = password;
    this._nutritionPlan = nutritionPlan;
  }

  public get id(): string {
    return this._id.toString();
  }

  public set name(newName: string) {
    this._name = newName;
  }

  public get name(): string {
    return this._name;
  }

  public set email(newEmail: string) {
    this._email = newEmail;
  }

  public get email(): string {
    return this._email;
  }

  public set password(newPassword: string) {
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);
    this._password = hashedPassword;
  }

  public async verifyPassword(inputPassword: string): Promise<boolean> {
    return await bcrypt.compare(inputPassword, this._password);
  }

  public set nutritionPlan(newNutritionPlan: NutritionPlan) {
    const exists = this._nutritionPlan.some(
      (n) => n.id === newNutritionPlan.id,
    );

    if (!exists) {
      this._nutritionPlan = [...this._nutritionPlan, newNutritionPlan];
    }
  }

  public get nutritionPlan(): NutritionPlan[] {
    return this._nutritionPlan;
  }
}
