import { Validator } from "node-input-validator";

export const validate = (rules) => {
  return async (req, res, next) => {
    const v = new Validator(req.body, rules);

    const matched = await v.check();

    if (!matched) {
      return res.status(422).json({ errors: v.errors });
    }

    next();
  };
};