const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const passport = require("passport");

// Google OAuth routes
router.get("/google", (req, res, next) => {
  try {
    console.log("Starting Google OAuth flow");
    console.log("Auth Type:", req.query.authType);
    console.log("Session ID:", req.sessionID);

    // Store authType in session
    req.session.authType = req.query.authType;

    // Ensure session is saved before continuing
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect(
          `${process.env.CLIENT_URL}/login?error=session_error`
        );
      }

      console.log("Session saved successfully");
      console.log("Session data:", req.session);

      passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account",
        accessType: "offline",
        state: req.query.authType,
      })(req, res, next);
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.redirect(
      `${process.env.CLIENT_URL}/login?error=auth_error&message=${error.message}`
    );
  }
});

router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("Google callback received");
    console.log("Session ID:", req.sessionID);
    console.log("Session data:", req.session);
    console.log("Query state:", req.query.state);

    passport.authenticate("google", {
      failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
      session: false,
    })(req, res, next);
  },
  async (req, res) => {
    try {
      console.log("Passport authentication successful");
      console.log("User:", req.user);

      if (!req.user) {
        console.error("No user data in callback");
        return res.redirect(
          `${process.env.CLIENT_URL}/login?error=no_user_data`
        );
      }

      const payload = {
        user: {
          id: req.user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
        (err, token) => {
          if (err) {
            console.error("JWT sign error:", err);
            return res.redirect(
              `${process.env.CLIENT_URL}/login?error=token_generation_failed`
            );
          }
          console.log("JWT token generated successfully");
          res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
        }
      );
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(
        `${process.env.CLIENT_URL}/login?error=callback_error&message=${error.message}`
      );
    }
  }
);

// Get user profile
router.get("/me", auth, async (req, res) => {
  try {
    console.log("GET /me - User ID:", req.user.id);
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      console.error("User not found:", req.user.id);
      return res.status(404).json({ error: "User not found" });
    }
    console.log("User found:", user);
    res.json(user);
  } catch (err) {
    console.error("Get profile error:", {
      message: err.message,
      stack: err.stack,
      userId: req.user?.id,
    });
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

module.exports = router;
