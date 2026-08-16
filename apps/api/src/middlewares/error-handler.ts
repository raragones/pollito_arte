import type { ErrorHandler } from "hono";
import { AppError } from "../lib/errors.js";
export const errorHandler: ErrorHandler = (error, c) => {
  console.error(error);
  if (error instanceof AppError)
    return c.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      error.status as 400,
    );
  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Ocurrió un error inesperado.",
      },
    },
    500,
  );
};
