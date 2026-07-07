// Standalone CLI: seeds 40-50 dummy rows into every admin-collection table
// in katherbox.db. Idempotent — re-running only fills gaps up to the target.
//
//      go run ./cmd/seeddummy
package main

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"katherbox/database"
	"katherbox/models"
)

const targetPerTable = 50

var (
	rng = rand.New(rand.NewSource(time.Now().UnixNano()))

	firstNames = []string{"Aarav", "Sara", "Rafi", "Maya", "Imran", "Nadia", "Tariq", "Lamia", "Ravi", "Anika", "Sumi", "Karan", "Priya", "Hasan", "Rina", "Omar", "Faria", "Bilal", "Tania", "Sabbir", "Mehjabin", "Asif", "Tahsin", "Rownak", "Nazia", "Sadman", "Aditi", "Taseen", "Mahmood", "Zara"}
	lastNames  = []string{"Khan", "Rahman", "Hossain", "Akter", "Islam", "Chowdhury", "Ahmed", "Begum", "Sultana", "Miah", "Das", "Roy", "Sarkar", "Talukder", "Bhuiyan", "Haque", "Mandal", "Sheikh", "Biswas", "Saha"}

	companies = []string{"GreenLeaf Co.", "Urban Jungle Ltd.", "PlantPeople Inc.", "BloomWorks", "Verdant Spaces", "Office Oasis", "Reception Greens", "Skyline Plants", "EcoScape", "Habitat Horticulture", "Florabit", "Petal & Stem", "Nursery Nine", "GreenStack", "Verdure"}

	plantNames = []string{
		"Snake Plant", "ZZ Plant", "Pothos", "Peace Lily", "Monstera Deliciosa",
		"Rubber Plant", "Spider Plant", "Anthurium", "Philodendron Brasil", "Fiddle Leaf Fig",
		"Calathea Orbifolia", "Areca Palm", "Money Plant", "Aglaonema Red", "Maranta Leuconeura",
		"Boston Fern", "English Ivy", "Lucky Bamboo", "Bromeliad", "Dieffenbachia",
		"String of Pearls", "Aloe Vera", "Jade Plant", "Echeveria", "Haworthia",
		"Cactus", "Succulent Bowl", "Lavender", "Rosemary", "Basil",
		"Mint", "Orchid", "Bonsai Ficus", "Bougainvillea", "Hibiscus",
	}

	categories = []struct{ Name, Slug, Parent, Icon string }{
		{"Plants", "plant", "", "🪴"},
		{"Indoor Plants", "indoor", "plant", "🏠"},
		{"Outdoor Plants", "outdoor", "plant", "🌳"},
		{"Succulents & Cacti", "succulent", "plant", "🌵"},
		{"Flowering Plants", "flowering", "plant", "🌸"},
		{"Herbs & Edibles", "herbs", "plant", "🌿"},
		{"Care & Supplies", "care", "", "🧴"},
		{"Soil & Fertilizer", "soil", "care", "🪨"},
		{"Pots & Planters", "pots", "care", "🏺"},
		{"Tools & Accessories", "tools", "care", "✂️"},
		{"Corporate Gifts", "corporate", "", "🎁"},
		{"Subscriptions", "subscription", "", "📦"},
		{"Blog", "blog", "", "📝"},
		{"Encyclopedia", "encyclopedia", "", "📚"},
		{"Care Guides", "care_guide", "", "🌱"},
	}

	planNames = []string{"Monthly Plant Box", "Cactus Box", "Herb Garden Box", "Indoor Jungle Box", "Pet-Friendly Box", "Office Green Box", "Tropical Box", "Succulent Mini Box"}
	topics    = []string{"Light & placement", "Watering schedule", "Repotting", "Pest control", "Fertilizing", "Propagation", "Pruning", "Drainage", "Humidity", "Indoor vs outdoor"}
	remTypes  = []string{"watering", "fertilizer", "repotting", "pruning", "mist", "rotate"}
	remIntvl  = []int{3, 5, 7, 10, 14, 21, 30, 45, 60, 90}
	statuses  = map[string][]string{
		"subscription":  {"active", "active", "active", "paused", "cancelled"},
		"consultation":  {"booked", "completed", "completed", "cancelled"},
		"corporate":     {"pending", "quoted", "accepted", "delivered", "cancelled"},
		"return":        {"pending", "approved", "rejected", "completed"},
		"reminder_done": {"true", "false", "false"},
	}
	reviewComments = []string{
		"Arrived in perfect condition, leaves are vibrant.",
		"Healthy plant, slightly smaller than expected but good value.",
		"Beautiful pot and well-packaged. Will buy again.",
		"Looks great in my living room. Already a new leaf in 2 weeks!",
		"Decent quality, soil was a little dry on arrival.",
		"Stunning plant — better than the photo.",
		"Friendly customer service replaced a damaged leaf.",
		"Exactly as described. Strong root system.",
		"Survived my beginner mistakes. Very forgiving.",
		"Smells fresh and the pot matches my decor.",
		"Five stars — I ordered two more.",
		"Good size for the price.",
		"Packaging could be improved but plant is healthy.",
		"Lush and full. Recommended.",
		"Best online plant purchase I've made.",
	}
	returnReasons = []string{
		"Damaged in transit",
		"Wrong plant delivered",
		"Plant arrived unhealthy",
		"Changed my mind",
		"Better price elsewhere",
		"Gift not needed",
		"Pot cracked",
		"Missing items",
		"Allergic reaction to plant",
		"Quality not as expected",
	}
	bogTitles = []string{
		"How to Water Your Snake Plant the Right Way",
		"Top 10 Low-Light Plants for Apartments",
		"The Beginner's Guide to Repotting",
		"Common Pests and How to Stop Them",
		"Why Your Monstera Has Yellow Leaves",
		"Best Pet-Safe Plants for Curious Cats",
		"Building a Hanging Garden on a Budget",
		"DIY Self-Watering Planters",
		"Seasonal Plant Care Calendar",
		"Propagating Pothos in 3 Easy Steps",
		"Light Levels Decoded: Bright, Indirect, Low",
		"Fertilizer Myths You Should Ignore",
		"Choosing the Right Pot: Drainage 101",
		"Caring for Plants While You Travel",
		"Aquaponics 101 for Plant Lovers",
		"Air-Purifying Plants That Actually Work",
		"Hardiness Zones Explained for Dhaka",
		"Monstera vs Philodendron: Spot the Difference",
		"Overwintering Tropical Plants",
		"Reading a Plant's Leaves: 5 Signals",
	}
)

// ---------- helpers ----------

func pickStr(xs []string) string       { return xs[rng.Intn(len(xs))] }
func pickInt(xs []int) int             { return xs[rng.Intn(len(xs))] }
func pickFloat(xs []float64) float64   { return xs[rng.Intn(len(xs))] }
func pickCat(xs []struct {
	Name, Slug, Parent, Icon string
}) struct {
	Name, Slug, Parent, Icon string
} {
	return xs[rng.Intn(len(xs))]
}

func namePair() (string, string, string) {
	fn, ln := pickStr(firstNames), pickStr(lastNames)
	email := strings.ToLower(fmt.Sprintf("%s.%s%d", fn, ln, rng.Intn(900)+100))
	return fn + " " + ln, fn + " " + ln, email + "@katherbox.test"
}

func futureDate(daysAhead int) string {
	return time.Now().AddDate(0, 0, daysAhead).Format("2006-01-02")
}

func pastDate(daysBack int) string {
	return time.Now().AddDate(0, 0, -daysBack).Format("2006-01-02")
}

func isoDateTime(daysOffset int) string {
	return time.Now().AddDate(0, 0, daysOffset).Format(time.RFC3339)
}

func ensureUser() models.User {
	// Reuse a non-admin user (or create one) to be the "owner" of dummy data.
	var u models.User
	err := database.DB.Where("role = ? AND email LIKE ?", "customer", "%@katherbox.test%").First(&u).Error
	if err == nil {
		return u
	}
	u = models.User{Name: "Demo Customer", Email: fmt.Sprintf("demo%d@katherbox.test", rng.Intn(99999)), Password: "x", Role: "customer"}
	database.DB.Create(&u)
	return u
}

func pickUserID() uint {
	var u models.User
	if err := database.DB.Where("role = ?", "customer").Order("RANDOM()").First(&u).Error; err == nil {
		return u.ID
	}
	return ensureUser().ID
}

func pickProductID() uint {
	var p models.Product
	if err := database.DB.Order("RANDOM()").First(&p).Error; err == nil {
		return p.ID
	}
	return 0
}

func pickOrderID() uint {
	var o models.Order
	if err := database.DB.Order("RANDOM()").First(&o).Error; err == nil {
		return o.ID
	}
	return 0
}

// ---------- per-table seeders ----------

func seedCategories() (created int) {
	for _, c := range categories {
		var existing models.Category
		if err := database.DB.Where("slug = ?", c.Slug).First(&existing).Error; err == nil {
			continue
		}
		database.DB.Create(&models.Category{Name: c.Name, Slug: c.Slug, Parent: c.Parent, Icon: c.Icon, Position: rng.Intn(100), Active: true})
		created++
	}
	return
}

func seedCoupons() (created int) {
	var have int64
	database.DB.Model(&models.Coupon{}).Count(&have)
	for i := have; i < targetPerTable; i++ {
		code := fmt.Sprintf("KB-%s-%02d", strings.ToUpper(pickStr([]string{"GREEN", "PLANT", "LEAF", "BLOOM", "GROW", "SALE", "VIP", "NEW", "GIFT", "SAVE"})), i+1)
		if err := database.DB.Where("code = ?", code).First(&models.Coupon{}).Error; err == nil {
			continue
		}
		disc := []float64{5, 10, 15, 20, 25, 30, 40, 50}[rng.Intn(8)]
		days := []int{7, 14, 30, 60, 90, 180}[rng.Intn(6)]
		active := rng.Float64() > 0.15
		minOrder := []float64{0, 500, 1000, 1500, 2000}[rng.Intn(5)]
		database.DB.Create(&models.Coupon{
			Code:            code,
			DiscountPercent: disc,
			ExpiresAt:       futureDate(days),
			Active:          active,
			MinOrderTotal:   minOrder,
		})
		created++
	}
	return
}

func seedSubscriptions() (created int) {
	var have int64
	database.DB.Model(&models.Subscription{}).Count(&have)
	for i := have; i < targetPerTable; i++ {
		uid := pickUserID()
		status := pickStr(statuses["subscription"])
		plan := pickStr(planNames)
		interval := []int{30, 60, 90, 30, 30, 30}[rng.Intn(6)]
		price := []float64{499, 699, 899, 1099, 1299, 1499, 1799, 1999}[rng.Intn(8)]
		sub := models.Subscription{
			UserID: uid, PlanName: plan, IntervalDays: interval,
			NextDelivery: futureDate(rng.Intn(interval) + 1),
			Status:       status, Price: price,
		}
		if status == "paused" {
			sub.PausedAt = pastDate(rng.Intn(20) + 1)
		}
		if status == "cancelled" {
			sub.CancelledAt = pastDate(rng.Intn(60) + 1)
		}
		if rng.Float64() > 0.5 {
			sub.LastRenewedAt = pastDate(rng.Intn(20) + 1)
			sub.DeliveriesCount = uint(rng.Intn(8) + 1)
		}
		database.DB.Create(&sub)
		created++
	}
	return
}

func seedConsultations() (created int) {
	var have int64
	database.DB.Model(&models.Consultation{}).Count(&have)
	for i := have; i < targetPerTable; i++ {
		c := models.Consultation{
			UserID:      pickUserID(),
			ExpertName:  pickStr([]string{"Dr. Anika Roy", "Tariq Hussain", "Maya Sen", "Iftekhar Khan", "Lamia Hossain", "Rina Akter"}),
			Topic:       pickStr(topics),
			ScheduledAt: isoDateTime(rng.Intn(45) - 10),
			Status:      pickStr(statuses["consultation"]),
			Notes:       pickStr([]string{"Bring photos of affected leaves.", "Discussed lighting in apartment.", "Recommended new pot.", "Will follow up next week.", "Sent care guide PDF.", ""}),
		}
		database.DB.Create(&c)
		created++
	}
	return
}

func seedReminders() (created int) {
	var have int64
	database.DB.Model(&models.CareReminder{}).Count(&have)
	for i := have; i < targetPerTable; i++ {
		pid := pickProductID()
		if pid == 0 {
			continue
		}
		r := models.CareReminder{
			UserID:       pickUserID(),
			ProductID:    pid,
			Type:         pickStr(remTypes),
			NextDueDate:  futureDate(rng.Intn(30)),
			IntervalDays: pickInt(remIntvl),
			Completed:    pickStr(statuses["reminder_done"]) == "true",
		}
		database.DB.Create(&r)
		created++
	}
	return
}

func seedCorporate() (created int) {
	var have int64
	database.DB.Model(&models.CorporateQuote{}).Count(&have)
	for i := have; i < targetPerTable; i++ {
		_, _, _ = namePair()
		budget := []float64{500, 750, 1000, 1500, 2000, 2500, 3000, 5000}[rng.Intn(8)]
		recipients := rng.Intn(40) + 5
		q := models.CorporateQuote{
			UserID:        pickUserID(),
			CompanyName:   pickStr(companies) + " #" + fmt.Sprintf("%02d", i+1),
			ContactName:   pickStr(firstNames) + " " + pickStr(lastNames),
			ContactEmail:  fmt.Sprintf("contact%d@biz.test", i+1),
			ContactPhone:  fmt.Sprintf("+8801%d%07d", 7+rng.Intn(3), rng.Intn(10000000)),
			Recipients:    fmt.Sprintf(`[{"name":"Recip %d","address":"Dhaka","product_id":%d}]`, i+1, pickProductID()),
			Message:       pickStr([]string{"Happy Holidays!", "Welcome to the team.", "Thank you!", "Best wishes.", "Onboarding gift."}),
			BudgetPerGift: budget,
			TotalEstimate: budget * float64(recipients),
			Status:        pickStr(statuses["corporate"]),
			AdminNotes:    pickStr([]string{"Awaiting branding guidelines.", "Quoted 15% discount.", "Bulk packaging confirmed.", "", "Client requested vegan wrap."}),
		}
		database.DB.Create(&q)
		created++
	}
	return
}

func seedReturns() (created int) {
	var have int64
	database.DB.Model(&models.ReturnRequest{}).Count(&have)
	for i := have; i < targetPerTable; i++ {
		oid := pickOrderID()
		if oid == 0 {
			continue
		}
		pid := pickProductID()
		qty := rng.Intn(3) + 1
		typ := pickStr([]string{"return", "refund", "exchange"})
		status := pickStr(statuses["return"])
		r := models.ReturnRequest{
			OrderID:      oid,
			UserID:       pickUserID(),
			Type:         typ,
			Reason:       pickStr(returnReasons),
			ProductID:    pid,
			Quantity:     qty,
			Items:        fmt.Sprintf(`[{"product_id":%d,"quantity":%d}]`, pid, qty),
			Status:       status,
			RefundAmount: float64(qty) * 350,
			Notes:        pickStr([]string{"Please process ASAP.", "Holiday gift return.", "Buyer remorse.", "", "Photo attached."}),
		}
		if status == "approved" || status == "completed" {
			r.AdminNote = pickStr([]string{"Refund processed.", "Replacement dispatched.", "Awaiting pickup.", "Closed."})
		}
		database.DB.Create(&r)
		created++
	}
	return
}

func seedReviews() (created int) {
	var have int64
	database.DB.Model(&models.Review{}).Count(&have)
	for i := have; i < targetPerTable; i++ {
		uid := pickUserID()
		pid := pickProductID()
		if pid == 0 {
			continue
		}
		var u models.User
		database.DB.First(&u, uid)
		// one review per (user, product) enforced by uniqueIndex
		if err := database.DB.Where("user_id = ? AND product_id = ?", uid, pid).First(&models.Review{}).Error; err == nil {
			continue
		}
		database.DB.Create(&models.Review{
			UserID: uid, ProductID: pid,
			Rating:  rng.Intn(2) + 4, // bias positive: 4 or 5
			Comment: pickStr(reviewComments),
			UserName: u.Name,
		})
		created++
	}
	return
}

func seedBlog() (created int) {
	var have int64
	database.DB.Model(&models.BlogPost{}).Count(&have)
	for i := have; i < targetPerTable; i++ {
		title := pickStr(bogTitles) + " #" + fmt.Sprintf("%02d", i+1)
		slug := strings.ToLower(strings.ReplaceAll(strings.ReplaceAll(title, "#", ""), " ", "-")) + "-" + fmt.Sprintf("%d", i+1)
		if err := database.DB.Where("slug = ?", slug).First(&models.BlogPost{}).Error; err == nil {
			continue
		}
		cat := pickStr([]string{"blog", "encyclopedia", "care_guide"})
		p := models.BlogPost{
			Slug:      slug,
			Title:     title,
			Excerpt:   pickStr(reviewComments),
			Content:   fmt.Sprintf("## %s\n\nThis is dummy long-form content for the seeded post. %s\n\n- Tip 1\n- Tip 2\n- Tip 3\n", title, pickStr(reviewComments)),
			CoverURL:  fmt.Sprintf("/images/blog/seed_%02d.jpg", rng.Intn(15)+1),
			Category:  cat,
			Author:    pickStr([]string{"KatherBox Editorial", "Dr. Anika Roy", "Maya Sen"}),
			AuthorID:  100, // admin id
			Published: rng.Float64() > 0.1,
			ViewCount: uint(rng.Intn(2500)),
		}
		if cat == "encyclopedia" {
			p.PlantID = pickProductID()
		}
		database.DB.Create(&p)
		created++
	}
	return
}

func seedRoles() (created int) {
	// promote/demote random non-admin users to staff, then mix back.
	var users []models.User
	database.DB.Where("role = ?", "customer").Order("RANDOM()").Limit(8).Find(&users)
	for i, u := range users {
		newRole := "customer"
		switch i % 3 {
		case 0:
			newRole = "staff"
		case 1:
			newRole = "customer"
		case 2:
			newRole = "staff"
		}
		database.DB.Model(&models.User{}).Where("id = ?", u.ID).Update("role", newRole)
	}
	// bump a few loyalty points
	database.DB.Model(&models.User{}).Where("role = ?", "customer").Limit(10).Update("points", rng.Intn(1500))
	return len(users)
}

// ---------- main ----------

func main() {
	database.ConnectDatabase()

	ensureUser() // guarantee at least one customer

	fmt.Printf("Seeding dummy data (idempotent, target = %d/table)\n\n", targetPerTable)
	results := []struct {
		name string
		n    int
	}{
		{"categories", seedCategories()},
		{"coupons", seedCoupons()},
		{"subscriptions", seedSubscriptions()},
		{"consultations", seedConsultations()},
		{"reminders", seedReminders()},
		{"corporate", seedCorporate()},
		{"returns", seedReturns()},
		{"reviews", seedReviews()},
		{"blog", seedBlog()},
		{"user_roles", seedRoles()},
	}

	for _, r := range results {
		fmt.Printf("  %-14s +%d\n", r.name, r.n)
	}

	// final snapshot
	fmt.Println("\n--- row counts after seed ---")
	for _, t := range []string{"users", "products", "orders", "categories", "reviews", "coupons", "subscriptions", "consultations", "care_reminders", "corporate_quotes", "return_requests", "blog_posts"} {
		var n int64
		database.DB.Table(t).Count(&n)
		fmt.Printf("  %-18s %d\n", t, n)
	}
}
