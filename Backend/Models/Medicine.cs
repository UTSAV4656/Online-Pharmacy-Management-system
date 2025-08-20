using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OnlinePharmacyManagment.Models;

public partial class Medicine
{
    public int MedicineId { get; set; }

    public string? Name { get; set; }

    public string? Brand { get; set; }

    public string? Description { get; set; }

    public decimal? Price { get; set; }

    public int? QuantityInStock { get; set; }

    public DateOnly? ExpiryDate { get; set; }

    public int? CategoryId { get; set; }

    public virtual Category? Category { get; set; }
    
    [JsonIgnore]
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    public string? ImgURL { get; set; }

}
