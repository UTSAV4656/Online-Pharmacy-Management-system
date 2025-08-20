using System.Globalization;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlinePharmacyManagment.DTOs;
using OnlinePharmacyManagment.Models;

namespace OnlinePharmacyManagment.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly OnlinePharmacyContext _context;

        public OrdersController(OnlinePharmacyContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders(
        string? search = null,
        string? status = null,
        int? customerId = null)
        {
            var query = _context.Orders
                .Include(o => o.Customer)
                    .ThenInclude(c => c.User)
                .Include(o => o.OrderDetails)
                .Include(o => o.Payments)
                .AsQueryable();

            if (customerId.HasValue)
                query = query.Where(o => o.CustomerId == customerId.Value);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(o =>
                    o.OrderId.ToString().Contains(search) ||
                    (o.Customer != null && o.Customer.User != null && (
                        o.Customer.User.FullName.Contains(search) ||
                        o.Customer.User.Email.Contains(search)
                    )));
            }

            if (!string.IsNullOrEmpty(status) && status != "All")
                query = query.Where(o => o.Status == status);

            var orders = await query
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new
                {
                    id = o.OrderId,
                    orderId = "ORD-" + o.OrderId,
                    customerId = o.CustomerId,
                    customerName = o.Customer != null && o.Customer.User != null ? o.Customer.User.FullName : null,
                    customerEmail = o.Customer != null && o.Customer.User != null ? o.Customer.User.Email : null,
                    orderDate = o.OrderDate,
                    totalAmount = o.TotalAmount ?? 0,
                    status = o.Status,
                    itemCount = o.OrderDetails.Count,
                    paymentMethod = o.Payments.FirstOrDefault() != null ? o.Payments.FirstOrDefault()!.PaymentMethod : null,
                    paymentStatus = o.Payments.FirstOrDefault() != null ? o.Payments.FirstOrDefault()!.PaymentStatus : null,
                    shippingAddress = o.Customer != null ? o.Customer.Address : null
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpPut("{orderId}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] UpdateStatusRequest request)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return NotFound(new { message = "Order not found" });

            order.Status = request.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order status updated successfully" });
        }

        [HttpGet("export")]
        public async Task<IActionResult> ExportOrders(string? status = null)
        {
            var query = _context.Orders
                .Include(o => o.Customer)
                    .ThenInclude(c => c.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status) && status != "All")
                query = query.Where(o => o.Status == status);

            var orders = await query.ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("OrderId,CustomerName,CustomerEmail,OrderDate,TotalAmount,Status");

            foreach (var order in orders)
            {
                sb.AppendLine($"{order.OrderId}," +
                              $"{order.Customer?.User?.FullName}," +
                              $"{order.Customer?.User?.Email}," +
                              $"{order.OrderDate?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)}," +
                              $"{order.TotalAmount}," +
                              $"{order.Status}");
            }

            var bytes = Encoding.UTF8.GetBytes(sb.ToString());
            return File(bytes, "text/csv", $"orders-{DateTime.Now:yyyyMMdd}.csv");
        }

        // Additional endpoints for extended functionality
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Medicine)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
                return NotFound();

            return order;
        }

        [HttpPost]
        public async Task<ActionResult<OrderDto>> PlaceOrder(CreateOrderDto dto)
        {
            var order = new Order
            {
                CustomerId = dto.CustomerId,
                TotalAmount = dto.TotalAmount,
                Status = dto.Status,
                OrderDate = DateTime.Now
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var customer = await _context.Customers.FindAsync(order.CustomerId);

            var result = new OrderDto
            {
                OrderId = order.OrderId,
                CustomerId = order.CustomerId ?? 0,
                OrderDate = order.OrderDate ?? DateTime.MinValue,
                TotalAmount = order.TotalAmount ?? 0,
                Status = order.Status ?? "Pending"
            };

            return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
                return NotFound();

            _context.OrderDetails.RemoveRange(order.OrderDetails);
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByCustomer(int customerId)
        {
            return await _context.Orders
                .Where(o => o.CustomerId == customerId)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Medicine)
                .ToListAsync();
        }

        [HttpGet("{id}/details")]
        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetOrderDetails(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Medicine)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
                return NotFound();

            return order.OrderDetails.ToList();
        }

        [HttpGet("status")]
        public ActionResult<IEnumerable<string>> GetOrderStatuses()
        {
            var statuses = new List<string> { "Pending", "Processing", "Delivered", "Cancelled" };
            return Ok(statuses);
        }

        // DTO classes
        public class UpdateStatusRequest
        {
            public string Status { get; set; }
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(o => o.OrderId == id);
        }
    }
}