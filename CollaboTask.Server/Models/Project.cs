using System.ComponentModel.DataAnnotations;

namespace CollaboTask.Server.Models
{
    public class Project
    {
        [Key]
        public string ProjectId { get; set; } = Guid.NewGuid().ToString();
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = "Active";
        public string? Creator { get; set; }
        // Comma-separated tags for project categorization
        public string? Tags { get; set; }
    }
}