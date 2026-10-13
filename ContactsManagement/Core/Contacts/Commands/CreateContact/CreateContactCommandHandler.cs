using Domain;
using MediatR;
using Persistence;

namespace Core.Contacts.Commands.CreateContact
{
    public class CreateContactCommandHandler : IRequestHandler<CreateContactCommand, Guid>
    {
        private readonly AppDbContext _context;

        public CreateContactCommandHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(CreateContactCommand request, CancellationToken cancellationToken)
        {
            var dto = request.CreateContactDto;
            var contact = Contact.Create(
                dto.FirstName,
                dto.Surname,
                dto.DateOfBirth,
                dto.Address,
                dto.Iban,
                dto.PhoneNumbers.Select(p => (p.Number, p.IsPrimary)),
                dto.UserId
            );

            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync(cancellationToken);

            return contact.Id;
        }
    }
}
