using System.ComponentModel.DataAnnotations;

namespace OnlinePharmacyManagment.DTOs
{
    public class CreateUserDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
    }

    public class UpdateUserDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
    }
    public class RegistrationRequest
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Role { get; set; } = "Customer"; // Default role

        public string Address { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
    }

    public class LoginDTO
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

}
