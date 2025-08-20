namespace OnlinePharmacyManagment.DTOs
{
    public class CreateOrderDetailDto
    {
        public int OrderId { get; set; }
        public int MedicineId { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdateOrderDetailDto
    {
        public int Quantity { get; set; }
    }

    public class OrderDetailDto
    {
        public int OrderDetailId { get; set; }
        public int OrderId { get; set; }
        public int MedicineId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
