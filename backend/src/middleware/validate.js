const { validationResult, check } = require("express-validator");

const validateScenario = [
  check("title").notEmpty().trim(),
  check("description").notEmpty().trim(),
  check("difficulty").isIn(["beginner", "intermediate", "advanced"]),
  check("category").notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateUser = [
  check("name").trim().notEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Invalid email format"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  check("level")
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Invalid level"),
  handleValidationErrors,
];

const validateVocabulary = [
  check("word").trim().notEmpty().withMessage("Word is required"),
  check("definition").trim().notEmpty().withMessage("Definition is required"),
  check("difficulty")
    .isIn(["A1", "A2", "B1", "B2", "C1", "C2"])
    .withMessage("Invalid difficulty level"),
  handleValidationErrors,
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      errors: errors.array(),
    });
  }
  next();
}

module.exports = {
  validateUser,
  validateVocabulary,
  validateScenario,
};
