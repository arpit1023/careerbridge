import Joi from "joi";

// ─── Schema ────────────────────────────────────────────────────────────────────

const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .lowercase()
    .required()
    .messages({
      "string.base": "Email must be a string.",
      "string.empty": "Email is required.",
      "string.email": "Please enter a valid email address.",
      "any.required": "Email is required.",
    }),

  password: Joi.string()
    .required()
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "any.required": "Password is required.",
    }),

  role: Joi.string()
    .valid("student", "recruiter")
    .required()
    .messages({
      "any.only": 'Role must be either "student" or "recruiter".',
      "any.required": "Please select a role (Student or Recruiter).",
    }),
});

// ─── Middleware ─────────────────────────────────────────────────────────────────

/**
 * Express middleware that validates the login request body against loginSchema.
 * On failure, responds with 422 and a structured errors array.
 * On success, replaces req.body with the sanitised/coerced Joi output and calls next().
 *
 * Usage:
 *   const { validateLogin } = require("../middlewares/loginValidation");
 *   router.post("/login", validateLogin, loginController);
 */
const validateLogin = (req, res, next) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,  // collect ALL errors, not just the first
    stripUnknown: true, // remove any unexpected fields
    convert: true,      // trim whitespace, lowercase email, etc.
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(422).json({
      success: false,
      message: "Validation failed. All fields are required.",
      errors,
    });
  }

  // Replace req.body with sanitised values
  req.body = value;
  next();
};

export { validateLogin, loginSchema };
