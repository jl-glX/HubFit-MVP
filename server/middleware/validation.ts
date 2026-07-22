import { NextFunction, Request, Response } from "express";
import {
  body,
  param,
  query,
  ValidationChain,
  validationResult,
} from "express-validator";

const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const roles = ["member", "trainer", "admin"];

const strictBody = (allowedFields: string[], requireAtLeastOne = false) =>
  body().custom((value) => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new Error("Request body must be an object");
    }

    const fields = Object.keys(value);
    const unknownFields = fields.filter(
      (field) => !allowedFields.includes(field),
    );

    if (unknownFields.length > 0) {
      throw new Error(`Unknown fields: ${unknownFields.join(", ")}`);
    }

    if (requireAtLeastOne && fields.length === 0) {
      throw new Error("At least one field must be provided");
    }

    return true;
  });

function validateRequest(
  validations: ValidationChain[],
): Array<
  ValidationChain | ((req: Request, res: Response, next: NextFunction) => void)
> {
  return [
    ...validations,
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const details = errors.array({ onlyFirstError: true }).map((error) => ({
          type: error.type,
          location: "location" in error ? error.location : undefined,
          path: "path" in error ? error.path : undefined,
          message: error.msg,
        }));

        res.status(400).json({
          error: "Validation failed",
          code: "VALIDATION_ERROR",
          details,
        });
        return;
      }

      next();
    },
  ];
}

export const validateId = (name: string) =>
  validateRequest([
    param(name)
      .isString()
      .matches(ID_PATTERN)
      .withMessage(`${name} must be a valid identifier`),
  ]);

export const signupValidation = validateRequest([
  strictBody(["email", "name", "password"]),
  body("email")
    .isString()
    .trim()
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 254 }),
  body("name").isString().trim().isLength({ min: 1, max: 100 }),
  body("password")
    .isString()
    .isLength({ min: 12, max: 128 })
    .matches(/[a-z]/)
    .matches(/[A-Z]/)
    .matches(/[0-9]/),
]);

export const loginValidation = validateRequest([
  strictBody(["identifier", "password", "accessPortal", "rememberDevice"]),
  body("identifier")
    .isString()
    .trim()
    .isLength({ min: 3, max: 254 })
    .custom((value) => {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isPhone = /^\+?[0-9\s()-]{7,20}$/.test(value);
      if (!isEmail && !isPhone) {
        throw new Error("Identifier must be an email address or phone number");
      }
      return true;
    }),
  body("password").isString().isLength({ min: 1, max: 128 }),
  body("accessPortal").isIn(["member", "staff"]),
  body("rememberDevice").optional().isBoolean(),
]);

export const mfaCodeValidation = validateRequest([
  strictBody(["code"]),
  body("code")
    .isString()
    .trim()
    .matches(/^(?:\d{6}|[A-Fa-f0-9]{6}-?[A-Fa-f0-9]{6})$/)
    .withMessage("Code must be a 6-digit TOTP or a recovery code"),
]);

export const accountMfaConfirmationValidation = validateRequest([
  strictBody(["password", "code"]),
  body("password").isString().isLength({ min: 1, max: 128 }),
  body("code")
    .isString()
    .trim()
    .matches(/^(?:\d{6}|[A-Fa-f0-9]{6}-?[A-Fa-f0-9]{6})$/),
]);

export const passwordConfirmationValidation = validateRequest([
  strictBody(["password"]),
  body("password").isString().isLength({ min: 1, max: 128 }),
]);

export const passkeyAuthenticationOptionsValidation = validateRequest([
  strictBody(["identifier", "accessPortal", "rememberDevice"]),
  body("identifier").isString().trim().isLength({ min: 3, max: 254 }),
  body("accessPortal").isIn(["member", "staff"]),
  body("rememberDevice").optional().isBoolean(),
]);

export const passkeyResponseValidation = validateRequest([
  strictBody(["response"]),
  body("response").isObject(),
]);

export const sessionIdValidation = validateRequest([
  param("sessionId")
    .isString()
    .matches(/^[a-f0-9]{64}$/i),
]);

export const feedbackValidation = validateRequest([
  strictBody(["category", "message"]),
  body("category").isIn(["suggestion", "problem", "accessibility", "other"]),
  body("message").isString().trim().isLength({ min: 10, max: 2000 }),
]);

const billingFields = [
  "userId",
  "customerName",
  "customerEmail",
  "concept",
  "billingCycle",
  "amountCents",
  "currency",
  "status",
  "dueAt",
  "paidAt",
  "invoiceNumber",
  "notes",
];

export const createBillingRecordValidation = validateRequest([
  strictBody(billingFields),
  body("userId").optional({ nullable: true }).isString().matches(ID_PATTERN),
  body("customerName").isString().trim().isLength({ min: 1, max: 120 }),
  body("customerEmail")
    .optional({ values: "falsy" })
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 254 }),
  body("concept").isString().trim().isLength({ min: 1, max: 160 }),
  body("billingCycle").isIn([
    "monthly",
    "quarterly",
    "semiannual",
    "annual",
    "trial_day",
    "custom",
  ]),
  body("amountCents").isInt({ min: 0, max: 100000000 }).toInt(),
  body("currency").isString().trim().isLength({ min: 3, max: 3 }),
  body("status").isIn(["paid", "unpaid", "pending"]),
  body("dueAt").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body("paidAt").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body("invoiceNumber")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 80 }),
  body("notes").optional().isString().trim().isLength({ max: 1000 }),
]);

export const updateBillingRecordValidation = validateRequest([
  param("id").isString().matches(ID_PATTERN),
  strictBody(billingFields, true),
  body("userId").optional({ nullable: true }).isString().matches(ID_PATTERN),
  body("customerName")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 120 }),
  body("customerEmail")
    .optional({ values: "falsy" })
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 254 }),
  body("concept").optional().isString().trim().isLength({ min: 1, max: 160 }),
  body("billingCycle")
    .optional()
    .isIn([
      "monthly",
      "quarterly",
      "semiannual",
      "annual",
      "trial_day",
      "custom",
    ]),
  body("amountCents").optional().isInt({ min: 0, max: 100000000 }).toInt(),
  body("currency").optional().isString().trim().isLength({ min: 3, max: 3 }),
  body("status").optional().isIn(["paid", "unpaid", "pending"]),
  body("dueAt").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body("paidAt").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body("invoiceNumber")
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ max: 80 }),
  body("notes").optional().isString().trim().isLength({ max: 1000 }),
]);

export const bookingValidation = validateRequest([
  strictBody(["classId", "userId"]),
  body("classId").isString().matches(ID_PATTERN),
  body("userId").isString().matches(ID_PATTERN),
]);

export const bookingCancellationValidation = validateRequest([
  param("bookingId").isString().matches(ID_PATTERN),
  strictBody(["userId"]),
  body("userId").isString().matches(ID_PATTERN),
]);

const classFields = [
  strictBody([
    "name",
    "description",
    "trainerId",
    "trainerName",
    "maxCapacity",
    "scheduledAt",
  ]),
  body("name").isString().trim().isLength({ min: 1, max: 100 }),
  body("description").optional().isString().trim().isLength({ max: 1000 }),
  body("trainerId").isString().matches(ID_PATTERN),
  body("trainerName").isString().trim().isLength({ max: 100 }),
  body("maxCapacity").isInt({ min: 1, max: 10000 }).toInt(),
  body("scheduledAt").isInt({ min: 1 }).toInt(),
];

export const createClassValidation = validateRequest(classFields);

export const updateClassValidation = validateRequest([
  param("id").isString().matches(ID_PATTERN),
  strictBody(
    [
      "name",
      "description",
      "trainerId",
      "trainerName",
      "maxCapacity",
      "scheduledAt",
    ],
    true,
  ),
  body("name").optional().isString().trim().isLength({ min: 1, max: 100 }),
  body("description").optional().isString().trim().isLength({ max: 1000 }),
  body("trainerId").optional().isString().matches(ID_PATTERN),
  body("trainerName")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 }),
  body("maxCapacity").optional().isInt({ min: 1, max: 10000 }).toInt(),
  body("scheduledAt").optional().isInt({ min: 1 }).toInt(),
]);

export const createUserValidation = validateRequest([
  strictBody(["email", "name", "password", "role"]),
  body("email")
    .isString()
    .trim()
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 254 }),
  body("name").isString().trim().isLength({ min: 1, max: 100 }),
  body("password")
    .isString()
    .isLength({ min: 12, max: 128 })
    .matches(/[a-z]/)
    .matches(/[A-Z]/)
    .matches(/[0-9]/),
  body("role").optional().isIn(roles),
]);

export const updateUserValidation = validateRequest([
  param("id").isString().matches(ID_PATTERN),
  strictBody(["email", "name", "password", "role"], true),
  body("email")
    .optional()
    .isString()
    .trim()
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 254 }),
  body("name").optional().isString().trim().isLength({ min: 1, max: 100 }),
  body("password")
    .optional()
    .isString()
    .isLength({ min: 12, max: 128 })
    .matches(/[a-z]/)
    .matches(/[A-Z]/)
    .matches(/[0-9]/),
  body("role").optional().isIn(roles),
]);

export const updateRoleValidation = validateRequest([
  param("id").isString().matches(ID_PATTERN),
  strictBody(["role"]),
  body("role").isIn(roles),
]);

export const bulkDeleteUsersValidation = validateRequest([
  strictBody(["userIds"]),
  body("userIds")
    .isArray({ min: 1, max: 100 })
    .withMessage("userIds must contain between 1 and 100 identifiers"),
  body("userIds.*").isString().matches(ID_PATTERN),
]);

export const monthValidation = validateRequest([
  query("year").isInt({ min: 2000, max: 2200 }).toInt(),
  query("month").isInt({ min: 1, max: 12 }).toInt(),
]);
