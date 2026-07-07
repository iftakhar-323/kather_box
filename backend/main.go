package main

import (
	"time"

	"katherbox/database"
	"katherbox/models"
	"katherbox/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.ConnectDatabase()
	database.DB.AutoMigrate(
		&models.Product{},
		&models.User{},
		&models.Cart{},
		&models.CartItem{},
		&models.Order{},
		&models.OrderItem{},
		&models.WishlistItem{},
		&models.Notification{},
		&models.Coupon{},
		&models.CareReminder{},
		&models.Address{},
		&models.Subscription{},
		&models.Consultation{},
		&models.CorporateQuote{},
		&models.CommunityPost{},
		&models.CommunityComment{},
		&models.CommunityLike{},
		// Sprint D-I extensions
		&models.OrderEvent{},
		&models.ReturnRequest{},
		&models.SubscriptionDelivery{},
		&models.GrowthJournal{},
		&models.CareSchedule{},
		&models.CommunityFollow{},
		&models.CommunityBookmark{},
		&models.CommunityGroup{},
		&models.CommunityGroupMember{},
		&models.CommunityQuestion{},
		&models.CommunityAnswer{},
		&models.Achievement{},
		&models.UserAchievement{},
		&models.ReferralCode{},
		&models.Referral{},
		&models.MembershipTier{},
		&models.CouponReward{},
		&models.CorporateOrder{},
		&models.BlogPost{},
		&models.PageView{},
		&models.GuestOrder{},
		&models.GiftCard{},
		&models.ShippingRule{},
		&models.TaxRule{},
		&models.UserMembership{},
		&models.Review{},
		&models.Category{},
	)

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.ProductRoutes(router)
	routes.AuthRoutes(router)
	routes.CartRoutes(router)
	routes.OrderRoutes(router)
	routes.WishlistRoutes(router)
	routes.NotificationRoutes(router)
	routes.CouponRoutes(router)
	routes.ReminderRoutes(router)
	routes.GiftRoutes(router)
	routes.SeasonalRoutes(router)
	routes.SubscriptionRoutes(router)
	routes.ConsultationRoutes(router)
	routes.CorporateRoutes(router)
	routes.CommunityRoutes(router)
	routes.AdminRoutes(router)
	// Sprint D-I extensions
	routes.OrderExtensionRoutes(router)
	routes.CareJournalRoutes(router)
	routes.CommunityExtensionRoutes(router)
	routes.LoyaltyRoutes(router)
	routes.CorporateOrderRoutes(router)
	routes.BlogRoutes(router)
	routes.AnalyticsRoutes(router)
	routes.ShoppingRoutes(router)
	routes.CSVRoutes(router)
	routes.BackupRoutes(router)
	routes.AddressRoutes(router)
	routes.ReviewRoutes(router)
	routes.CategoryRoutes(router)

	router.Run(":8081")
}
