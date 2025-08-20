using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlinePharmacyManagment.DTOs;
using OnlinePharmacyManagment.Models;

namespace OnlinePharmacyManagment.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly OnlinePharmacyContext _context;

        public PaymentsController(OnlinePharmacyContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetAllPayments()
        {
            var payments = await _context.Payments
                .Include(p => p.Order)
                .Select(p => new PaymentDto
                {
                    PaymentId = p.PaymentId,
                    OrderId = p.OrderId ?? 0,
                    PaymentDate = p.PaymentDate ?? DateTime.MinValue,
                    AmountPaid = p.AmountPaid ?? 0,
                    PaymentMethod = p.PaymentMethod ?? "",
                    PaymentStatus = p.PaymentStatus ?? ""
                })
                .ToListAsync();

            return Ok(payments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentDto>> GetPaymentById(int id)
        {
            var payment = await _context.Payments
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.PaymentId == id);

            if (payment == null)
                return NotFound();

            var dto = new PaymentDto
            {
                PaymentId = payment.PaymentId,
                OrderId = payment.OrderId ?? 0,
                PaymentDate = payment.PaymentDate ?? DateTime.MinValue,
                AmountPaid = payment.AmountPaid ?? 0,
                PaymentMethod = payment.PaymentMethod ?? "",
                PaymentStatus = payment.PaymentStatus ?? ""
            };

            return Ok(dto);
        }

        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetPaymentsByOrderId(int orderId)
        {
            var payments = await _context.Payments
                .Where(p => p.OrderId == orderId)
                .Select(p => new PaymentDto
                {
                    PaymentId = p.PaymentId,
                    OrderId = p.OrderId ?? 0,
                    PaymentDate = p.PaymentDate ?? DateTime.MinValue,
                    AmountPaid = p.AmountPaid ?? 0,
                    PaymentMethod = p.PaymentMethod ?? "",
                    PaymentStatus = p.PaymentStatus ?? ""
                })
                .ToListAsync();

            return Ok(payments);
        }

        [HttpPost]
        public async Task<ActionResult<PaymentDto>> AddPayment(CreatePaymentDto dto)
        {
            var order = await _context.Orders.FindAsync(dto.OrderId);
            if (order == null)
                return BadRequest("Invalid OrderId");

            var payment = new Payment
            {
                OrderId = dto.OrderId,
                AmountPaid = dto.AmountPaid,
                PaymentMethod = dto.PaymentMethod,
                PaymentStatus = dto.PaymentStatus,
                PaymentDate = DateTime.Now
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            var result = new PaymentDto
            {
                PaymentId = payment.PaymentId,
                OrderId = payment.OrderId ?? 0,
                PaymentDate = payment.PaymentDate ?? DateTime.MinValue,
                AmountPaid = payment.AmountPaid ?? 0,
                PaymentMethod = payment.PaymentMethod ?? "",
                PaymentStatus = payment.PaymentStatus ?? ""
            };

            return CreatedAtAction(nameof(GetPaymentById), new { id = result.PaymentId }, result);
        }

        [HttpGet("methods")]
        public ActionResult<IEnumerable<string>> GetPaymentMethods()
        {
            var methods = new List<string> { "Card", "UPI", "COD" };
            return Ok(methods);
        }

        [HttpGet("status")]
        public ActionResult<IEnumerable<string>> GetPaymentStatuses()
        {
            var statuses = new List<string> { "Success", "Failed" };
            return Ok(statuses);
        }
    }
}
