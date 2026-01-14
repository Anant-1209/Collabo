

namespace CollaboTask.Server.Models
{
    public class Comment
    {
        public string CommentId { get; set; } = Guid.NewGuid().ToString();
        public string? TaskId { get; set; }
        public string Text { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}