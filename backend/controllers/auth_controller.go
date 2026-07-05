package controllers

import (
	"log"
	"net/http"

	"katherbox/database"
	"katherbox/models"
	"katherbox/utils"

	"github.com/gin-gonic/gin"
)

type RegisterInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// email age theke ache kina check
	var existingUser models.User
	if err := database.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
		return
	}

	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Name:     input.Name,
		Email:    input.Email,
		Password: hashedPassword,
		Role:     "customer",
	}
	database.DB.Create(&user)

	token, _ := utils.GenerateJWT(user.ID, user.Email, user.Role)

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"token":   token,
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if !utils.CheckPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token, _ := utils.GenerateJWT(user.ID, user.Email, user.Role)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   token,
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// ===== Forgot / Reset password (console-log simulation) =====
//
// In-memory reset tokens. For a single-user MVP running locally this is fine.
// In production this would be Redis or a DB table with TTL.
var resetTokens = map[string]resetEntry{}

type resetEntry struct {
	UserID    uint
	ExpiresAt int64 // unix seconds
}

// POST /api/auth/forgot-password  { email }
func ForgotPassword(c *gin.Context) {
	var input struct {
		Email string `json:"email" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var user models.User
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		// don't leak which emails exist
		c.JSON(http.StatusOK, gin.H{"message": "If that email exists, a reset token was sent."})
		return
	}

	// 6-digit numeric token, valid for 15 minutes
	token := utils.GenerateResetToken()
	resetTokens[token] = resetEntry{UserID: user.ID, ExpiresAt: utils.NowUnix() + 15*60}

	// "send" via server console
	log.Printf("[Password Reset] user=%s email=%s token=%s (valid 15 min)", user.Name, user.Email, token)

	c.JSON(http.StatusOK, gin.H{
		"message":      "Reset token generated. Check server console.",
		"dev_only_token": token, // dev convenience; remove in production
	})
}

// POST /api/auth/reset-password  { token, new_password }
func ResetPassword(c *gin.Context) {
	var input struct {
		Token       string `json:"token" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	entry, ok := resetTokens[input.Token]
	if !ok || utils.NowUnix() > entry.ExpiresAt {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired token"})
		return
	}

	hashed, err := utils.HashPassword(input.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Hash failed"})
		return
	}
	database.DB.Model(&models.User{}).Where("id = ?", entry.UserID).Update("password", hashed)
	delete(resetTokens, input.Token)

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successful"})
}

// GET /api/auth/me - current user info (token theke ber kore, stale JWT issue er jonno useful)
// ===== Email verification (console-log simulation, same pattern as reset) =====

var verifyTokens = map[string]verifyEntry{}

type verifyEntry struct {
	UserID    uint
	ExpiresAt int64
}

// POST /api/auth/send-verification  (logged-in user)
func SendVerification(c *gin.Context) {
	userID := c.GetUint("user_id")
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	if user.EmailVerified {
		c.JSON(http.StatusOK, gin.H{"message": "Email already verified"})
		return
	}
	token := utils.GenerateResetToken() // 6-digit numeric
	verifyTokens[token] = verifyEntry{UserID: user.ID, ExpiresAt: utils.NowUnix() + 24*3600}
	log.Printf("[Verify Email] user=%s email=%s token=%s (valid 24 h)", user.Name, user.Email, token)
	c.JSON(http.StatusOK, gin.H{
		"message":        "Verification token generated. Check server console.",
		"dev_only_token": token,
	})
}

// POST /api/auth/verify-email  { token }
func VerifyEmail(c *gin.Context) {
	var input struct {
		Token string `json:"token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	entry, ok := verifyTokens[input.Token]
	if !ok || utils.NowUnix() > entry.ExpiresAt {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired verification token"})
		return
	}
	database.DB.Model(&models.User{}).Where("id = ?", entry.UserID).Update("email_verified", true)
	delete(verifyTokens, input.Token)
	c.JSON(http.StatusOK, gin.H{"message": "Email verified ✓"})
}

// GET /api/auth/me - current user info (token theke ber kore, stale JWT issue er jonno useful)
func Me(c *gin.Context) {
	userID := c.GetUint("user_id")
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id":             user.ID,
		"name":           user.Name,
		"email":          user.Email,
		"role":           user.Role,
		"points":         user.Points,
		"email_verified": user.EmailVerified,
	})
}
