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
		"phone":          user.Phone,
		"address":        user.Address,
		"role":           user.Role,
		"points":         user.Points,
		"email_verified": user.EmailVerified,
	})
}

// =====================================================================
// Sprint A — Profile, Change Password, Delete Account, Address Book
// =====================================================================

type UpdateProfileInput struct {
	Name    string `json:"name"`
	Phone   string `json:"phone"`
	Address string `json:"address"`
}

// PUT /api/auth/profile
// Updates editable profile fields. Email + role are intentionally NOT editable here.
func UpdateProfile(c *gin.Context) {
	userID := c.GetUint("user_id")
	var input UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if input.Name != "" {
		updates["name"] = input.Name
	}
	if input.Phone != "" {
		updates["phone"] = input.Phone
	}
	// Address may legitimately be empty (clearing it), so always set it
	updates["address"] = input.Address

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	if err := database.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	var user models.User
	database.DB.First(&user, userID)
	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated",
		"user": gin.H{
			"id":      user.ID,
			"name":    user.Name,
			"email":   user.Email,
			"phone":   user.Phone,
			"address": user.Address,
		},
	})
}

type ChangePasswordInput struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required"`
}

// PUT /api/auth/change-password
// Requires the current password as proof-of-identity. No "forgot password" link.
func ChangePassword(c *gin.Context) {
	userID := c.GetUint("user_id")
	var input ChangePasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(input.NewPassword) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 6 characters"})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if !utils.CheckPasswordHash(input.CurrentPassword, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
		return
	}

	hashed, err := utils.HashPassword(input.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	database.DB.Model(&user).Update("password", hashed)
	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}

// DELETE /api/auth/account
// Hard-deletes the user + cascades to cart/wishlist/orders via GORM hooks.
// Also requires password confirmation so someone with a stolen JWT can't nuke the account.
func DeleteAccount(c *gin.Context) {
	userID := c.GetUint("user_id")
	var input struct {
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	if !utils.CheckPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Password is incorrect"})
		return
	}

	// cascade delete related rows
	database.DB.Where("user_id = ?", userID).Delete(&models.Address{})
	database.DB.Where("user_id = ?", userID).Delete(&models.Cart{})
	database.DB.Where("user_id = ?", userID).Delete(&models.WishlistItem{})
	database.DB.Where("user_id = ?", userID).Delete(&models.Notification{})
	database.DB.Where("user_id = ?", userID).Delete(&models.CareReminder{})
	database.DB.Where("user_id = ?", userID).Delete(&models.Order{})

	if err := database.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete account"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Account deleted"})
}

// =====================================================================
// Address book CRUD
// =====================================================================

type AddressInput struct {
	Label      string `json:"label"`
	Recipient  string `json:"recipient" binding:"required"`
	Phone      string `json:"phone" binding:"required"`
	Line1      string `json:"line1" binding:"required"`
	Line2      string `json:"line2"`
	City       string `json:"city" binding:"required"`
	Region     string `json:"region"`
	PostalCode string `json:"postal_code"`
	Country    string `json:"country"`
	IsDefault  bool   `json:"is_default"`
}

// GET /api/auth/addresses
func ListAddresses(c *gin.Context) {
	userID := c.GetUint("user_id")
	var addresses []models.Address
	if err := database.DB.Where("user_id = ?", userID).Order("is_default DESC, id ASC").Find(&addresses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch addresses"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": addresses})
}

// POST /api/auth/addresses
func CreateAddress(c *gin.Context) {
	userID := c.GetUint("user_id")
	var input AddressInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Country == "" {
		input.Country = "Bangladesh"
	}
	if input.Label == "" {
		input.Label = "Home"
	}

	// If this address is marked default, unset all other defaults first.
	if input.IsDefault {
		database.DB.Model(&models.Address{}).Where("user_id = ?", userID).Update("is_default", false)
	} else {
		// If the user has zero addresses, force this one to be default
		var count int64
		database.DB.Model(&models.Address{}).Where("user_id = ?", userID).Count(&count)
		if count == 0 {
			input.IsDefault = true
		}
	}

	addr := models.Address{
		UserID:     userID,
		Label:      input.Label,
		Recipient:  input.Recipient,
		Phone:      input.Phone,
		Line1:      input.Line1,
		Line2:      input.Line2,
		City:       input.City,
		Region:     input.Region,
		PostalCode: input.PostalCode,
		Country:    input.Country,
		IsDefault:  input.IsDefault,
	}
	database.DB.Create(&addr)
	c.JSON(http.StatusCreated, gin.H{"message": "Address added", "address": addr})
}

// PUT /api/auth/addresses/:id
func UpdateAddress(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")
	var input AddressInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var addr models.Address
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&addr).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Address not found"})
		return
	}

	if input.IsDefault {
		database.DB.Model(&models.Address{}).Where("user_id = ? AND id <> ?", userID, addr.ID).Update("is_default", false)
	}

	addr.Label = input.Label
	addr.Recipient = input.Recipient
	addr.Phone = input.Phone
	addr.Line1 = input.Line1
	addr.Line2 = input.Line2
	addr.City = input.City
	addr.Region = input.Region
	addr.PostalCode = input.PostalCode
	addr.Country = input.Country
	if input.Country == "" {
		addr.Country = "Bangladesh"
	}
	if input.Label == "" {
		addr.Label = "Home"
	}
	addr.IsDefault = input.IsDefault

	database.DB.Save(&addr)
	c.JSON(http.StatusOK, gin.H{"message": "Address updated", "address": addr})
}

// DELETE /api/auth/addresses/:id
func DeleteAddress(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")
	var addr models.Address
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&addr).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Address not found"})
		return
	}
	wasDefault := addr.IsDefault
	database.DB.Delete(&addr)

	// If we deleted the default address, promote the most recent remaining one to default.
	if wasDefault {
		var next models.Address
		if err := database.DB.Where("user_id = ?", userID).Order("id DESC").First(&next).Error; err == nil {
			database.DB.Model(&next).Update("is_default", true)
		}
	}
	c.JSON(http.StatusOK, gin.H{"message": "Address deleted"})
}

// PUT /api/auth/addresses/:id/default — quick "make default" toggle
func SetDefaultAddress(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")
	var addr models.Address
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&addr).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Address not found"})
		return
	}
	database.DB.Model(&models.Address{}).Where("user_id = ?", userID).Update("is_default", false)
	database.DB.Model(&addr).Update("is_default", true)
	c.JSON(http.StatusOK, gin.H{"message": "Default address updated"})
}
