import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ContactListDto, ContactDetailsDto } from '../models/contact.model';
import { ContactsService } from '../services/contacts.service';
import {
  LoadContacts,
  LoadContactById,
  ClearSelectedContact,
  CreateContact,
  UpdateContact,
  DeleteContact,
  ResetContactsState,
} from './contacts.actions';

export interface ContactsStateModel {
  contacts: ContactListDto[];
  selectedContact: ContactDetailsDto | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    searchTerm: string;
  };
}

export const contactsStateDefaults: ContactsStateModel = {
  contacts: [],
  selectedContact: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 5,
    total: 0,
    searchTerm: '',
  },
};

@State<ContactsStateModel>({
  name: 'contacts',
  defaults: contactsStateDefaults,
})
@Injectable()
export class ContactsState {
  private contactsService = inject(ContactsService);

  @Selector()
  static contacts(state: ContactsStateModel): ContactListDto[] {
    return state.contacts || [];
  }

  @Selector()
  static selectedContact(state: ContactsStateModel): ContactDetailsDto | null {
    return state.selectedContact;
  }

  @Selector()
  static loading(state: ContactsStateModel): boolean {
    return state.loading;
  }

  @Selector()
  static error(state: ContactsStateModel): string | null {
    return state.error;
  }

  @Selector()
  static pagination(state: ContactsStateModel) {
    return state.pagination;
  }

  @Action(LoadContacts)
  loadContacts(ctx: StateContext<ContactsStateModel>, action: LoadContacts) {
    const currentState = ctx.getState();
    const page = action.payload?.page ?? currentState.pagination.page;
    const pageSize = action.payload?.pageSize ?? currentState.pagination.pageSize;
    const searchTerm =
      action.payload?.searchTerm !== undefined
        ? action.payload.searchTerm
        : currentState.pagination.searchTerm;

    ctx.patchState({ loading: true, error: null });

    return this.contactsService.getContacts(page, pageSize, searchTerm).pipe(
      tap({
        next: (response) => {
          ctx.patchState({
            contacts: response.items,
            pagination: {
              page: response.pageIndex,
              pageSize: pageSize,
              total: response.totalCount,
              searchTerm: searchTerm,
            },
            loading: false,
          });
        },
        error: (err) =>
          ctx.patchState({ error: err.message || 'Failed to load contacts', loading: false }),
      }),
    );
  }

  @Action(LoadContactById)
  loadContactById(ctx: StateContext<ContactsStateModel>, action: LoadContactById) {
    ctx.patchState({ loading: true, error: null, selectedContact: null });
    return this.contactsService.getContactById(action.id).pipe(
      tap({
        next: (contact) => {
          ctx.patchState({
            selectedContact: contact,
            loading: false,
          });
        },
        error: (err) => ctx.patchState({ error: err.message, loading: false }),
      }),
    );
  }

  @Action(ClearSelectedContact)
  clearSelectedContact(ctx: StateContext<ContactsStateModel>) {
    ctx.patchState({ selectedContact: null, error: null });
  }

  @Action(ResetContactsState)
  resetContactsState(ctx: StateContext<ContactsStateModel>) {
    ctx.setState(contactsStateDefaults);
  }

  @Action(CreateContact)
  createContact(ctx: StateContext<ContactsStateModel>, action: CreateContact) {
    ctx.patchState({ loading: true, error: null });
    return this.contactsService.createContact(action.payload).pipe(
      switchMap(() => {
        const state = ctx.getState();
        return ctx.dispatch(
          new LoadContacts({
            page: 1,
            pageSize: state.pagination.pageSize,
          }),
        );
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      }),
    );
  }

  @Action(UpdateContact)
  updateContact(ctx: StateContext<ContactsStateModel>, action: UpdateContact) {
    ctx.patchState({ loading: true, error: null });
    return this.contactsService.updateContact(action.id, action.payload).pipe(
      switchMap(() => {
        const state = ctx.getState();
        if (state.selectedContact && state.selectedContact.id === action.id) {
          return ctx.dispatch([new LoadContactById(action.id), new LoadContacts()]);
        }
        return ctx.dispatch(new LoadContacts());
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      }),
    );
  }

  @Action(DeleteContact)
  deleteContact(ctx: StateContext<ContactsStateModel>, action: DeleteContact) {
    ctx.patchState({ loading: true, error: null });
    return this.contactsService.deleteContact(action.id).pipe(
      switchMap(() => {
        const state = ctx.getState();
        const selectedContact =
          state.selectedContact?.id === action.id ? null : state.selectedContact;

        ctx.patchState({ selectedContact });

        // If this was the last item on a page > 1, shift back one page
        let targetPage = state.pagination.page;
        if (state.contacts.length === 1 && targetPage > 1) {
          targetPage -= 1;
        }

        return ctx.dispatch(
          new LoadContacts({
            page: targetPage,
            pageSize: state.pagination.pageSize,
            searchTerm: state.pagination.searchTerm,
          }),
        );
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return throwError(() => err);
      }),
    );
  }
}
