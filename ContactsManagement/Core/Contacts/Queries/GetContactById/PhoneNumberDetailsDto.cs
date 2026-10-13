namespace Core.Contacts.Queries.GetContactById
{
    public record PhoneNumberDetailsDto(
        Guid Id,
        string Number,
        bool IsPrimary
    );
}
