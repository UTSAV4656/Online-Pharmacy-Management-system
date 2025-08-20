using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlinePharmacyManagment.DTOs;
using OnlinePharmacyManagment.Models;

namespace OnlinePharmacyManagment.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderDetailsController : ControllerBase
    {
        private readonly OnlinePharmacyContext _context;

        public OrderDetailsController(OnlinePharmacyContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<OrderDetailDto>> AddItemToOrder(CreateOrderDetailDto dto)
        {
            var medicine = await _context.Medicines.FindAsync(dto.MedicineId);
            if (medicine == null)
                return BadRequest("Invalid MedicineId");

            var orderDetail = new OrderDetail
            {
                OrderId = dto.OrderId,
                MedicineId = dto.MedicineId,
                Quantity = dto.Quantity,
                UnitPrice = medicine.Price
            };

            _context.OrderDetails.Add(orderDetail);
            await _context.SaveChangesAsync();

            var result = new OrderDetailDto
            {
                OrderDetailId = orderDetail.OrderDetailId,
                OrderId = orderDetail.OrderId ?? 0,
                MedicineId = orderDetail.MedicineId ?? 0,
                Quantity = orderDetail.Quantity ?? 0,
                UnitPrice = orderDetail.UnitPrice ?? 0
            };

            return CreatedAtAction(nameof(GetOrderDetail), new { id = result.OrderDetailId }, result);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDetailDto>> GetOrderDetail(int id)
        {
            var detail = await _context.OrderDetails
                .Include(d => d.Medicine)
                .FirstOrDefaultAsync(d => d.OrderDetailId == id);

            if (detail == null)
                return NotFound();

            var dto = new OrderDetailDto
            {
                OrderDetailId = detail.OrderDetailId,
                OrderId = detail.OrderId ?? 0,
                MedicineId = detail.MedicineId ?? 0,
                Quantity = detail.Quantity ?? 0,
                UnitPrice = detail.UnitPrice ?? 0
            };

            return Ok(dto);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItemQuantity(int id, UpdateOrderDetailDto dto)
        {
            var detail = await _context.OrderDetails.FindAsync(id);
            if (detail == null)
                return NotFound();

            detail.Quantity = dto.Quantity;
            _context.Entry(detail).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveItemFromOrder(int id)
        {
            var detail = await _context.OrderDetails.FindAsync(id);
            if (detail == null)
                return NotFound();

            _context.OrderDetails.Remove(detail);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
