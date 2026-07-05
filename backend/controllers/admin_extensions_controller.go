package controllers

import (
	"net/http"

	"katherbox/database"
	"katherbox/models"

	"github.com/gin-gonic/gin"
)

// ============ Admin: Reminders ============

// GET /api/admin/reminders - all pending reminders across users
func AdminListReminders(c *gin.Context) {
	var list []models.CareReminder
	database.DB.Preload("Product").
		Where("completed = ?", false).
		Order("next_due_date asc").
		Find(&list)
	// hydrate user info manually (no User FK model)
	type Out struct {
		models.CareReminder
		UserEmail string `json:"user_email"`
	}
	out := make([]Out, 0, len(list))
	for _, r := range list {
		var u models.User
		database.DB.First(&u, r.UserID)
		out = append(out, Out{CareReminder: r, UserEmail: u.Email})
	}
	c.JSON(http.StatusOK, out)
}

// POST /api/admin/reminders/:id/complete
func AdminCompleteReminder(c *gin.Context) {
	id := c.Param("id")
	var r models.CareReminder
	if err := database.DB.First(&r, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reminder not found"})
		return
	}
	r.Completed = true
	database.DB.Save(&r)
	c.JSON(http.StatusOK, gin.H{"message": "Reminder marked completed"})
}

// ============ Admin: Subscriptions ============

// GET /api/admin/subscriptions
func AdminListSubscriptions(c *gin.Context) {
	var list []models.Subscription
	database.DB.Order("created_at desc").Find(&list)

	type Out struct {
		models.Subscription
		UserEmail string `json:"user_email"`
	}
	out := make([]Out, 0, len(list))
	for _, s := range list {
		var u models.User
		database.DB.First(&u, s.UserID)
		out = append(out, Out{Subscription: s, UserEmail: u.Email})
	}
	c.JSON(http.StatusOK, out)
}

// POST /api/admin/subscriptions/:id/cancel
func AdminCancelSubscription(c *gin.Context) {
	id := c.Param("id")
	var s models.Subscription
	if err := database.DB.First(&s, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Subscription not found"})
		return
	}
	s.Status = "cancelled"
	database.DB.Save(&s)

	database.DB.Create(&models.Notification{
		UserID:  s.UserID,
		Message: "Your " + s.PlanName + " subscription was cancelled.",
		Type:    "subscription",
	})
	c.JSON(http.StatusOK, gin.H{"message": "Subscription cancelled"})
}

// ============ Admin: Consultations ============

// GET /api/admin/consultations
func AdminListConsultations(c *gin.Context) {
	var list []models.Consultation
	database.DB.Order("scheduled_at desc").Find(&list)

	type Out struct {
		models.Consultation
		UserEmail string `json:"user_email"`
	}
	out := make([]Out, 0, len(list))
	for _, con := range list {
		var u models.User
		database.DB.First(&u, con.UserID)
		out = append(out, Out{Consultation: con, UserEmail: u.Email})
	}
	c.JSON(http.StatusOK, out)
}

// POST /api/admin/consultations/:id/confirm
func AdminConfirmConsultation(c *gin.Context) {
	id := c.Param("id")
	var con models.Consultation
	if err := database.DB.First(&con, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Consultation not found"})
		return
	}
	con.Status = "confirmed"
	database.DB.Save(&con)

	database.DB.Create(&models.Notification{
		UserID:  con.UserID,
		Message: "Your consultation with " + con.ExpertName + " is confirmed.",
		Type:    "consultation",
	})
	c.JSON(http.StatusOK, gin.H{"message": "Consultation confirmed"})
}

// POST /api/admin/consultations/:id/cancel
func AdminCancelConsultation(c *gin.Context) {
	id := c.Param("id")
	var con models.Consultation
	if err := database.DB.First(&con, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Consultation not found"})
		return
	}
	con.Status = "cancelled"
	database.DB.Save(&con)

	database.DB.Create(&models.Notification{
		UserID:  con.UserID,
		Message: "Your consultation with " + con.ExpertName + " was cancelled.",
		Type:    "consultation",
	})
	c.JSON(http.StatusOK, gin.H{"message": "Consultation cancelled"})
}