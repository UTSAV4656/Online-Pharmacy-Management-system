using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlinePharmacyManagment.Models;

namespace OnlinePharmacyManagment.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : Controller
    {
        private readonly OnlinePharmacyContext _context;

        public DashboardController(OnlinePharmacyContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats([FromQuery] string role, [FromQuery] int userId)
        {
            if (role == "Admin" || role == "Pharmacist")
            {
                var totalMedicines = await _context.Medicines.CountAsync();
                var totalOrders = await _context.Orders.CountAsync();
                var totalRevenue = await _context.Payments
                    .Where(p => p.PaymentStatus == "Success")
                    .SumAsync(p => (decimal?)p.AmountPaid) ?? 0;

                var activeCustomers = await _context.Customers
                    .Select(c => c.CustomerId)
                    .Distinct()
                    .CountAsync();

                var pendingPrescriptions = await _context.Orders
                    .Where(o => o.Status == "Pending")
                    .CountAsync();

                return Ok(new
                {
                    totalMedicines,
                    totalOrders,
                    activeCustomers,
                    totalRevenue
                });
            }
            else if (role == "Customer")
            {
                var customerId = await _context.Customers
                    .Where(c => c.UserId == userId)
                    .Select(c => c.CustomerId)
                    .FirstOrDefaultAsync();

                var myOrders = await _context.Orders
                    .Where(o => o.CustomerId == customerId)
                    .CountAsync();

                var myPrescriptions = 0;

                var totalRevenue = await _context.Payments
                    .Where(p => p.Order.CustomerId == customerId && p.PaymentStatus == "Success")
                    .SumAsync(p => (decimal?)p.AmountPaid) ?? 0;

                return Ok(new
                {
                    myOrders,
                    myPrescriptions,
                    totalOrders = myOrders,
                    totalRevenue
                });
            }

            return BadRequest("Invalid role");
        }

        [HttpGet("recent-orders")]
        public async Task<IActionResult> GetRecentOrders([FromQuery] string role, [FromQuery] int userId, [FromQuery] int limit = 4)
        {
            IQueryable<Order> query = _context.Orders
                .Include(o => o.Customer)
                .ThenInclude(c => c.User)
                .OrderByDescending(o => o.OrderDate);

            if (role == "Customer")
            {
                var customerId = await _context.Customers
                    .Where(c => c.UserId == userId)
                    .Select(c => c.CustomerId)
                    .FirstOrDefaultAsync();

                query = query.Where(o => o.CustomerId == customerId);
            }

            var recentOrders = await query.Take(limit).Select(o => new
            {
                o.OrderId,
                CustomerName = role != "Customer" ? o.Customer.User.FullName : null,
                o.TotalAmount,
                o.Status,
                o.OrderDate
            }).ToListAsync();

            return Ok(recentOrders);
        }
    }
}
