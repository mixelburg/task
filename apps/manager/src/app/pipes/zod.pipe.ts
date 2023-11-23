import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { z, ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {
  }

  transform(value: any, metadata: ArgumentMetadata) {
    // if value is not an object, ignore
    if (typeof value !== 'object') return value;

    const validationResult = this.schema.safeParse(value);

    if (!validationResult.success) {
      console.log(validationResult.error.formErrors)
      const fieldErrors = validationResult.error.formErrors.fieldErrors
      let message = ''
      for (const field in fieldErrors) {
        message += `${field}: ${(fieldErrors[field] || []).join(' ')}\n`
      }
      // const message = validationResult.error.issues.map((err) => err.message).join(', ').replace(/"/g, '\'');
      throw new BadRequestException(`Validation failed: ${message}`);
    }

    return value;
  }
}
