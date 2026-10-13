using Core.Contacts.Exceptions;
using Domain.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace ContactsManagementAPI
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }

        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            var (statusCode, title, detail) = exception switch
            {
                NotFoundException notFound => (
                    StatusCodes.Status404NotFound,
                    "Resource Not Found",
                    notFound.Message
                ),
                DomainException domain => (
                    StatusCodes.Status400BadRequest,
                    "Business Rule Violation",
                    domain.Message
                ),
                _ => (
                    StatusCodes.Status500InternalServerError,
                    "An unexpected error occurred",
                    "An unexpected error occurred while processing your request."
                )
            };

            if (statusCode == StatusCodes.Status500InternalServerError)
            {
                _logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);
            }
            else
            {
                _logger.LogWarning("Handled exception ({StatusCode} - {Title}): {Message}", statusCode, title, exception.Message);
            }

            httpContext.Response.StatusCode = statusCode;

            var problemDetails = new ProblemDetails
            {
                Status = statusCode,
                Title = title,
                Detail = detail,
                Instance = httpContext.Request.Path
            };

            await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
            return true;
        }
    }
}
