package routes

import (
	"katherbox/controllers"
	"katherbox/middleware"

	"github.com/gin-gonic/gin"
)

func CareJournalRoutes(router *gin.Engine) {
	auth := middleware.AuthMiddleware()
	admin := middleware.AdminMiddleware()

	// Growth Journal
	router.GET("/api/journal", auth, controllers.ListJournal)
	router.POST("/api/journal", auth, controllers.AddJournalEntry)
	router.DELETE("/api/journal/:id", auth, controllers.DeleteJournalEntry)
	router.GET("/api/journal/timeline", auth, controllers.JournalTimeline)

	// Care Schedule
	router.GET("/api/care-schedule", controllers.ListCareSchedule)
	router.POST("/api/care-schedule", auth, admin, controllers.AddCareSchedule)
	router.DELETE("/api/care-schedule/:id", auth, admin, controllers.DeleteCareSchedule)

	// Care Calendar (aggregated, per-user)
	router.GET("/api/care-calendar", auth, controllers.CareCalendar)
}