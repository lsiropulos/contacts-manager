using MediatR;

namespace Core.Contacts.Commands.DeleteContact
{
    public record DeleteContactCommand(string UserId, Guid Id) : IRequest;
}
