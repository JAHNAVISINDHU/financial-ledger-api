const Joi = require('joi');

const schemas = {
  createAccount: Joi.object({
    userId: Joi.string().uuid().required(),
    accountType: Joi.string().valid('checking', 'savings', 'business').required(),
    currency: Joi.string().length(3).uppercase().default('USD'),
  }),

  transfer: Joi.object({
    sourceAccountId: Joi.string().uuid().required(),
    destinationAccountId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).uppercase().default('USD'),
    description: Joi.string().optional(),
  }),

  deposit: Joi.object({
    accountId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).uppercase().default('USD'),
    description: Joi.string().optional(),
  }),

  withdrawal: Joi.object({
    accountId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).uppercase().default('USD'),
    description: Joi.string().optional(),
  }),
};

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  req.body = value;
  next();
};

module.exports = { schemas, validate };