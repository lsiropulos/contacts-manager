using System.Text.Json.Serialization;

namespace DTOs
{
    public class BaseContactDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public DateOnly DateOfBirth { get; set; }
        public string Address { get; set; } = string.Empty;
        public string Iban { get; set; } = string.Empty;
        [JsonIgnore]
        public string? UserId { get; set; }
    }
}
