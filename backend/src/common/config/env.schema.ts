import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(5001),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('24h'),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  
  SMTP_HOST: Joi.string().when('NODE_ENV', { is: 'production', then: Joi.required(), otherwise: Joi.optional() }),
  SMTP_PORT: Joi.number().when('NODE_ENV', { is: 'production', then: Joi.required(), otherwise: Joi.optional() }),
  SMTP_USER: Joi.string().when('NODE_ENV', { is: 'production', then: Joi.required(), otherwise: Joi.optional() }),
  SMTP_PASS: Joi.string().when('NODE_ENV', { is: 'production', then: Joi.required(), otherwise: Joi.optional() }),
  
  OPENROUTER_API_KEY: Joi.string().optional(),
});
