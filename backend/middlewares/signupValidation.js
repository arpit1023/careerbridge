import Joi from "joi";

// ─── Schema ────────────────────────────────────────────────────────────────────

const signupSchema = Joi.object({
  fullname: Joi.string()
    .trim()
    .min(2)
    .max(20)
    .pattern(/^[a-zA-Z\s'-]+$/)
    .required()
    .messages({
      "string.base": "Full name must be a string.",
      "string.empty": "Full name is required.",
      "string.min": "Full name must be at least 2 characters.",
      "string.max": "Full name cannot exceed 20 characters.",
      "string.pattern.base":
        "Full name can only contain letters, spaces, hyphens, and apostrophes.",
      "any.required": "Full name is required.",
    }),

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

  phoneNumber: Joi.string()
  .trim()
  .pattern(
    /^[6-9]\d{9}$/
  )
  .required()
  .messages({
    "string.base": "Phone number must be a string.",
    "string.empty": "Phone number is required.",
    "string.pattern.base":
      "Enter a valid phone number (10 digits or with country code).",
    "any.required": "Phone number is required.",
  }),

  password: Joi.string()
    .min(8)
    .max(64)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      "string.base": "Password must be a string.",
      "string.empty": "Password is required.",
      "string.min": "Password must be at least 8 characters.",
      "string.max": "Password cannot exceed 64 characters.",
      "string.pattern.base":
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).",
      "any.required": "Password is required.",
    }),

  role: Joi.string()
    .valid("student", "recruiter")
    .required()
    .messages({
      "any.only": 'Role must be either "student" or "recruiter".',
      "any.required": "Please select a role (Student or Recruiter).",
    }),

  // Profile picture is optional at validation layer;
  // enforce it at the multer/upload layer if needed.
  // If you want to validate the mimetype passed as a string field:
  profilePicture: Joi.any().optional(),
});

// ─── Middleware ─────────────────────────────────────────────────────────────────

/**
 * Express middleware that validates the signup request body against signupSchema.
 * On failure, responds with 422 and a structured errors array.
 * On success, replaces req.body with the sanitised/coerced Joi output and calls next().
 *
 * Usage:
 *   const { validateSignup } = require("./signupValidation");
 *   router.post("/signup", upload.single("profilePicture"), validateSignup, signupController);
 */
const validateSignup = (req, res, next) => {
  const { error, value } = signupSchema.validate(req.body, {
    abortEarly: false,   // collect ALL errors, not just the first
    stripUnknown: true,  // remove any fields not in the schema
    convert: true,       // coerce types (e.g. trim whitespace, lowercase email)
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return res.status(422).json({
      success: false,
      message: "Validation failed. Please fix the errors and try again.",
      errors,
    });
  }

  // Replace req.body with sanitised values
  req.body = value;
  next();
};

export { validateSignup, signupSchema };
