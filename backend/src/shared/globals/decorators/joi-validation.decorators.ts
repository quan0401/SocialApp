import { ObjectSchema } from 'joi';
import { JoiRequestValidationError } from '~global/helpers/error-handler';
import { Request } from 'express';

type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void;

export function joiValidation(schema: ObjectSchema, isParams?: boolean): IJoiDecorator {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const req: Request = args[0];

      const toBeValidate = isParams ? req.params : req.body;

      const { error } = await Promise.resolve(schema.validate(toBeValidate));

      if (error?.details) {
        throw new JoiRequestValidationError(error.details[0].message);
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
