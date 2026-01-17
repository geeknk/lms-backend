import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from '../../category/schemas/category.schema';
import { SubCategory } from '../../subcategory/schemas/subcategory.schema';

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true })
  duration: number; // in hours

  @Prop({ required: true })
  level: string; // beginner, intermediate, advanced

  @Prop([{ type: Types.ObjectId, ref: 'Category' }])
  categories: Category[];

  @Prop([{ type: Types.ObjectId, ref: 'SubCategory' }])
  subCategories: SubCategory[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
export type CourseDocument = Course & Document;
