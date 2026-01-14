using System.ComponentModel.DataAnnotations;

namespace CollaboTask.Server.Models
{
    public class User
    {
        [Key]
        public int user_id { get; set; }

        [Required]
        [EmailAddress]
        public required string email { get; set; }

        [Required]
        public required string name { get; set; }

        public string? profile_picture { get; set; }

        [Required]
        public required string role { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;
        
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
    }
}