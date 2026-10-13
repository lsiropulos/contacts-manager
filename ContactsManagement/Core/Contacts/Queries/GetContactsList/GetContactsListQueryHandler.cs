using Core.Contacts.Helpers;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Core.Contacts.Queries.GetContactsList
{
    public class GetContactsListQueryHandler : IRequestHandler<GetContactsListQuery, PaginatedList<ContactListDto>>
    {
        private readonly AppDbContext _context;

        public GetContactsListQueryHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PaginatedList<ContactListDto>> Handle(GetContactsListQuery request, CancellationToken cancellationToken)
        {
            // Base query with tracking disabled
            var query = _context.Contacts.Where(c => c.UserId == request.UserId).AsNoTracking();

            // Apply search filter if search term is provided
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var term = request.SearchTerm.Trim();
                query = query.Where(c =>
                    c.FirstName.Contains(term) ||
                    c.Surname.Contains(term));
            }

            // Get total count for filtered pagination metadata
            var totalCount = await query.CountAsync(cancellationToken);

            // Return early if no records match
            if (totalCount == 0)
            {
                return new PaginatedList<ContactListDto>(new List<ContactListDto>(), 0, request.PageIndex, request.PageSize);
            }

            // Project database-translatable fields first and apply paging (Skip/Take)
            var rawContacts = await query
                .OrderBy(c => c.FirstName)
                .ThenBy(c => c.Surname)
                .Skip((request.PageIndex - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(c => new
                {
                    c.Id,
                    FullName = $"{c.FirstName} {c.Surname}",
                    c.DateOfBirth,
                    PrimaryPhone = c.PhoneNumbers
                        .Where(p => p.IsPrimary)
                        .Select(p => p.Number)
                        .FirstOrDefault() ?? string.Empty
                })
                .ToListAsync(cancellationToken);

            // Perform in-memory transformation (CalculateAge) on the paged items only
            var items = rawContacts.Select(c => new ContactListDto(
                c.Id,
                c.FullName,
                AgeHelper.CalculateAge(c.DateOfBirth),
                c.PrimaryPhone
            )).ToList();

            return new PaginatedList<ContactListDto>(items, totalCount, request.PageIndex, request.PageSize);
        }
    }
}