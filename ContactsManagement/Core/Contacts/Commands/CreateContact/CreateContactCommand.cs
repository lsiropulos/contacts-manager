using DTOs.CreateContact;
using MediatR;

namespace Core.Contacts.Commands.CreateContact
{
    public record CreateContactCommand(CreateContactDto CreateContactDto) : IRequest<Guid>;
}
