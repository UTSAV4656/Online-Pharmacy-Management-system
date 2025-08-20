using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnlinePharmacyManagment.DTOs;
using OnlinePharmacyManagment.Models;

namespace OnlinePharmacyManagment.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly OnlinePharmacyContext _context;

        public CustomersController(OnlinePharmacyContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetCustomers()
        {
            return await _context.Customers
                .Include(c => c.User)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetCustomer(int id)
        {
            var customer = await _context.Customers
                .Include(c => c.User) 
                .FirstOrDefaultAsync(c => c.CustomerId == id);

            if (customer == null)
            {
                return NotFound();
            }

            return customer;
        }

        [HttpPost]
        public async Task<ActionResult<CustomerDto>> CreateCustomer(CreateCustomerDto dto)
        {
            var customer = new Customer
            {
                UserId = dto.UserId,
                Address = dto.Address,
                PhoneNumber = dto.PhoneNumber
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            var customerDto = new CustomerDto
            {
                CustomerId = customer.CustomerId,
                UserId = customer.UserId ?? 0,
                Address = customer.Address ?? "",
                PhoneNumber = customer.PhoneNumber ?? ""
            };

            return CreatedAtAction(nameof(GetCustomer), new { id = customer.CustomerId }, customerDto);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, UpdateCustomerDto dto)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound();
            }

            customer.UserId = dto.UserId;
            customer.Address = dto.Address;
            customer.PhoneNumber = dto.PhoneNumber;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CustomerExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound();
            }

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("dropdown")]
        public async Task<ActionResult<IEnumerable<object>>> GetCustomersDropdown()
        {
            var customers = await _context.Customers
                .Include(c => c.User)
                .Select(c => new
                {
                    value = c.CustomerId,
                    label = c.User.FullName
                })
                .ToListAsync();

            return Ok(customers);
        }
        private bool CustomerExists(int id)
        {
            return _context.Customers.Any(e => e.CustomerId == id);
        }
    }
}
