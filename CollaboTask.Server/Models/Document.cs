using System.ComponentModel.DataAnnotations;

namespace CollaboTask.Server.Models
{
    public class Document
    {
        [Key]
        public string DocumentId { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string Name { get; set; } = string.Empty;

        public string FileType { get; set; } = string.Empty;

        public long Size { get; set; }

        // This stores the actual file data in the MS-SQL database
        public byte[] Content { get; set; } = Array.Empty<byte>();

        public string? ProjectId { get; set; }

        public string? TaskId { get; set; }

        public string UploadedBy { get; set; } = "System User";

        public DateTime UploadDate { get; set; } = DateTime.Now;

        public string Version { get; set; } = "1.0";

        public bool IsPublic { get; set; } = true;
    }
}