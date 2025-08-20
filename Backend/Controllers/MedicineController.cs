using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlinePharmacyManagment.DTOs;
using OnlinePharmacyManagment.Models;

namespace OnlinePharmacyManagment.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicinesController : ControllerBase
    {
        private readonly OnlinePharmacyContext _context;

        public MedicinesController(OnlinePharmacyContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Medicine>>> GetMedicines()
        {
            var medicines = await _context.Medicines
                .Include(m => m.Category)
                .ToListAsync();

            return medicines;
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetMedicinesPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 9)
        {
            var skip = (page - 1) * pageSize;

            var medicines = await _context.Medicines
                .Include(m => m.Category)
                .Skip(skip)
                .Take(pageSize)
                .ToListAsync();

            var totalCount = await _context.Medicines.CountAsync();

            return Ok(new
            {
                totalCount,
                page,
                pageSize,
            values = medicines
            });
        }



        [HttpGet("{id}")]
        public async Task<ActionResult<Medicine>> GetMedicine(int id)
        {
            var medicine = await _context.Medicines
                .Include(m => m.Category)
                .FirstOrDefaultAsync(m => m.MedicineId == id);

            if (medicine == null)
                return NotFound();

            return medicine;
        }


        [HttpPost]
        public async Task<ActionResult<MedicineDto>> AddMedicine(CreateMedicineDto dto)
        {
            var medicine = new Medicine
            {
                Name = dto.Name,
                Brand = dto.Brand,
                Description = dto.Description,
                Price = dto.Price,
                QuantityInStock = dto.QuantityInStock,
                ExpiryDate = dto.ExpiryDate,
                CategoryId = dto.CategoryId // ✅ New
            };

            _context.Medicines.Add(medicine);
            await _context.SaveChangesAsync();

            var medicineDto = new MedicineDto
            {
                MedicineId = medicine.MedicineId,
                Name = medicine.Name!,
                Brand = medicine.Brand!,
                Description = medicine.Description!,
                Price = medicine.Price ?? 0,
                QuantityInStock = medicine.QuantityInStock ?? 0,
                ExpiryDate = medicine.ExpiryDate ?? default,
                CategoryId = medicine.CategoryId ?? 0 // ✅ New
            };

            return CreatedAtAction(nameof(GetMedicine), new { id = medicine.MedicineId }, medicineDto);
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMedicine(int id, UpdateMedicineDto dto)
        {
            var medicine = await _context.Medicines.FindAsync(id);
            if (medicine == null)
                return NotFound();

            medicine.Name = dto.Name;
            medicine.Brand = dto.Brand;
            medicine.Description = dto.Description;
            medicine.Price = dto.Price;
            medicine.QuantityInStock = dto.QuantityInStock;
            medicine.ExpiryDate = dto.ExpiryDate;
            medicine.CategoryId = dto.CategoryId;

            await _context.SaveChangesAsync();
            return NoContent();
        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedicine(int id)
        {
            try
            {
                var medicine = await _context.Medicines.FindAsync(id);
                if (medicine == null)
                    return NotFound();

                _context.Medicines.Remove(medicine);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (DbUpdateException dbEx)
            {
                return StatusCode(500, $"Database Update Error: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Server Error: {ex.Message}");
            }
        }



        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Medicine>>> SearchMedicines(string name)
        {
            return await _context.Medicines
                .Where(m => m.Name!.Contains(name) || m.Brand!.Contains(name))
                .ToListAsync();
        }

        [HttpGet("stock")]
        public async Task<ActionResult<IEnumerable<Medicine>>> GetLowStockMedicines()
        {
            const int lowStockThreshold = 10;

            return await _context.Medicines
                .Where(m => m.QuantityInStock != null && m.QuantityInStock <= lowStockThreshold)
                .ToListAsync();
        }

        [HttpGet("dropdown")]
        public async Task<ActionResult<IEnumerable<object>>> GetMedicinesDropdown()
        {
            var medicines = await _context.Medicines
                .Select(m => new
                {
                    value = m.MedicineId,
                    label = m.Name
                })
                .ToListAsync();

            return Ok(medicines);
        }
        private bool MedicineExists(int id)
        {
            return _context.Medicines.Any(e => e.MedicineId == id);
        }
    }
}
