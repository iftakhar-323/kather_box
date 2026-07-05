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
		g.POST("/:id/pause", controllers.PauseSubscription)
		g.POST("/:id/resume", controllers.ResumeSubscription)
		g.POST("/:id/renew", controllers.RenewSubscription)
		g.GET("/:id/deliveries", controllers.ListSubscriptionDeliveries)
	}
}