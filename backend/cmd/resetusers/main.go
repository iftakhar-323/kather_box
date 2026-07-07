package main

import (
"fmt"
"log"

"katherbox/database"
"katherbox/models"
"katherbox/utils"
)

func main() {
database.ConnectDatabase()

// Reset known demo accounts to known passwords.
type acc struct {
Email    string
Password string
Role     string
}
accounts := []acc{
{"admin@katherbox.com", "Admin@12345", "admin"},
{"admin@demo.com", "Admin@12345", "admin"},
{"admintest@test.com", "Admin@12345", "admin"},
{"ritu@test.com", "Admin@12345", "admin"},
{"karim@test.com", "Admin@12345", "admin"},
{"customer@test.com", "Customer@12345", "customer"},
{"iftakhar@gmail.com", "Customer@12345", "customer"},
{"cust1@test.com", "Customer@12345", "customer"},
}

for _, a := range accounts {
var u models.User
if err := database.DB.Where("email = ?", a.Email).First(&u).Error; err != nil {
fmt.Printf("  SKIP %s (not found)\n", a.Email)
continue
}
h, err := utils.HashPassword(a.Password)
if err != nil {
log.Fatalf("hash failed: %v", err)
}
	database.DB.Model(&u).Updates(map[string]interface{}{
		"password": h,
		"role":     a.Role,
	})
	fmt.Printf("  RESET %s  -> password=%s role=%s\n", a.Email, a.Password, a.Role)
}
fmt.Println("done.")
}
