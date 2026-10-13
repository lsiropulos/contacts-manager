export interface ContactListDto {
  id: string;
  fullName: string;
  age: number;
  primaryPhoneNumber: string;
}

export interface PhoneNumberDetailsDto {
  id: string;
  number: string;
  isPrimary: boolean;
}

export interface ContactDetailsDto {
  id: string;
  firstName: string;
  surname: string;
  dateOfBirth: string;
  age: number;
  address: string;
  iban: string;
  phoneNumbers: PhoneNumberDetailsDto[];
}

export interface CreatePhoneNumberDto {
  number: string;
  isPrimary: boolean;
}

export interface CreateContactDto {
  firstName: string;
  surname: string;
  dateOfBirth: string;
  address: string;
  iban: string;
  phoneNumbers: CreatePhoneNumberDto[];
}

export interface UpdatePhoneNumberDto {
  id: string;
  number: string;
  isPrimary: boolean;
}

export interface UpdateContactDto {
  firstName: string;
  surname: string;
  dateOfBirth: string;
  address: string;
  iban: string;
  phoneNumbers: UpdatePhoneNumberDto[];
}
