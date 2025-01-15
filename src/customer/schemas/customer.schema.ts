import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PersonalInformation extends Document {
  @Prop({ type: Types.ObjectId, ref: 'UserAccount', required: true, unique: true })
  userId: Types.ObjectId; 
  @Prop({ required: true, unique: true })
  id: number;
  
  @Prop({ required: true })
  fullName: string;

  @Prop()
  phoneNumber: string;

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop()
  addressLine: string;
}

export const PersonalInformationSchema = SchemaFactory.createForClass(PersonalInformation);
