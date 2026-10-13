namespace Core.Contacts.Queries.GetContactsList
{
    public record ContactListDto(
        Guid Id,
        string FullName,
        int Age,
        string PrimaryPhoneNumber
    );
}
