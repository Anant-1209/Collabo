using System;
using System.ComponentModel.DataAnnotations;

namespace CollaboTask.Server.Models
{
    public class ActivityLog
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        public string? ProjectId { get; set; }
        
        [Required]
        public string User { get; set; } = string.Empty;
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        [Required]
        public string Type { get; set; } = "General"; // e.g., "Comment", "StatusUpdate"
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}