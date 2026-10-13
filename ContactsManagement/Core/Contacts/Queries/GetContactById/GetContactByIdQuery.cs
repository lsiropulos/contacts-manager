using MediatR;

namespace Core.Contacts.Queries.GetContactById
{
    public record GetContactByIdQuery(string UserId, Guid Id) : IRequest<ContactDetailsDto?>;
}
