using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlinePharmacyManagment.DTOs;
using OnlinePharmacyManagment.Models;

namespace OnlinePharmacyManagment.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly OnlinePharmacyContext _context;

        public AuthController(OnlinePharmacyContext context)
        {
            _context = context;
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegistrationRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if email already exists
            bool emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email);
            if (emailExists)
                return Conflict(new { message = "Email already registered." });

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                Password = request.Password, // In production, hash this!
                Role = request.Role,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (request.Role.ToLower() == "customer")
            {
                if (string.IsNullOrWhiteSpace(request.Address) || string.IsNullOrWhiteSpace(request.PhoneNumber))
                {
                    return BadRequest(new { message = "Address and PhoneNumber are required for Customer role." });
                }

                var customer = new Customer
                {
                    UserId = user.UserId,
                    Address = request.Address,
                    PhoneNumber = request.PhoneNumber
                };

                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Registration successful", userId = user.UserId });
        }


        [HttpPost("Login")]
        public IActionResult Login(LoginDTO dto)
        {
            var user = _context.Users
                .FirstOrDefault(u => u.Email == dto.Email && u.Password == dto.Password);

            if (user == null)
                return Unauthorized("Invalid email or password.");

            return Ok(new
            {
                Message = "Login successful",
                user.UserId,
                user.FullName,
                user.Email,
                user.Role
            });
        }
    }
}
