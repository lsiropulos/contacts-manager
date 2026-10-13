using Core.Contacts.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Core.Contacts.Commands.UpdateContact
{
    public class UpdateContactCommandHandler : IRequestHandler<UpdateContactCommand, bool>
    {
        private readonly AppDbContext _context;

        public UpdateContactCommandHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateContactCommand updateContactCommand, CancellationToken cancellationToken)
        {
            var contact = await _context.Contacts.Where(c => c.UserId == updateContactCommand.UpdateContactDto.UserId)
                .Include(c => c.PhoneNumbers)
                .FirstOrDefaultAsync(c => c.Id == updateContactCommand.Id, cancellationToken);

            if (contact == null)
            {
                throw new NotFoundException($"Contact with ID {updateContactCommand.Id} was not found.");
            }

            var dto = updateContactCommand.UpdateContactDto;
            contact.UpdateDetails(
                dto.FirstName,
                dto.Surname,
                dto.DateOfBirth,
                dto.Address,
                dto.Iban,
                dto.PhoneNumbers.Select(p => (p.Id, p.Number, p.IsPrimary))
            );

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
