package routes

import (
	"katherbox/controllers"
	"katherbox/middleware"

	"github.com/gin-gonic/gin"
)

// AdminRoutes mounts admin-only endpoints under /api/admin/*.
func AdminRoutes(router *gin.Engine) {
	g := router.Group("/api/admin")
	g.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		g.GET("/orders", controllers.GetAllOrders)
		g.PUT("/orders/:id/status", controllers.UpdateOrderStatus)
		g.DELETE("/orders/:id", controllers.DeleteOrder)
		g.GET("/analytics", controllers.AnalyticsSummary)

		// reminders
		g.GET("/reminders", controllers.AdminListReminders)
		g.POST("/reminders/:id/complete", controllers.AdminCompleteReminder)

		// subscriptions
		g.GET("/subscriptions", controllers.AdminListSubscriptions)
		g.POST("/subscriptions/:id/cancel", controllers.AdminCancelSubscription)

		// consultations
		g.GET("/consultations", controllers.AdminListConsultations)
		g.POST("/consultations/:id/confirm", controllers.AdminConfirmConsultation)
		g.POST("/consultations/:id/cancel", controllers.AdminCancelConsultation)

		// corporate quotes
		g.GET("/corporate", controllers.GetAllCorporateQuotes)
		g.PUT("/corporate/:id", controllers.UpdateCorporateStatus)
	}
}