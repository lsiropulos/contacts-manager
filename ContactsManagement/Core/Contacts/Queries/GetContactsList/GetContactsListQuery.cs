using MediatR;

namespace Core.Contacts.Queries.GetContactsList
{
    public record GetContactsListQuery(
        string UserId,
        int PageIndex = 1,
        int PageSize = 10,
        string? SearchTerm = null
    ) : IRequest<PaginatedList<ContactListDto>>;
}
