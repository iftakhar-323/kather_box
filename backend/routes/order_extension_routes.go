package routes

import (
	"katherbox/controllers"
	"katherbox/middleware"

	"github.com/gin-gonic/gin"
)

func OrderExtensionRoutes(router *gin.Engine) {
	auth := middleware.AuthMiddleware()

	// Events (timeline)
	router.GET("/api/orders/:id/events", auth, controllers.ListOrderEvents)
	router.POST("/api/orders/:id/events", auth, controllers.AddOrderEvent)
	router.POST("/api/orders/:id/events/admin", auth, middleware.AdminMiddleware(), controllers.AddOrderEvent)

	// Invoice + receipt (HTML, browser-printable)
	router.GET("/api/orders/:id/invoice", auth, controllers.InvoiceHTML)
	router.GET("/api/orders/:id/receipt", auth, controllers.ReceiptHTML)

	// Returns / Refunds / Exchanges
	router.POST("/api/returns", auth, controllers.CreateReturnRequest)
	router.GET("/api/returns", auth, controllers.ListReturns)
	router.PATCH("/api/returns/:id", auth, middleware.AdminMiddleware(), controllers.UpdateReturnRequest)

	// Estimated delivery
	router.GET("/api/orders/:id/estimated-delivery", auth, controllers.EstimatedDelivery)
}