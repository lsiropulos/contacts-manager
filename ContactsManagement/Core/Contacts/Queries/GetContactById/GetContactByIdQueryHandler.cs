using Core.Contacts.Helpers;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Core.Contacts.Queries.GetContactById
{
    //TODO: Can use AutoMapper for mapping entities to DTOs instead of manual mapping.
    //TODO: Can use a lightweight library like Dapper instead of EF for faster queries.
    public class GetContactByIdQueryHandler : IRequestHandler<GetContactByIdQuery, ContactDetailsDto?>
    {
        private readonly AppDbContext _context;

        public GetContactByIdQueryHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ContactDetailsDto?> Handle(GetContactByIdQuery request, CancellationToken cancellationToken)
        {
            return await _context.Contacts
                .AsNoTracking()
                .Where(c => c.Id == request.Id && c.UserId == request.UserId)
                .Select(c => new ContactDetailsDto(
                    c.Id,
                    c.FirstName,
                    c.Surname,
                    c.DateOfBirth,
                    AgeHelper.CalculateAge(c.DateOfBirth),
                    c.Address,
                    c.Iban,
                    c.PhoneNumbers
                        .OrderByDescending(p => p.IsPrimary)
                        .Select(p => new PhoneNumberDetailsDto(
                            p.Id,
                            p.Number,
                            p.IsPrimary
                        )).ToList()
                ))
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
