package routes

import (
	"katherbox/controllers"
	"katherbox/middleware"

	"github.com/gin-gonic/gin"
)

func ConsultationRoutes(router *gin.Engine) {
	g := router.Group("/api/consultations")
	g.Use(middleware.AuthMiddleware())
	{
		g.GET("/experts", controllers.ListExperts)
		g.POST("/", controllers.BookConsultation)
		g.GET("/", controllers.GetMyConsultations)
		g.POST("/:id/cancel", controllers.CancelConsultation)
	}
}