package routes

import (
	"katherbox/controllers"
	"katherbox/middleware"

	"github.com/gin-gonic/gin"
)

func SubscriptionRoutes(router *gin.Engine) {
	g := router.Group("/api/subscriptions")
	g.Use(middleware.AuthMiddleware())
	{
		g.POST("/", controllers.CreateSubscription)
		g.GET("/", controllers.GetMySubscriptions)
		g.POST("/:id/cancel", controllers.CancelSubscription)
		g.POST("/:id/advance", controllers.AdvanceSubscription)
	}
}