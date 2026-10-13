using Core.Contacts.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Core.Contacts.Commands.DeleteContact
{
    public class DeleteContactCommandHandler : IRequestHandler<DeleteContactCommand>
    {
        private readonly AppDbContext _context;

        public DeleteContactCommandHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task Handle(DeleteContactCommand deleteContactCommand, CancellationToken cancellationToken)
        {
            var contact = await _context.Contacts.FirstOrDefaultAsync(c => c.Id == deleteContactCommand.Id && c.UserId == deleteContactCommand.UserId, cancellationToken);

            if (contact == null)
            {
                throw new NotFoundException($"Contact with ID {deleteContactCommand.Id} was not found.");
            }

            _context.Contacts.Remove(contact);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
