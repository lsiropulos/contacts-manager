import { CreateContactDto, UpdateContactDto } from '../models/contact.model';

export class LoadContacts {
  static readonly type = '[Contacts] Load Contacts';
  constructor(public payload?: { page?: number; pageSize?: number; searchTerm?: string }) {}
}

export class LoadContactById {
  static readonly type = '[Contacts] Load Contact By Id';
  constructor(public id: string) {}
}

export class ClearSelectedContact {
  static readonly type = '[Contacts] Clear Selected Contact';
}

export class CreateContact {
  static readonly type = '[Contacts] Create Contact';
  constructor(public payload: CreateContactDto) {}
}

export class UpdateContact {
  static readonly type = '[Contacts] Update Contact';
  constructor(
    public id: string,
    public payload: UpdateContactDto,
  ) {}
}

export class DeleteContact {
  static readonly type = '[Contacts] Delete Contact';
  constructor(public id: string) {}
}

export class ResetContactsState {
  static readonly type = '[Contacts] Reset State';
}
