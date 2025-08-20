using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OnlinePharmacyManagment.Models;

public partial class Customer
{
    public int CustomerId { get; set; }

    public int? UserId { get; set; }

    public string? Address { get; set; }

    public string? PhoneNumber { get; set; }

    [JsonIgnore]
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual User? User { get; set; }
}
