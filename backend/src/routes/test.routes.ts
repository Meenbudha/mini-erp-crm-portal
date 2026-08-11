// import { Router } from "express";
// import {
//   AuthenticatedRequest,
//   requireAuth,
// } from "../middleware/auth.middleware.js";
// import { Response } from "express";

// const router = Router();

// router.get(
//   "/profile",
//   requireAuth,
//   (req: AuthenticatedRequest, res: Response) => {
//     res.status(200).json({
//       success: true,
//       message: "Authentication successful",
//       user: req.user,
//     });
//   }
// );

import { Router } from "express";
import { Role } from "../generated/client.js";
import {
  AuthenticatedRequest,
  requireAuth,
} from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { Response } from "express";

const router = Router();

router.get(
  "/admin",
  requireAuth,
  requireRole(Role.ADMIN),
  (req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted",
      user: req.user,
    });
  }
);

// export default router;

export default router;