using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollaboTask.Server.Data;
using CollaboTask.Server.Models;

namespace CollaboTask.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DocumentsController(AppDbContext context)
        {
            _context = context;
        }

        // Fulfills Requirements 40, 41, 42 - Optimized to return metadata
        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<IEnumerable<Document>>> GetProjectDocuments(string projectId)
        {
            return await _context.Documents
                .Where(d => d.ProjectId == projectId)
                .Select(d => new Document
                {
                    DocumentId = d.DocumentId,
                    Name = d.Name,
                    FileType = d.FileType,
                    Size = d.Size,
                    UploadDate = d.UploadDate,
                    UploadedBy = d.UploadedBy,
                    Version = d.Version,
                    IsPublic = d.IsPublic
                })
                .ToListAsync();
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] string? projectId)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded");

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);

            var document = new Document
            {
                Name = file.FileName,
                FileType = file.ContentType,
                Size = file.Length,
                Content = memoryStream.ToArray(),
                ProjectId = projectId,
                Version = "1.0", // Requirement 40: Start versioning
                IsPublic = true  // Requirement 41: Default to public
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            return Ok(new { document.DocumentId, document.Name });
        }

        [HttpGet("download/{id}")]
        public async Task<IActionResult> DownloadFile(string id)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return NotFound();

            return File(doc.Content, doc.FileType, doc.Name);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(string id)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document == null) return NotFound();

            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // Requirement 40: Version Control Implementation
        [HttpPost("{id}/version")]
        public async Task<IActionResult> NewVersion(string id, [FromForm] IFormFile file)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return NotFound();

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);

            if (double.TryParse(doc.Version, out double currentVer))
            {
                doc.Version = (currentVer + 0.1).ToString("0.0");
            }

            doc.Content = memoryStream.ToArray();
            doc.UploadDate = DateTime.Now;
            doc.Size = file.Length;

            await _context.SaveChangesAsync();
            return Ok(doc);
        }

        // Requirement 41: Sharing & Permissions Toggle
        [HttpPut("{id}/permissions")]
        public async Task<IActionResult> UpdatePermissions(string id, [FromBody] bool isPublic)
        {
            var doc = await _context.Documents.FindAsync(id);
            if (doc == null) return NotFound();

            doc.IsPublic = isPublic;
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}