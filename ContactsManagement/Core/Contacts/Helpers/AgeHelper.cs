namespace Core.Contacts.Helpers
{
    internal static class AgeHelper
    {
        public static int CalculateAge(DateOnly dateOfBirth)
        {
            var relativeTo = DateOnly.FromDateTime(DateTime.UtcNow);
            var yearsDiff = relativeTo.Year - dateOfBirth.Year;
            return dateOfBirth > relativeTo.AddYears(-yearsDiff) ? yearsDiff - 1 : yearsDiff;
        }
    }
}
