import { Request, Response } from "express";
import { loginSchema } from "../validators/auth.validator.js";
import { loginUser } from "../services/auth.service.js";

export async function login(
  req: Request,
  res: Response
) {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten(),
      });
    }

    const { email, password } = result.data;

    const data = await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CREDENTIALS"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}