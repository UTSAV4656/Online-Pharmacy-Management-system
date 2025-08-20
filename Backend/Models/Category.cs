using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OnlinePharmacyManagment.Models;

public partial class Category
{
    public int CategoryId { get; set; }

    public string? Name { get; set; }

    [JsonIgnore]
    public virtual ICollection<Medicine> Medicines { get; set; } = new List<Medicine>();
}
