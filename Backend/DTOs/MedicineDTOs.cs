// DTOs with CategoryId added
namespace OnlinePharmacyManagment.DTOs
{
    public class CreateMedicineDto
    {
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int QuantityInStock { get; set; }
        public DateOnly ExpiryDate { get; set; }
        public int CategoryId { get; set; } // ✅ Added
    }

    public class UpdateMedicineDto
    {
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int QuantityInStock { get; set; }
        public DateOnly ExpiryDate { get; set; }
        public int CategoryId { get; set; } // ✅ Added
    }

    public class MedicineDto
    {
        public int MedicineId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int QuantityInStock { get; set; }
        public DateOnly ExpiryDate { get; set; }
        public int CategoryId { get; set; } // ✅ Added
    }
}
