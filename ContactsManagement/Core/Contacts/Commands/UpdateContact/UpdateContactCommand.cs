using DTOs.UpdateContactDtos;
using MediatR;

namespace Core.Contacts.Commands.UpdateContact
{
    public record UpdateContactCommand(Guid Id, UpdateContactDto UpdateContactDto) : IRequest<bool>;
}
